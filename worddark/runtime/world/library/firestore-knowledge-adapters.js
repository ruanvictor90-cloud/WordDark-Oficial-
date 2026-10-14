/**
 * Server-side Firestore adapters for WordDark's durable knowledge intake and canonical archive.
 * Firestore is injected by the trusted backend; this module never initializes credentials itself.
 */
import { createHash } from "node:crypto";

const clean = value => String(value ?? "").trim();
const hash = value => createHash("sha256").update(String(value)).digest("hex");

function requireFirestore(firestore) {
  if (!firestore || typeof firestore.collection !== "function" || typeof firestore.runTransaction !== "function") {
    throw new Error("FIRESTORE_TRANSACTIONAL_BACKEND_REQUIRED");
  }
}

export function createFirestoreKnowledgeBackend({
  firestore = null,
  collectionName = "worddarkKnowledgeIntake"
} = {}) {
  requireFirestore(firestore);
  const collection = firestore.collection(collectionName);
  const refFor = id => collection.doc(hash(id));

  return Object.freeze({
    durable: true,
    atomic: true,
    type: "google-cloud-firestore",
    async insertIfAbsent(id, record) {
      const intakeRecordId = clean(id);
      if (!intakeRecordId) throw new Error("KNOWLEDGE_INTAKE_ID_REQUIRED");
      const ref = refFor(intakeRecordId);
      return firestore.runTransaction(async tx => {
        const snapshot = await tx.get(ref);
        if (snapshot?.exists) {
          const existing = snapshot.data() || {};
          if (existing.intakeRecordId !== intakeRecordId) throw new Error("KNOWLEDGE_DOCUMENT_ID_COLLISION");
          return { inserted: false, record: existing };
        }
        const next = { ...structuredClone(record), intakeRecordId };
        tx.create(ref, next);
        return { inserted: true, record: next };
      });
    },
    async get(id) {
      const intakeRecordId = clean(id);
      if (!intakeRecordId) return null;
      const snapshot = await refFor(intakeRecordId).get();
      if (!snapshot?.exists) return null;
      const record = snapshot.data() || {};
      return record.intakeRecordId === intakeRecordId ? record : null;
    },
    async compareAndSet(id, expectedStatus, nextRecord) {
      const intakeRecordId = clean(id);
      if (!intakeRecordId) return false;
      const ref = refFor(intakeRecordId);
      return firestore.runTransaction(async tx => {
        const snapshot = await tx.get(ref);
        if (!snapshot?.exists) return false;
        const current = snapshot.data() || {};
        if (current.intakeRecordId !== intakeRecordId || current.status !== expectedStatus) return false;
        tx.set(ref, { ...structuredClone(nextRecord), intakeRecordId }, { merge: false });
        return true;
      });
    },
    async listByStatus(status, { limit = 100 } = {}) {
      const boundedLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
      const snapshot = await collection.where("status", "==", clean(status)).limit(boundedLimit).get();
      return (snapshot.docs || []).map(doc => doc.data()).filter(Boolean);
    },
    async searchValidated(query, { limit = 10 } = {}) {
      const boundedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
      const terms = clean(query).toLocaleLowerCase("pt-BR").split(/\s+/).filter(Boolean);
      const snapshot = await collection.where("status", "==", "VALIDATED").limit(500).get();
      return (snapshot.docs || [])
        .map(doc => doc.data())
        .filter(record => record?.status === "VALIDATED")
        .filter(record => !terms.length || terms.every(term =>
          [record.title, record.summary, record.metadata?.content, ...(Array.isArray(record.tags) ? record.tags : [])]
            .join(" ").toLocaleLowerCase("pt-BR").includes(term)))
        .slice(0, boundedLimit);
    },
    async countByStatus(status) {
      const snapshot = await collection.where("status", "==", clean(status)).get();
      return Number(snapshot.size ?? snapshot.docs?.length ?? 0);
    }
  });
}

/**
 * Durable/idempotent canonical knowledge archive adapter. It stores only validated
 * WordDarkKnowledgeRecord objects and uses a deterministic document ID for retries.
 */
export function createFirestoreCentralKnowledgeStore({
  firestore = null,
  collectionName = "worddarkCentralLibrary",
  libraryId = "WORDDARK-CENTRAL-LIBRARY"
} = {}) {
  requireFirestore(firestore);
  const collection = firestore.collection(collectionName);

  async function archive(record, { reason = "KNOWLEDGE_VALIDATED" } = {}) {
    if (!record || typeof record.validate !== "function" || typeof record.isValidated !== "function") {
      throw new Error("WORDDARK_KNOWLEDGE_RECORD_REQUIRED");
    }
    record.validate();
    if (!record.isValidated()) throw new Error("ONLY_VALIDATED_KNOWLEDGE_CAN_BE_ARCHIVED");
    const knowledgeId = clean(record.knowledgeId);
    if (!knowledgeId) throw new Error("KNOWLEDGE_ID_REQUIRED");
    const recordId = "KNOWLEDGE-" + knowledgeId;
    const ref = collection.doc(hash(recordId));
    const payload = {
      recordId,
      libraryId,
      type: "KNOWLEDGE",
      source: "CENTRAL_KNOWLEDGE_STORE",
      reason: clean(reason) || "KNOWLEDGE_VALIDATED",
      knowledgeId,
      data: typeof record.toJSON === "function" ? record.toJSON() : structuredClone(record),
      archivedAt: new Date().toISOString()
    };
    return firestore.runTransaction(async tx => {
      const snapshot = await tx.get(ref);
      if (snapshot?.exists) {
        const existing = snapshot.data() || {};
        if (existing.recordId !== recordId || existing.knowledgeId !== knowledgeId) {
          throw new Error("CENTRAL_KNOWLEDGE_DOCUMENT_ID_COLLISION");
        }
        return existing;
      }
      tx.create(ref, payload);
      return payload;
    });
  }

  return Object.freeze({
    durable: true,
    idempotent: true,
    archive,
    async get(knowledgeId) {
      const recordId = "KNOWLEDGE-" + clean(knowledgeId);
      const snapshot = await collection.doc(hash(recordId)).get();
      if (!snapshot?.exists) return null;
      const record = snapshot.data() || {};
      return record.recordId === recordId ? record : null;
    },
    async list({ limit = 100 } = {}) {
      const snapshot = await collection.where("type", "==", "KNOWLEDGE").limit(Math.min(Math.max(Number(limit) || 100, 1), 500)).get();
      return (snapshot.docs || []).map(doc => doc.data()).filter(Boolean);
    },
    getStatus: () => ({ durable: true, idempotent: true, backendType: "google-cloud-firestore", collectionName, libraryId })
  });
}
