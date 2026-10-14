/* WordDark — trusted capability grant/revoke service.
 * Backend-only composition; deliberately no HTTP route or browser-facing API.
 * OAuth scope is a prerequisite, never an operational grant by itself.
 */
import {createHash} from "node:crypto";

const ALLOWED_CAPABILITIES=new Set(["CONTENT_PUBLICATION"]);
const ACTIONS=new Set(["CAPABILITY_GRANT","CAPABILITY_REVOKE"]);
const YOUTUBE_UPLOAD_SCOPES=new Set(["youtube.upload","https://www.googleapis.com/auth/youtube.upload"]);

function deny(status,reason){return{success:false,status,reason};}
function fingerprint(value){return createHash("sha256").update(JSON.stringify(value)).digest("hex");}
function requiredFunction(value,name){if(typeof value!=="function")throw new Error("CAPABILITY_SERVICE_DEPENDENCY_REQUIRED:"+name);}
function hasUploadScope(scope){
  const values=Array.isArray(scope)?scope:String(scope||"").split(/[\s,]+/);
  return values.some(value=>YOUTUBE_UPLOAD_SCOPES.has(String(value).trim()));
}

export function createCapabilityGrantService({
  connectionStore,authenticateOperator,authorizeOperation,approveOperation,
  idempotencyStore,audit,clock=()=>new Date()
}={}){
  if(!connectionStore||typeof connectionStore.load!=="function"||typeof connectionStore.setCapability!=="function")throw new Error("CAPABILITY_SERVICE_DEPENDENCY_REQUIRED:connectionStore");
  requiredFunction(authenticateOperator,"authenticateOperator");
  requiredFunction(authorizeOperation,"authorizeOperation");
  requiredFunction(approveOperation,"approveOperation");
  if(!idempotencyStore||typeof idempotencyStore.claim!=="function"||typeof idempotencyStore.complete!=="function")throw new Error("CAPABILITY_SERVICE_DEPENDENCY_REQUIRED:idempotencyStore");
  requiredFunction(audit,"audit");

  async function record(event){
    // Explicit allowlist: never send OAuth tokens, request payloads, or media to audit.
    await audit({
      at:clock().toISOString(),type:event.type,status:event.status,
      requestId:event.requestId,operationId:event.operationId,
      providerId:event.providerId,accountId:event.accountId,
      capability:event.capability,operatorId:event.operatorId,
      approvalId:event.approvalId,idempotencyKeyHash:event.idempotencyKeyHash||null
    });
  }

  async function execute(input={}){
    const request=input.request||{};
    const action=String(request.action||"").toUpperCase();
    const capability=String(request.capability||"").toUpperCase();
    const providerId=String(request.providerId||"").toUpperCase();
    const accountId=String(request.accountId||"");
    const base={requestId:request.requestId,operationId:request.operationId,providerId,accountId,capability};

    if(!ACTIONS.has(action)||!ALLOWED_CAPABILITIES.has(capability)){
      return deny("CAPABILITY_ACTION_INVALID","A ação e a capacidade não pertencem ao contrato permitido.");
    }
    if(!request.requestId||!request.operationId||!providerId||!accountId||!request.approvalRef){
      return deny("CAPABILITY_CONTEXT_REQUIRED","Operação, provedor, conta e referência de aprovação são obrigatórios.");
    }
    if(providerId!=="YOUTUBE")return deny("CAPABILITY_PROVIDER_UNSUPPORTED","Este fluxo inicial só administra capacidades YouTube.");
    const idempotencyKey=String(input.idempotencyKey||"").trim();
    if(!/^[a-zA-Z0-9._:-]{1,200}$/.test(idempotencyKey))return deny("IDEMPOTENCY_KEY_REQUIRED","É necessária uma chave de idempotência válida.");

    let principal;
    try{principal=await authenticateOperator(input);}catch{return deny("OPERATOR_AUTH_FAILED","Não foi possível autenticar o operador.");}
    if(!principal||principal.authenticated!==true||!principal.operatorId)return deny("OPERATOR_AUTH_REQUIRED","É necessária uma identidade confiável de operador.");

    let permission;
    try{permission=await authorizeOperation({principal,request:structuredClone(request)});}catch{return deny("CAPABILITY_PERMISSION_CHECK_FAILED","Não foi possível validar a permissão de gestão de capacidades.");}
    if(!permission||permission.allowed!==true)return deny("CAPABILITY_PERMISSION_DENIED","O operador não pode conceder ou revogar esta capacidade.");

    let approval;
    try{approval=await approveOperation({principal,request:structuredClone(request)});}catch{return deny("CAPABILITY_APPROVAL_CHECK_FAILED","Não foi possível confirmar a aprovação.");
    }
    if(!approval||approval.allowed!==true||!approval.approvalId||String(approval.approvalId)!==String(request.approvalRef)){
      return deny("CAPABILITY_APPROVAL_REQUIRED","A aprovação precisa estar autorizada e corresponder à referência fornecida.");
    }

    let connection;
    try{connection=await connectionStore.load({providerId,accountId});}catch{return deny("CONNECTION_STORE_UNAVAILABLE","Não foi possível consultar a conexão persistida.");}
    if(!connection||connection.providerId!==providerId||String(connection.accountId)!==accountId||connection.status!=="PERSISTED"){
      return deny("PERSISTED_CONNECTION_REQUIRED","A conta precisa existir no armazenamento confiável.");
    }
    if(action==="CAPABILITY_GRANT"&&capability==="CONTENT_PUBLICATION"&&!hasUploadScope(connection.scope)){
      return deny("OAUTH_SCOPE_REQUIRED","A conexão precisa ter o escopo YouTube upload; o escopo não concede a capacidade por si só.");
    }

    const requestFingerprint=fingerprint({requestId:request.requestId,operationId:request.operationId,providerId,accountId,action,capability,approvalId:approval.approvalId});
    let claim;
    try{claim=await idempotencyStore.claim(idempotencyKey,{requestFingerprint,operationId:String(request.operationId)});}catch{return deny("IDEMPOTENCY_STORE_UNAVAILABLE","Não foi possível registrar a operação de capacidade.");}
    if(!claim||claim.claimed!==true)return deny(claim?.status||"CAPABILITY_REQUEST_DUPLICATE","A chave de idempotência já foi usada.");

    const auditBase={...base,operatorId:principal.operatorId,approvalId:approval.approvalId,idempotencyKeyHash:fingerprint(idempotencyKey)};
    try{await record({...auditBase,type:"CAPABILITY_CHANGE_AUTHORIZED",status:"AUTHORIZED"});}
    catch{
      try{await idempotencyStore.complete(idempotencyKey,{requestFingerprint,status:"AUDIT_UNAVAILABLE"});}catch{}
      return deny("CAPABILITY_AUDIT_UNAVAILABLE","A auditoria não está disponível; nenhuma capacidade foi alterada.");
    }

    let mutation;
    try{mutation=await connectionStore.setCapability({providerId,accountId,capability,granted:action==="CAPABILITY_GRANT"});}
    catch{
      try{await idempotencyStore.complete(idempotencyKey,{requestFingerprint,status:"CAPABILITY_PERSISTENCE_FAILED"});}catch{}
      try{await record({...auditBase,type:"CAPABILITY_CHANGE_FAILED",status:"CAPABILITY_PERSISTENCE_FAILED"});}catch{}
      return deny("CAPABILITY_PERSISTENCE_FAILED","A alteração não pôde ser persistida.");
    }

    const status=action==="CAPABILITY_GRANT"?"CAPABILITY_GRANTED":"CAPABILITY_REVOKED";
    try{
      await idempotencyStore.complete(idempotencyKey,{requestFingerprint,status});
      await record({...auditBase,type:"CAPABILITY_CHANGE_FINISHED",status});
    }catch{
      // The change is durable, and the pre-change authorization event is already audited.
      return{success:true,status,warning:"CAPABILITY_RESULT_AUDIT_INCOMPLETE",capabilities:mutation.capabilities};
    }
    return{success:true,status,providerId,accountId,capability,capabilities:mutation.capabilities,approvalId:approval.approvalId};
  }

  return Object.freeze({execute});
}
