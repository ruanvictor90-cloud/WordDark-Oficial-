export class AuditLog {
  constructor(){ this.events=[]; }
  record(type,data={},actorId=null){
    const event={id:this.events.length+1,type,data:structuredClone(data),actorId,at:new Date().toISOString()};
    this.events.push(event); return structuredClone(event);
  }
  list(filter={}){ return this.events.filter(event=>Object.entries(filter).every(([k,v])=>event[k]===v)).map(event=>structuredClone(event)); }
  forEntity(entityId){ return this.events.filter(event=>event.data?.id===entityId||event.data?.operationId===entityId).map(structuredClone); }
}
