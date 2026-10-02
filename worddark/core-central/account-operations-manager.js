import { id } from './id.js';

export const CENTRAL_OPERATION_STATUS = Object.freeze([
  'DRAFT','SCHEDULED','DISPATCHED','RUNNING','COMPLETED','PARTIAL','BLOCKED','CANCELLED'
]);

export class AccountOperationsManager{
  constructor({accountManager}={}){
    if(!accountManager)throw new Error('ACCOUNT_MANAGER_REQUIRED');
    this.accountManager=accountManager;
    this.id='ACCOUNT-OPERATIONS-MANAGER';
    this.name='Gestor Central da Conta';
    this.status='ACTIVE';
    this.schedules=[];
  }

  listTargets(profileIds=null){
    const profiles=this.accountManager.listProfiles();
    return (profileIds
      ? profiles.filter(profile=>profileIds.includes(profile.id))
      : profiles.filter(profile=>profile.status!=='ARCHIVED')
    ).map(profile=>({profileId:profile.id,network:profile.network,profileName:profile.displayName,managerId:profile.managerId,status:'PENDING'}));
  }

  createBroadcastOperation({type='CONTENT',content={},profileIds=null,requirements=[]}={}){
    const targets=this.listTargets(profileIds);
    if(!targets.length)throw new Error('NO_TARGET_PROFILES');
    const operation={
      id:id('BROADCAST-OP'),type,mode:'BROADCAST',
      accountId:this.accountManager.id,accountName:this.accountManager.name,
      sourceManagerId:this.id,content:structuredClone(content),requirements:structuredClone(requirements),
      status:'DRAFT',targets,createdAt:new Date().toISOString()
    };
    this.accountManager.record('BROADCAST_OPERATION_CREATED',operation);
    return operation;
  }

  createContentSchedule({contents=[],profileIds=null,postsPerDay=1,dates=[],startDate=null,times=[],type='CONTENT',options={}}={}){
    if(!Array.isArray(contents)||!contents.length)throw new Error('SCHEDULE_CONTENTS_REQUIRED');
    if(!Number.isInteger(postsPerDay)||postsPerDay<1)throw new Error('POSTS_PER_DAY_INVALID');
    const targets=this.listTargets(profileIds);
    if(!targets.length)throw new Error('NO_TARGET_PROFILES');
    const days=[...new Set((dates||[]).filter(Boolean).map(String))];
    if(!days.length&&startDate)days.push(String(startDate));
    if(!days.length)throw new Error('SCHEDULE_DATES_REQUIRED');

    const slots=[]; let contentIndex=0;
    for(const date of days){
      for(let slot=0;slot<postsPerDay&&contentIndex<contents.length;slot++){
        const content=contents[contentIndex++];
        slots.push({
          id:id('SLOT'),date,slot:slot+1,time:times[slot]||null,contentIndex,content:structuredClone(content),
          status:'SCHEDULED',targets:targets.map(target=>({...target,status:'SCHEDULED'}))
        });
      }
    }

    const schedule={
      id:id('SCHEDULE'),type,mode:'SCHEDULE',
      accountId:this.accountManager.id,accountName:this.accountManager.name,
      sourceManagerId:this.id,postsPerDay,dates:days,times:structuredClone(times),totalContents:contents.length,
      scheduledContents:slots.length,unscheduledContents:Math.max(contents.length-slots.length,0),
      targets,slots,options:structuredClone(options),
      status:slots.length?'SCHEDULED':'DRAFT',
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    };
    this.schedules.push(schedule);
    this.accountManager.record('CONTENT_SCHEDULE_CREATED',schedule);
    return structuredClone(schedule);
  }

  dispatchScheduledSlot(scheduleId,slotId){
    const schedule=this.schedules.find(item=>item.id===scheduleId);
    if(!schedule)throw new Error('SCHEDULE_NOT_FOUND');
    const slot=schedule.slots.find(item=>item.id===slotId);
    if(!slot)throw new Error('SCHEDULE_SLOT_NOT_FOUND');
    slot.status='DISPATCHED';
    slot.targets=slot.targets.map(target=>({...target,status:'QUEUED'}));
    schedule.updatedAt=new Date().toISOString();
    this.accountManager.record('SCHEDULE_SLOT_DISPATCHED',{scheduleId,slotId});
    return structuredClone(slot);
  }

  dispatch(operation){
    if(!operation?.id)throw new Error('BROADCAST_OPERATION_REQUIRED');
    const dispatched=structuredClone(operation);
    dispatched.status='DISPATCHED';
    dispatched.targets=dispatched.targets.map(target=>({...target,status:'QUEUED'}));
    this.accountManager.record('BROADCAST_OPERATION_DISPATCHED',dispatched);
    return dispatched;
  }

  listSchedules(){return this.schedules.map(structuredClone);}

  status(){
    return {id:this.id,name:this.name,role:'ACCOUNT_OPERATIONS_MANAGER',status:this.status,
      managedProfiles:this.accountManager.listProfiles().length,schedules:this.schedules.length};
  }
}
