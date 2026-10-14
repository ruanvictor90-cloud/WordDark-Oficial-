/* WordDark — backend publication authorization gate.
 * Server-only contract. It is intentionally not imported by the public HTTP server yet.
 * Every dependency fails closed; this module never reads credentials from the browser.
 */
import {createHash} from "node:crypto";

const ACTION_CAPABILITIES=Object.freeze({CONTENT_PUBLISH:"CONTENT_PUBLICATION",CONTENT_UNPUBLISH:"CONTENT_PUBLICATION",CONTENT_SCHEDULE:"CONTENT_PUBLICATION"});
const ALLOWED_ACTIONS=new Set(Object.keys(ACTION_CAPABILITIES));

function deny(status,reason){return{allowed:false,status,reason};}
function fingerprint(value){
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function requireFunction(value,name){
  if(typeof value!=="function")throw new Error("PUBLICATION_GATE_DEPENDENCY_REQUIRED:"+name);
}

function createPublicationAuthorizationGate({
  authenticateOperator,
  authorizeOperation,
  approveOperation,
  consumeQuota,
  idempotencyStore,
  audit,
  clock=()=>new Date()
}={}){
  requireFunction(authenticateOperator,"authenticateOperator");
  requireFunction(authorizeOperation,"authorizeOperation");
  requireFunction(approveOperation,"approveOperation");
  requireFunction(consumeQuota,"consumeQuota");
  if(!idempotencyStore||typeof idempotencyStore.claim!=="function"||typeof idempotencyStore.complete!=="function"){
    throw new Error("PUBLICATION_GATE_DEPENDENCY_REQUIRED:idempotencyStore");
  }
  requireFunction(audit,"audit");

  async function record(event){
    // No request payload, credentials or media bytes are ever sent to the audit sink.
    await audit({
      at:clock().toISOString(),
      type:event.type,
      status:event.status,
      requestId:event.requestId||null,
      operationId:event.operationId||null,
      providerId:event.providerId||null,
      accountId:event.accountId||null,
      operatorId:event.operatorId||null,
      approvalId:event.approvalId||null,
      idempotencyKeyHash:event.idempotencyKey?fingerprint(event.idempotencyKey):null
    });
  }

  async function authorize(input={}){
    const request=input.request||{};
    const action=String(request.action||"").toUpperCase();
    const capability=String(request.capability||"").toUpperCase();
    const base={requestId:request.requestId,operationId:request.operationId,providerId:request.providerId,accountId:request.accountId};

    if(!ALLOWED_ACTIONS.has(action)||ACTION_CAPABILITIES[action]!==capability){
      await record({...base,type:"PUBLICATION_DENIED",status:"PUBLICATION_ACTION_MISMATCH"});
      return deny("PUBLICATION_ACTION_MISMATCH","A ação de transporte precisa mapear para a capacidade canônica CONTENT_PUBLICATION.");
    }
    if(!request.requestId||!request.operationId||!request.providerId||!request.accountId){
      await record({...base,type:"PUBLICATION_DENIED",status:"PUBLICATION_CONTEXT_REQUIRED"});
      return deny("PUBLICATION_CONTEXT_REQUIRED","A solicitação precisa identificar operação, provedor e conta.");
    }
    if(request.environment!=="PROD"){
      await record({...base,type:"PUBLICATION_DENIED",status:"PRODUCTION_CONTEXT_REQUIRED"});
      return deny("PRODUCTION_CONTEXT_REQUIRED","A publicação externa exige contexto PROD aprovado.");
    }
    const idempotencyKey=String(input.idempotencyKey||"").trim();
    if(!idempotencyKey||idempotencyKey.length>200){
      await record({...base,type:"PUBLICATION_DENIED",status:"IDEMPOTENCY_KEY_REQUIRED"});
      return deny("IDEMPOTENCY_KEY_REQUIRED","Uma chave de idempotência válida é obrigatória.");
    }

    let principal;
    try{principal=await authenticateOperator(input);}
    catch{return deny("OPERATOR_AUTH_FAILED","Não foi possível autenticar o operador.");}
    if(!principal||principal.authenticated!==true||!principal.operatorId){
      await record({...base,type:"PUBLICATION_DENIED",status:"OPERATOR_AUTH_REQUIRED"});
      return deny("OPERATOR_AUTH_REQUIRED","É necessária uma identidade autenticada de operador.");
    }

    let permission;
    try{permission=await authorizeOperation({principal,request:structuredClone(request)});}
    catch{return deny("PUBLICATION_PERMISSION_CHECK_FAILED","Não foi possível validar a permissão da operação.");}
    if(!permission||permission.allowed!==true){
      await record({...base,operatorId:principal.operatorId,type:"PUBLICATION_DENIED",status:"PUBLICATION_PERMISSION_DENIED"});
      return deny("PUBLICATION_PERMISSION_DENIED","O operador não tem permissão para esta operação.");
    }

    let approval;
    try{approval=await approveOperation({principal,request:structuredClone(request)});}
    catch{return deny("PUBLICATION_APPROVAL_CHECK_FAILED","Não foi possível confirmar a aprovação.");
    }
    if(!approval||approval.allowed!==true||!approval.approvalId){
      await record({...base,operatorId:principal.operatorId,type:"PUBLICATION_DENIED",status:"PUBLICATION_APPROVAL_REQUIRED"});
      return deny("PUBLICATION_APPROVAL_REQUIRED","A operação precisa de aprovação explícita e identificável.");
    }

    const requestFingerprint=fingerprint({
      requestId:request.requestId,operationId:request.operationId,
      providerId:String(request.providerId).toUpperCase(),accountId:String(request.accountId),
      action,capability,environment:request.environment,payload:request.payload||{}
    });
    let claim;
    try{claim=await idempotencyStore.claim(idempotencyKey,{requestFingerprint,operationId:request.operationId});}
    catch{return deny("IDEMPOTENCY_STORE_UNAVAILABLE","Não foi possível registrar a chave de idempotência.");}
    if(!claim||claim.claimed!==true){
      const status=claim?.status||"DUPLICATE_PUBLICATION_REQUEST";
      await record({...base,operatorId:principal.operatorId,type:"PUBLICATION_DENIED",status});
      return deny(status,"A solicitação já foi processada ou a chave foi usada em outra operação.");
    }

    let quota;
    try{quota=await consumeQuota({principal,request:structuredClone(request)});}
    catch{quota={allowed:false};}
    if(!quota||quota.allowed!==true){
      const result=deny("PUBLICATION_QUOTA_EXCEEDED","O limite de publicações não permite executar esta operação.");
      try{await idempotencyStore.complete(idempotencyKey,{requestFingerprint,status:result.status});}catch{}
      await record({...base,operatorId:principal.operatorId,approvalId:approval.approvalId,type:"PUBLICATION_DENIED",status:result.status});
      return result;
    }

    try{
      await record({...base,operatorId:principal.operatorId,approvalId:approval.approvalId,type:"PUBLICATION_AUTHORIZED",status:"AUTHORIZED"});
    }catch{
      const result=deny("PUBLICATION_AUDIT_UNAVAILABLE","A auditoria não está disponível; a publicação foi bloqueada.");
      try{await idempotencyStore.complete(idempotencyKey,{requestFingerprint,status:result.status});}catch{}
      return result;
    }

    return{
      allowed:true,status:"AUTHORIZED",
      mode:"AUTOMATIC",
      serverAuthorized:true,
      requestId:request.requestId,
      operationId:request.operationId,
      providerId:String(request.providerId).toUpperCase(),
      accountId:String(request.accountId),
      operatorId:principal.operatorId,
      approvalId:approval.approvalId,
      idempotencyKey,
      requestFingerprint
    };
  }

  async function complete(authorization,result={}){
    if(!authorization?.allowed||!authorization.idempotencyKey||!authorization.requestFingerprint){
      return deny("PUBLICATION_AUTHORIZATION_REQUIRED","A autorização de publicação é inválida.");
    }
    const status=String(result.status||"UNKNOWN").slice(0,80);
    try{
      await idempotencyStore.complete(authorization.idempotencyKey,{
        requestFingerprint:authorization.requestFingerprint,
        status,
        externalId:result.externalId||null
      });
      await record({
        type:"PUBLICATION_FINISHED",status,
        requestId:authorization.requestId,operationId:authorization.operationId,
        providerId:authorization.providerId,accountId:authorization.accountId,
        operatorId:authorization.operatorId,approvalId:authorization.approvalId,
        idempotencyKey:authorization.idempotencyKey
      });
      return{success:true,status:"PUBLICATION_RESULT_RECORDED"};
    }catch{
      return deny("PUBLICATION_RESULT_RECORD_FAILED","Não foi possível registrar o resultado da publicação.");
    }
  }

  return Object.freeze({authorize,complete});
}

export {createPublicationAuthorizationGate};
