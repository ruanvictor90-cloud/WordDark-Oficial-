export function recordCommerceKnowledge({ id, source, type, data }) {
  if (!id || !source || !type || data == null) throw new Error("INVALID_KNOWLEDGE_RECORD");
  return { id, source, type, data, status: "RECORDED", createdAt: new Date().toISOString() };
}
export function createLearningRecord({ id, operationId, lesson, action }) {
  if (!id || !operationId || !lesson || !action) throw new Error("INVALID_LEARNING_RECORD");
  return { id, operationId, lesson, action, status: "READY_FOR_LIBRARY", createdAt: new Date().toISOString() };
}