import { Operation } from './operation.js';

export class CentralOrchestrator{
  constructor({centralManager,runtime=null}={}){
    if(!centralManager)throw new Error('CENTRAL_MANAGER_REQUIRED');
    this.centralManager=centralManager;
    this.runtime=runtime;
    this.id='CENTRAL-ORCHESTRATOR';
    this.status='ACTIVE';
  }

  attachRuntime(runtime){
    this.runtime=runtime;
    return this.status();
  }

  prepareSlot(scheduleId,slotId){
    const schedule=this.centralManager.listSchedules().find(item=>item.id===scheduleId);
    if(!schedule)throw new Error('SCHEDULE_NOT_FOUND');
    const slot=schedule.slots.find(item=>item.id===slotId);
    if(!slot)throw new Error('SCHEDULE_SLOT_NOT_FOUND');

    return slot.targets.map(target=>({
      id:slot.id+'-'+target.profileId,
      target,
      scheduleId,
      slotId,
      content:structuredClone(slot.content),
      date:slot.date,
      time:slot.time,
      status:'READY_FOR_FACTORY'
    }));
  }

  dispatchToFactory(scheduleId,slotId){
    const jobs=this.prepareSlot(scheduleId,slotId);
    if(!this.runtime){
      return jobs.map(job=>({...job,status:'WAITING_RUNTIME'}));
    }

    return jobs.map(job=>{
      const operation=new Operation({
        id:job.id,
        type:'CONTENT',
        clientId:this.centralManager.accountManager.id,
        requesterId:this.centralManager.accountManager.id,
        origin:'GESTOR-CENTRAL',
        destination:job.target.network,
        service:job.content.format||'CONTENT',
        gateId:'DARK-FACTORY-GATE',
        payload:{
          taskType:job.content.format||'CONTENT',
          content:job.content.text||job.content.title||'',
          mediaUrl:job.content.mediaUrl||null,
          target:job.target
        },
        context:{
          scheduleId,slotId,
          profileId:job.target.profileId,
          network:job.target.network,
          managerId:job.target.managerId,
          scheduledDate:job.date,
          scheduledTime:job.time
        }
      });
      const result=this.runtime.request(operation);
      return {...job,status:result.status,operation:result.toJSON()};
    });
  }

  status(){
    return {
      id:this.id,
      name:'Orquestrador Central',
      status:this.status,
      runtimeAttached:Boolean(this.runtime),
      schedules:this.centralManager.listSchedules().length
    };
  }
}
