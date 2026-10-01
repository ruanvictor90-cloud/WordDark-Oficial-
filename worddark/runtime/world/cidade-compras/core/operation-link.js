export function linkOperationResource(operation, resourceType, resourceId) {
  if (!operation || !resourceType || !resourceId) throw new Error("INVALID_OPERATION_LINK");
  return {
    ...operation,
    resources: {
      ...(operation.resources || {}),
      [resourceType]: [...new Set([...(operation.resources?.[resourceType] || []), resourceId])]
    },
    history: [
      ...operation.history,
      { status: "RESOURCE_LINKED", resourceType, resourceId, at: new Date().toISOString() }
    ]
  };
}
