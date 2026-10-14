/**
 * Durable WordDark knowledge repository contract.
 * The adapter refuses to masquerade an in-memory store as production persistence.
 *
 * Backend requirements:
 * - durable === true: records survive process restarts.
 * - atomic === true: insertIfAbsent and compareAndSet are atomic across workers.
 * - insertIfAbsent(id, record) -> { inserted, record }
 * - get(id) -> record|null
 * - compareAndSet(id, expectedStatus, nextRecord) -> boolean
 * - listByStatus(status, {limit}) -> record[]
 * - searchValidated(query, {limit}) -> validated record[]
 * - countByStatus(status) -> number
 */
export function createDurableKnowledgeRepository({ backend = null } = {}) {
  if (!backend || backend.durable !== true || backend.atomic !== true) {
    throw new Error("DURABLE_ATOMIC_KNOWLEDGE_BACKEND_REQUIRED");
  }
  const required = ["insertIfAbsent", "get", "compareAndSet", "listByStatus", "searchValidated", "countByStatus"];
  for (const method of required) {
    if (typeof backend[method] !== "function") throw new Error("KNOWLEDGE_BACKEND_METHOD_REQUIRED:" + method);
  }
  return Object.freeze({
    durable: true,
    atomic: true,
    async insertIfAbsent(id, record) {
      const result = await backend.insertIfAbsent(id, structuredClone(record));
      if (!result || typeof result.inserted !== "boolean") throw new Error("KNOWLEDGE_BACKEND_INSERT_CONTRACT_INVALID");
      return { inserted: result.inserted, record: result.record ? structuredClone(result.record) : structuredClone(record) };
    },
    async get(id) {
      const record = await backend.get(id);
      return record ? structuredClone(record) : null;
    },
    async compareAndSet(id, expectedStatus, nextRecord) {
      return (await backend.compareAndSet(id, expectedStatus, structuredClone(nextRecord))) === true;
    },
    async listByStatus(status, { limit = 100 } = {}) {
      const rows = await backend.listByStatus(status, { limit: Math.min(Math.max(Number(limit) || 100, 1), 500) });
      if (!Array.isArray(rows)) throw new Error("KNOWLEDGE_BACKEND_LIST_CONTRACT_INVALID");
      return rows.map(row => structuredClone(row));
    },
    async searchValidated(query, { limit = 10 } = {}) {
      const rows = await backend.searchValidated(String(query ?? ""), { limit: Math.min(Math.max(Number(limit) || 10, 1), 100) });
      if (!Array.isArray(rows) || rows.some(row => row?.status !== "VALIDATED")) throw new Error("KNOWLEDGE_BACKEND_SEARCH_CONTRACT_INVALID");
      return rows.map(row => structuredClone(row));
    },
    async countByStatus(status) {
      const count = await backend.countByStatus(status);
      if (!Number.isInteger(count) || count < 0) throw new Error("KNOWLEDGE_BACKEND_COUNT_CONTRACT_INVALID");
      return count;
    },
    getStatus: () => ({ durable: true, atomic: true, backendType: String(backend.type || "injected-durable-backend") })
  });
}
