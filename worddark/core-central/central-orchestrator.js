import { Operation } from "./operation.js";

export class CentralOrchestrator{
  constructor({centralManager,runtime=null,automation=null}={}){
    if(!centralManager)throw new Error("CENTRAL_MANAGER_REQUIRED");
    this.centralManager=centralManager;this.runtime=runtime;this.automation=automation;
    this.id="CENTRAL-ORCHESTRATOR";this.status="ACTIVE";
  }
  attachAutomation(automation){this.automation=automation;return this.status();}
  attachRuntime(runtime){this.runtime=runtime;return this.status();}
  prepareSlot(scheduleId,slotId){
    const schedule=this.centralManager.listSchedules().find(item=>item.id===scheduleId);
    if(!schedule)throw new Error("SCHEDULE_NOT_FOUND");
    const slot=schedule.slots.find(item=>item.id===slotId);
    if(!slot)throw new Error("SCHEDULE_SLOT_NOT_FOUND");
    return slot.targets.map(target=>({id:slot.id+"-"+target.profileId,target,scheduleId,slotId,
      content:structuredClone(slot.content),date:slot.date,time:slot.time,status:"READY_FOR_FACTORY"}));
  }
  queueSlot(scheduleId,slotId,{priority="NORMAL"}={}){
    const jobs=this.prepareSlot(scheduleId,slotId);
    if(!this.automation)return jobs.map(job=>({...job,status:"WAITING_AUTOMATION_CONTROLLER"}));
    return jobs.map(job=>this.automation.enqueue({operationId:job.id,scheduleId,slotId,target:job.target,content:job.content,priority}));
  }
  dispatchToFactory(scheduleId,slotId,{approved=false,requesterId=null}={}){
    const jobs=this.prepareSlot(scheduleId,slotId);
    if(this.automation){
      const queued=this.queueSlot(scheduleId,slotId);
      if(!approved)return queued.map(job=>({...job,status:"WAITING_APPROVAL"}));
      return queued.map(job=>{
        const approvedJob=this.automation.approve(job.id,{requesterId});
        if(approvedJob.status!=="READY")return approvedJob;
        this.automation.updateJob(job.id,"RUNNING");
        return this._dispatchJob(jobs.find(item=>item.id===job.operationId),job.id);
      });
    }
    return jobs.map(job=>this._dispatchJob(job));
  }
  _dispatchJob(job,jobId=job.id){
    if(!this.runtime)return {...job,status:"WAITING_RUNTIME"};
    const operation=new Operation({
      id:job.id,type:"CONTENT",clientId:this.centralManager.accountManager.id,requesterId:this.centralManager.accountManager.id,
      origin:"GESTOR-CENTRAL",destination:job.target.network,service:job.content.format||"CONTENT",gateId:"DARK-FACTORY-GATE",
      payload:{taskType:job.content.format||"CONTENT",content:job.content.text||job.content.title||"",mediaUrl:job.content.mediaUrl||null,target:job.target},
      context:{scheduleId:job.scheduleId,slotId:job.slotId,profileId:job.target.profileId,network:job.target.network,
        managerId:job.target.managerId,scheduledDate:job.date,scheduledTime:job.time}
    });
    const result=this.runtime.request(operation);
    const output={...job,status:result.status,operation:result.toJSON()};
    if(this.automation)this.automation.updateJob(jobId,result.status==="COMPLETED"?"COMPLETED":"FAILED",
      {operationStatus:result.status,result:result.toJSON()});
    return output;
  }
  status(){return {id:this.id,name:"Orquestrador Central",status:this.status,runtimeAttached:Boolean(this.runtime),
    automationAttached:Boolean(this.automation),schedules:this.centralManager.listSchedules().length};}
}
