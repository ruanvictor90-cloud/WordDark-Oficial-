export const LAYERS = Object.freeze({ RUAN: "ADM_RUAN", WORDDARK: "WORDDARK", OPERATIONS: "OPERATIONS" });
export const ACCESS_POLICY = Object.freeze({ version: "1.0.0", ownerLayer: LAYERS.RUAN, worldMayAdministerRuan: false, worldMayReadRuanRoot: false, worldMayInitiateConnection: false, ruanMayRequestWorldOperation: true, requireExplicitOutboundApproval: true, futureAiEnabled: false });
export function canRuanInitiate(target) { return target === LAYERS.WORDDARK || target === LAYERS.OPERATIONS; }
export function assertOutboundApproval(approved) { if (ACCESS_POLICY.requireExplicitOutboundApproval && approved !== true) throw new Error("RUAN_OUTBOUND_APPROVAL_REQUIRED"); }
export function rejectInbound(source = "unknown") { throw new Error("RUAN_INBOUND_BLOCKED: " + String(source) + " cannot initiate access to ADM/Ruan"); }
