export const CONNECTION_LIFECYCLE=Object.freeze({
  DISCOVERED:"discovered",
  PENDING:"pending",
  AUTHORIZED:"authorized",
  ACTIVE:"active",
  RESTRICTED:"restricted",
  REVOKED:"revoked",
  FAILED:"failed"
});

export const LEGACY_STATUS_MAP=Object.freeze({
  DISCOVERED:"discovered",
  CONFIGURED:"pending",
  AUTH_REQUIRED:"pending",
  AUTHORIZING:"pending",
  CONNECTED:"active",
  DEGRADED:"restricted",
  REVOKED:"revoked",
  ERROR:"failed"
});

export function normalizeConnectionState(status){
  const key=String(status||"").toUpperCase();
  return LEGACY_STATUS_MAP[key]||"failed";
}
