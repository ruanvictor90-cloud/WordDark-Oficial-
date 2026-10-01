export class WorldRegistry {
  constructor(){this.entities=new Map();this.events=[];}
  register(entity){if(!entity?.id)throw new Error("ENTITY_ID_REQUIRED");this.entities.set(entity.id,entity);this.record("ENTITY_REGISTERED",{id:entity.id,type:entity.type||null});return entity;}
  record(type,data){this.events.push({id:this.events.length+1,type,data,at:new Date().toISOString()});}
  list(){return [...this.entities.values()];}
  eventsOf(id){return this.events.filter(e=>e.data?.id===id||e.data?.operationId===id);}
}
