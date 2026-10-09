const PROVIDER_CAPABILITIES=Object.freeze({
  YOUTUBE:Object.freeze({
    CHANNEL_READ:Object.freeze(["https://www.googleapis.com/auth/youtube.readonly"]),
    VIDEO_UPLOAD:Object.freeze(["https://www.googleapis.com/auth/youtube.upload"])
  })
});
const TERMINAL_BLOCKED_STATUSES=new Set(["REVOKED","DISCONNECTED","ERROR","EXPIRED"]);

function grantedScopes(value){
  return new Set(String(value||"").split(/\s+/).filter(Boolean));
}

/**
 * Pure policy gate for the backend's internal operation layer.
 * Persistence is not activation: this function never turns on a capability.
 * An authenticated operator and the content-review workflow must still approve
 * an operation before a provider adapter is invoked.
 */
export function evaluateConnectionCapability({providerId,connection,scopeValue,capability,operatorApproved=false,contentReviewed=false}={}){
  const provider=String(providerId||"").toUpperCase();
  const requested=String(capability||"").toUpperCase();
  if(!connection)return {allowed:false,status:"CONNECTION_NOT_FOUND"};
  if(String(connection.providerId||"").toUpperCase()!==provider)return {allowed:false,status:"PROVIDER_MISMATCH"};
  if(TERMINAL_BLOCKED_STATUSES.has(String(connection.status||"").toUpperCase()))return {allowed:false,status:"CONNECTION_NOT_USABLE"};
  if(connection.status!=="ACTIVE")return {allowed:false,status:"CONNECTION_NOT_ACTIVE"};
  if(!operatorApproved)return {allowed:false,status:"OPERATOR_APPROVAL_REQUIRED"};
  if(!contentReviewed)return {allowed:false,status:"CONTENT_REVIEW_REQUIRED"};
  const required=PROVIDER_CAPABILITIES[provider]?.[requested];
  if(!required)return {allowed:false,status:"CAPABILITY_NOT_SUPPORTED"};
  const scopes=grantedScopes(scopeValue||connection.scope);
  if(!required.every(scope=>scopes.has(scope)))return {allowed:false,status:"REQUIRED_SCOPE_MISSING",requiredScopes:required};
  if(!(connection.capabilities||[]).includes(requested))return {allowed:false,status:"CAPABILITY_NOT_ENABLED"};
  return {allowed:true,status:"CAPABILITY_AUTHORIZED",providerId:provider,capability:requested};
}
