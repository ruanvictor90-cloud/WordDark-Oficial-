/* WordDark Core — trusted in-process entry point for Darknet requests.
 * No HTTP endpoint. Disabled by default. Every request must pass external authorization and audit.
 */
const ALLOWED_SECTORS=new Set(["worddark","ceu","terra"]);
const ALLOWED_ACTIONS=new Set(["CAPABILITY_DISCOVERY","REQUEST_OPERATION","REQUEST_STATUS","SUBMIT_NEED"]);
function deny(status){return{success:false,status,transportStarted:false};}
function createDarknetWorldAdapter({operationCenter=null,capabilityCatalog=null,authorizeRequest=async()=>({allowed:false}),audit=async()=>{},enabled=false}={}){
  async function handle(request={}){
    const requestId=String(request.requestId||"").trim();
    const sector=String(request.sector||"").trim().toLowerCase();
    const action=String(request.action||"").trim().toUpperCase();
    if(!requestId||request.source!=="DARKNET"||request.destination!=="WORDDARK"||!ALLOWED_SECTORS.has(sector)||!ALLOWED_ACTIONS.has(action)||!request.payload||typeof request.payload!=="object"||Array.isArray(request.payload))return deny("DARKNET_WORLD_REQUEST_INVALID");
    if(!enabled)return deny("DARKNET_WORLD_ADAPTER_DISABLED");
    let decision;
    try{decision=await authorizeRequest({requestId,sector,action,approvalId:request.approvalId||null});}catch{return deny("DARKNET_WORLD_AUTHORIZATION_UNAVAILABLE");}
    if(!decision||decision.allowed!==true)return deny("DARKNET_WORLD_REQUEST_DENIED");
    try{await audit({event:"WORDDARK_DARKNET_REQUEST_ACCEPTED",requestId,sector,action,approvalId:decision.approvalId||request.approvalId||null});}
    catch{return deny("WORDDARK_DARKNET_AUDIT_UNAVAILABLE");}
    if(action==="CAPABILITY_DISCOVERY"){
      if(!capabilityCatalog||typeof capabilityCatalog.resolve!=="function")return deny("CAPABILITY_CATALOG_UNAVAILABLE");
      return{success:true,status:"CAPABILITIES_AVAILABLE",requestId,capabilities:Object.keys(capabilityCatalog.ACTION_CAPABILITIES||{}),transportStarted:false};
    }
    if(action==="REQUEST_STATUS")return{success:true,status:"WORDDARK_WORLD_STATUS",requestId,world:operationCenter?.getStatus?.()||{status:"UNAVAILABLE"},transportStarted:false};
    if(typeof operationCenter?.submit!=="function")return deny("WORDDARK_OPERATION_CENTER_UNAVAILABLE");
    if(action==="REQUEST_OPERATION"||action==="SUBMIT_NEED"){
      const payload=request.payload;
      if(!String(payload.need||payload.intent||"").trim())return deny("DARKNET_OPERATION_NEED_REQUIRED");
      try{
        const result=operationCenter.submit({need:String(payload.need||payload.intent),intent:payload.intent||null,requesterId:"DARKNET",originId:"darknet",environment:"TEST",context:{darknetRequestId:requestId,sector,source:"DARKNET"}});
        return{success:result?.success!==false,status:result?.status||"WORDDARK_OPERATION_ACCEPTED",requestId,result,transportStarted:true};
      }catch{return deny("WORDDARK_OPERATION_SUBMISSION_FAILED");}
    }
    return deny("DARKNET_WORLD_ACTION_UNSUPPORTED");
  }
  return Object.freeze({handle,getStatus:()=>({enabled:enabled===true,mode:"in-process-only",httpRoute:false,externalNetwork:false})});
}
if(typeof module!=="undefined"&&module.exports)module.exports=createDarknetWorldAdapter;
if(typeof window!=="undefined")window.createDarknetWorldAdapter=createDarknetWorldAdapter;
