/**
 * Firestore-backed control primitives shared by Ruan Hub and Terra/Core bridges.
 *
 * The caller injects a trusted Firestore instance; this module does not initialize
 * cloud credentials, expose HTTP routes, or activate any integration by itself.
 * Idempotency claims are atomic. The callback runs outside the transaction, so a
 * process crash can leave IN_PROGRESS; duplicates are blocked until an operator
 * reviews that state instead of automatically repeating a possibly completed action.
 */
import { createHash } from "node:crypto";

const SAFE_ID = /^[A-Za-z0-9._:-]{1,200}$/;
const SECRET_KEY = /token|secret|credential|authorization|ciphertext|password|api[-_]?key|private.?key/i;
const AUDIT_FIELDS = new Set([
  "event", "type", "status", "actorId", "reviewerId", "operatorId", "sessionId",
  "requestId", "operationId", "approvalId", "recordId", "demandId", "leadId",
  "orderId", "providerId", "accountId", "action", "capability", "environment",
  "resultStatus", "reason", "at"
]);
const clean = value => String(value ?? "").trim();
const hash = value => createHash("sha256").update(String(value)).digest("hex");

function safeValue(value, depth = 0) {
  if (depth > 8) return null;
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") return value.slice(0, 20000);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.slice(0, 100).map(item => safeValue(item, depth + 1));
  if (!value || typeof value !== "object") return null;
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) continue;
    output[key] = safeValue(item, depth + 1);
  }
  return output;
}

function requireFirestore(firestore) {
  if (!firestore || typeof firestore.collection !== "function" ||
      typeof firestore.runTransaction !== "function") {
    throw new Error("FIRESTORE_TRANSACTIONAL_BACKEND_REQUIRED");
  }
}

export function createFirestoreOperationControlStore({
  firestore = null,
  idempotencyCollectionName = "worddarkOperationIdempotency",
  auditCollectionName = "worddarkOperationAudit",
  now = () => new Date().toISOString()
} = {}) {
  requireFirestore(firestore);
  const idempotency = firestore.collection(idempotencyCollectionName);
  const auditCollection = firestore.collection(auditCollectionName);

  async function executeOnce(key, callback, { fingerprint } = {}) {
    const id = clean(key);
    if (!SAFE_ID.test(id)) throw new Error("IDEMPOTENCY_KEY_INVALID");
    if (typeof callback !== "function") throw new Error("IDEMPOTENCY_CALLBACK_REQUIRED");
    if (typeof fingerprint !== "string" || !fingerprint.trim()) throw new Error("IDEMPOTENCY_FINGERPRINT_REQUIRED");
    const fingerprintHash = hash(fingerprint);
    const ref = idempotency.doc(hash(id));
    let claim;

    try {
      claim = await firestore.runTransaction(async tx => {
        const snapshot = await tx.get(ref);
        if (snapshot?.exists) {
          const prior = snapshot.data() || {};
          if (prior.keyHash !== hash(id) || prior.fingerprintHash !== fingerprintHash) {
            return { claimed: false, conflict: true };
          }
          if (prior.status === "COMPLETED" || prior.status === "FAILED") {
            return { claimed: false, completed: true, result: prior.result };
          }
          return { claimed: false, inProgress: true };
        }
        tx.create(ref, {
          keyHash: hash(id),
          fingerprintHash,
          status: "IN_PROGRESS",
          createdAt: now(),
          updatedAt: now(),
          result: null
        });
        return { claimed: true };
      });
    } catch {
      const error = new Error("IDEMPOTENCY_CLAIM_FAILED");
      error.code = "IDEMPOTENCY_STORE_UNAVAILABLE";
      throw error;
    }

    if (claim?.conflict) {
      const error = new Error("IDEMPOTENCY_CONFLICT");
      error.code = "IDEMPOTENCY_CONFLICT";
      throw error;
    }
    if (claim?.completed) return safeValue(claim.result);
    if (claim?.inProgress || claim?.claimed !== true) {
      return { success: false, status: "IDEMPOTENCY_IN_PROGRESS" };
    }

    let result;
    let finalStatus = "COMPLETED";
    try {
      result = safeValue(await callback());
      if (result === null || typeof result !== "object") result = { success: true, value: result };
    } catch {
      finalStatus = "FAILED";
      result = { success: false, status: "IDEMPOTENCY_CALLBACK_FAILED" };
    }

    try {
      await firestore.runTransaction(async tx => {
        const snapshot = await tx.get(ref);
        if (!snapshot?.exists) throw new Error("IDEMPOTENCY_CLAIM_MISSING");
        const prior = snapshot.data() || {};
        if (prior.fingerprintHash !== fingerprintHash || prior.status !== "IN_PROGRESS") {
          throw new Error("IDEMPOTENCY_CLAIM_STATE_CONFLICT");
        }
        tx.set(ref, { ...prior, status: finalStatus, result, updatedAt: now() }, { merge: false });
      });
    } catch {
      // Do not retry the callback: its side effect may already have occurred.
      return { success: false, status: "IDEMPOTENCY_RESULT_PERSIST_FAILED", recoveryRequired: true };
    }
    return safeValue(result);
  }

  async function audit(event = {}) {
    const record = { at: now() };
    for (const key of AUDIT_FIELDS) {
      if (key === "at" && event.at == null) continue;
      const value = event[key];
      if (["string", "number", "boolean"].includes(typeof value)) {
        record[key] = typeof value === "string" ? value.slice(0, key === "reason" ? 500 : 240) : value;
      }
    }
    const ref = auditCollection.doc();
    await ref.create(record);
    return { recorded: true, auditId: ref.id || null };
  }
  audit.durable = true;
  audit.appendOnly = true;

  return Object.freeze({
    idempotencyStore: Object.freeze({
      durable: true,
      atomic: true,
      executeOnce
    }),
    audit,
    getStatus: () => ({
      durable: true,
      atomicIdempotency: true,
      appendOnlyAudit: true,
      idempotencyCollectionName,
      auditCollectionName,
      automaticRecovery: false
    })
  });
}
