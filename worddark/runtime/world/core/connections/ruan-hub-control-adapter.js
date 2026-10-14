/* WordDark Core — authenticated control boundary for the Ruan Hub.
 * Transport-neutral. No HTTP route is registered here. Disabled by default.
 * Production activation requires trusted server identity, persistent audit and atomic idempotency.
 */
const ALLOWED_ACTIONS=new Set(["SUBMIT_NEED","REQUEST_STATUS","CAPABILITY_DISCOVERY"]);
const deny=status=>({success:false,status,worldAccepted:false});
function createRuanHubControlAdapter({operationCenter=null,capabilityCatalog=null,authorizeRequest=async()=>({allowed:false}),audit=async()=>{throw new Error("AUDIT_UNAVAILABLE")},idempotencyStore=null,enabled=false}={}){
 async function handle(request={},trustedContext=null){
  const requestId=String(request.requestId||"").trim();
  const action=String(request.action||"").trim().toUpperCase();
  const need=String(request.need||request.intent||"").trim();
  if(!requestId||requestId.length>160||request.source!=="RUAN_HUB"||request.destination!=="WORDDARK"||!ALLOWED_ACTIONS.has(action))return deny("HUB_CONTROL_REQUEST_INVALID");
  if(action==="SUBMIT_NEED"&&(!need||need.length>4000))return deny("HUB_CONTROL_NEED_REQUIRED");
  if(!enabled)return deny("HUB_CONTROL_ADAPTER_DISABLED");
  const actorId=String(trustedContext?.actorId||"").trim();
  const sessionId=String(trustedContext?.sessionId||"").trim();
  if(!actorId||!sessionId||trustedContext?.authenticated!==true)return deny("HUB_CONTROL_TRUSTED_IDENTITY_REQUIRED");
  let decision;
  try{decision=await authorizeRequest({actorId,sessionId,requestId,action,approvalId:request.approvalId||null});}
  catch{return deny("HUB_CONTROL_AUTHORIZATION_UNAVAILABLE");}
  if(!decision||decision.allowed!==true)return deny("HUB_CONTROL_REQUEST_DENIED");
  if(action==="SUBMIT_NEED"&&(!String(decision.approvalId||"").trim()||decision.approved!==true))return deny("HUB_CONTROL_APPROVAL_REQUIRED");
  if(typeof idempotencyStore?.executeOnce!=="function")return deny("HUB_CONTROL_IDEMPOTENCY_UNAVAILABLE");
  if(typeof audit!=="function")return deny("HUB_CONTROL_AUDIT_UNAVAILABLE");
  try{await audit({event:"RUAN_HUB_CONTROL_REQUEST_AUTHORIZED",actorId,sessionId,requestId,action,approvalId:decision.approvalId||null});}
  catch{return deny("HUB_CONTROL_AUDIT_UNAVAILABLE");}
  try{
   return await idempotencyStore.executeOnce("RUAN_HUB:"+requestId,async()=>{
    if(action==="CAPABILITY_DISCOVERY"){
     if(!capabilityCatalog||typeof capabilityCatalog.listPublic!=="function")return deny("HUB_CONTROL_CAPABILITY_CATALOG_UNAVAILABLE");
     return{success:true,status:"CAPABILITIES_AVAILABLE",requestId,capabilities:capabilityCatalog.listPublic(),worldAccepted:false};
    }
    if(action==="REQUEST_STATUS"){
     if(typeof operationCenter?.getStatus!=="function")return deny("HUB_CONTROL_STATUS_UNAVAILABLE");
     return{success:true,status:"WORDDARK_STATUS",requestId,world:operationCenter.getStatus(),worldAccepted:false};
    }
    if(typeof operationCenter?.submit!=="function")return deny("HUB_CONTROL_OPERATION_CENTER_UNAVAILABLE");
    let result;
    try{result=operationCenter.submit({text:need,goal:need,intent:request.intent||need,requesterId:actorId,originId:"ruan-hub",environment:"TEST",context:{hubRequestId:requestId,source:"RUAN_HUB",approvalId:decision.approvalId}});}
    catch{return deny("HUB_CONTROL_SUBMISSION_FAILED");}
    const accepted=result?.success===true;
    const response={success:accepted,status:accepted?(result.status||"OPERATION_ACCEPTED"):(result.status||"OPERATION_REJECTED"),requestId,operationId:result.operationId||result.meta?.operationId||null,result,worldAccepted:accepted,environment:"TEST"};
    try{await audit({event:accepted?"RUAN_HUB_OPERATION_SUBMITTED":"RUAN_HUB_OPERATION_REJECTED",actorId,sessionId,requestId,action,approvalId:decision.approvalId,operationId:response.operationId,status:response.status});}
    catch{return deny("HUB_CONTROL_RESULT_AUDIT_UNAVAILABLE");}
    return response;
   });
  }catch(error){return deny(error?.code==="IDEMPOTENCY_CONFLICT"?"HUB_CONTROL_IDEMPOTENCY_CONFLICT":"HUB_CONTROL_IDEMPOTENCY_FAILED");}
 }
 return Object.freeze({handle,getStatus:()=>({enabled:enabled===true,transport:"injected",httpRoute:false,externalNetwork:false,environment:"TEST",requiresTrustedIdentity:true,requiresPersistentAudit:true,requiresAtomicIdempotency:true})});
}
if(typeof window!=="undefined")window.createRuanHubControlAdapter=createRuanHubControlAdapter;
export { createRuanHubControlAdapter };
export default createRuanHubControlAdapter;
