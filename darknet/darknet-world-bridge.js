/**
 * Darknet ↔ WordDark handoff. The bridge is an in-process port contract only.
 * It never imports Ruan, opens network transport, or enables world execution.
 */
const clean=value=>String(value??"").trim();
const SECTORS=new Set(["worddark","ceu","terra"]);
const SAFE_ACTIONS=new Set(["CAPABILITY_DISCOVERY","REQUEST_OPERATION","REQUEST_STATUS","SUBMIT_NEED"]);

export function createWorldBridge({worldPort=null,enabled=false,authorizeRequest=async()=>({allowed:false}),audit=async()=>{}}={}){
  async function request(input={}){
    const requestId=clean(input.requestId),sector=clean(input.sector).toLowerCase(),action=clean(input.action).toUpperCase();
    if(!requestId||!SECTORS.has(sector)||!SAFE_ACTIONS.has(action)||!input.payload||typeof input.payload!=="object"||Array.isArray(input.payload)){
      return{success:false,status:"DARKNET_REQUEST_INVALID",transportStarted:false};
    }
    if(!enabled)return{success:false,status:"DARKNET_WORLD_BRIDGE_DISABLED",transportStarted:false,requestId};
    if(typeof worldPort?.handle!=="function")return{success:false,status:"WORDDARK_WORLD_PORT_UNAVAILABLE",transportStarted:false,requestId};
    let decision;
    try{decision=await authorizeRequest({principal:input.principal||null,request:{requestId,sector,action,payload:input.payload}});}
    catch{return{success:false,status:"DARKNET_AUTHORIZATION_UNAVAILABLE",transportStarted:false,requestId};}
    if(!decision||decision.allowed!==true)return{success:false,status:"DARKNET_REQUEST_DENIED",transportStarted:false,requestId};
    const safeRequest={requestId,source:"DARKNET",destination:"WORDDARK",sector,action,payload:structuredClone(input.payload),approvalId:decision.approvalId||null};
    try{await audit({event:"DARKNET_WORLD_REQUEST_AUTHORIZED",requestId,sector,action,approvalId:decision.approvalId||null});}
    catch{return{success:false,status:"DARKNET_AUDIT_UNAVAILABLE",transportStarted:false,requestId};}
    try{
      const result=await worldPort.handle(safeRequest);
      return{success:result?.success!==false,status:result?.status||"WORDDARK_REQUEST_HANDLED",requestId,result,transportStarted:true};
    }catch{
      try{await audit({event:"DARKNET_WORLD_REQUEST_FAILED",requestId,sector,action});}catch{}
      return{success:false,status:"WORDDARK_WORLD_REQUEST_FAILED",requestId,transportStarted:true};
    }
  }
  return Object.freeze({request,getStatus:()=>({enabled:enabled===true,transport:"in-process-port",networkAccess:false,worldRuntimeAccess:enabled===true})});
}
