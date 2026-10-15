import { createHash } from "node:crypto";

const digest = value => createHash("sha256").update(value, "utf8").digest("hex");

/**
 * Firestore Admin SDK adapter. Inject the server-side Firestore instance;
 * never construct it from browser input or expose service credentials.
 *
 * All writes (intake, idempotency record, audit event) commit in one transaction.
 */
export function createFirestoreCommercialIntakeStore({
  firestore,
  collections = {},
  idFactory
} = {}) {
  if (!firestore || typeof firestore.collection !== "function" ||
      typeof firestore.runTransaction !== "function") {
    throw new Error("FIRESTORE_ADMIN_INSTANCE_REQUIRED");
  }
  const names = {
    intakes: collections.intakes || "commercialIntakes",
    idempotency: collections.idempotency || "commercialIdempotency",
    audit: collections.audit || "commercialAudit"
  };
  if (Object.values(names).some(name => typeof name !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{0,99}$/.test(name))) {
    throw new Error("INVALID_FIRESTORE_COLLECTION_NAME");
  }
  const makeId = typeof idFactory === "function"
    ? idFactory
    : () => firestore.collection(names.audit).doc().id;

  return {
    async createIntakeOnce({ idempotencyKey, intake, auditEvent } = {}) {
      if (typeof idempotencyKey !== "string" || !/^[A-Za-z0-9._:-]{8,160}$/.test(idempotencyKey)) {
        throw new Error("INVALID_IDEMPOTENCY_KEY");
      }
      if (!intake || typeof intake.intakeId !== "string" ||
          typeof intake.receivedAt !== "string" || intake.status !== "RECEIVED") {
        throw new Error("INVALID_COMMERCIAL_INTAKE");
      }
      if (!auditEvent || auditEvent.event !== "COMMERCIAL_INTAKE_RECEIVED" ||
          auditEvent.intakeId !== intake.intakeId) {
        throw new Error("INVALID_COMMERCIAL_AUDIT_EVENT");
      }

      const payloadHash = digest(JSON.stringify({
        contactName: intake.contactName,
        contactMethod: intake.contactMethod,
        need: intake.need,
        category: intake.category,
        consent: intake.consent
      }));
      const idempotencyDocId = digest("commercial-intake:" + idempotencyKey);
      const intakeRef = firestore.collection(names.intakes).doc(intake.intakeId);
      const idempotencyRef = firestore.collection(names.idempotency).doc(idempotencyDocId);
      const auditRef = firestore.collection(names.audit).doc(makeId());

      return firestore.runTransaction(async transaction => {
        const existingSnapshot = await transaction.get(idempotencyRef);
        if (existingSnapshot.exists) {
          const existing = existingSnapshot.data();
          if (existing.payloadHash !== payloadHash) {
            const error = new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD");
            error.code = "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD";
            throw error;
          }
          return { intake: existing.intake, created: false };
        }

        const record = {
          intakeId: intake.intakeId,
          status: "RECEIVED",
          contactName: intake.contactName,
          contactMethod: intake.contactMethod,
          need: intake.need,
          category: intake.category,
          consent: true,
          receivedAt: intake.receivedAt,
          requestId: intake.requestId
        };
        transaction.create(intakeRef, record);
        transaction.create(idempotencyRef, {
          action: "commercial-intake",
          payloadHash,
          intakeId: intake.intakeId,
          intake: record,
          createdAt: intake.receivedAt
        });
        transaction.create(auditRef, {
          ...auditEvent,
          auditId: auditRef.id,
          objectType: "commercialIntake",
          createdAt: auditEvent.at
        });
        return { intake: record, created: true };
      });
    }
  };
}
