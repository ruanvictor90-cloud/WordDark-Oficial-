import { id } from "./id.js";

export const AUTOMATION_MODE=Object.freeze({
  PREPARED:"PREPARED",
  ENABLED:"ENABLED",
  PAUSED:"PAUSED",
  STOPPED:"STOPPED"
});

export const JOB_STATUS=Object.freeze([
  "QUEUED","WAITING_APPROVAL","READY","RUNNING","COMPLETED","FAILED","BLOCKED","CANCELLED"
]);

export class CentralAutomationController{
  constructor({accountManager,emergencyStop=null}={}){
    if(!accountManager)throw new Error("ACCOUNT_MANAGER_REQUIRED");
    this.accountManager=accountManager;
    this.emergencyStop=emergencyStop;
    this.id="CENTRAL-AUTOMATION-CONTROLLER";
    this.mode=AUTOMATION_MODE.PREPARED;
    this.approvalRequired=true;
    this.queue=[];
    this.events=[];
  }
  configure({enabled=false,approvalRequired=true}={}){
    if(this.mode===AUTOMATION_MODE.STOPPED)throw new Error("AUTOMATION_STOPPED");
    this.approvalRequired=approvalRequired!==false;
    this.mode=enabled?AUTOMATION_MODE.ENABLED:AUTOMATION_MODE.PREPARED;
    return this.status();
  }
  enqueue({operationId,scheduleId=null,slotId=null,target,content,priority="NORMAL"}={}){
    if(!operationId||!target?.profileId)throw new Error("AUTOMATION_JOB_INVALID");
    const job={id:id("JOB"),operationId,scheduleId,slotId,target:structuredClone(target),
      content:structuredClone(content||{}),priority,status:"QUEUED",approval:this.approvalRequired?"REQUIRED":"NOT_REQUIRED",
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    this.queue.push(job);this.events.push({type:"JOB_QUEUED",jobId:job.id,at:job.createdAt});
    return structuredClone(job);
  }
  approve(jobId,{requesterId=null}={}){
    const job=this.queue.find(x=>x.id===jobId);if(!job)throw new Error("AUTOMATION_JOB_NOT_FOUND");
    this.assertNotStopped(job.operationId);
    if(!this.approvalRequired){job.status="READY";job.approval="NOT_REQUIRED";}
    else{job.status="READY";job.approval="APPROVED";job.approvedBy=requesterId;job.approvedAt=new Date().toISOString();}
    job.updatedAt=new Date().toISOString();return structuredClone(job);
  }
  assertNotStopped(operationId){
    if(this.mode===AUTOMATION_MODE.STOPPED)throw new Error("AUTOMATION_STOPPED");
    const check=this.emergencyStop?.assertRunning?.(operationId);
    if(check&&!check.allowed)throw new Error(check.reason);
  }
  pause(){if(this.mode!==AUTOMATION_MODE.STOPPED)this.mode=AUTOMATION_MODE.PAUSED;return this.status();}
  resume(){if(this.mode===AUTOMATION_MODE.PAUSED)this.mode=AUTOMATION_MODE.ENABLED;return this.status();}
  stop({reason="Parada de segurança solicitada.",requesterId=null}={}){
    this.mode=AUTOMATION_MODE.STOPPED;
    for(const job of this.queue)if(["QUEUED","WAITING_APPROVAL","READY"].includes(job.status)){job.status="BLOCKED";job.updatedAt=new Date().toISOString();}
    this.events.push({type:"AUTOMATION_STOPPED",reason,requesterId,at:new Date().toISOString()});
    return this.status();
  }
  release(){
    if(this.mode==="STOPPED")this.mode=AUTOMATION_MODE.PAUSED;
    return this.status();
  }
  nextReady(){
    if(this.mode!==AUTOMATION_MODE.ENABLED)return null;
    const ready=this.queue.filter(job=>job.status==="READY");
    ready.sort((a,b)=>({HIGH:0,NORMAL:1,LOW:2}[a.priority]??1)-({HIGH:0,NORMAL:1,LOW:2}[b.priority]??1));
    return ready[0]?structuredClone(ready[0]):null;
  }
  updateJob(jobId,status,data={}){
    if(!JOB_STATUS.includes(status))throw new Error("AUTOMATION_JOB_STATUS_INVALID");
    const job=this.queue.find(x=>x.id===jobId);if(!job)throw new Error("AUTOMATION_JOB_NOT_FOUND");
    if(status==="RUNNING")this.assertNotStopped(job.operationId);
    job.status=status;Object.assign(job,data);job.updatedAt=new Date().toISOString();
    this.events.push({type:"JOB_"+status,jobId,at:job.updatedAt,data:structuredClone(data)});
    return structuredClone(job);
  }
  listQueue(){return this.queue.map(structuredClone);}
  status(){return {id:this.id,mode:this.mode,automationEnabled:this.mode==="ENABLED",
    approvalRequired:this.approvalRequired,queue:this.queue.length,
    queued:this.queue.filter(x=>x.status==="QUEUED").length,
    ready:this.queue.filter(x=>x.status==="READY").length,
    running:this.queue.filter(x=>x.status==="RUNNING").length,
    failed:this.queue.filter(x=>x.status==="FAILED").length,
    blocked:this.queue.filter(x=>x.status==="BLOCKED").length};}
}
