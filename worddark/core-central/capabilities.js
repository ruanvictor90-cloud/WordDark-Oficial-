export class CapabilityRegistry {
  constructor(){this.services=new Map();}
  register({id,name,owner,layer,handler,metadata={}}){if(!id||!owner||typeof handler!=="function")throw new Error("INVALID_CAPABILITY");this.services.set(id,{id,name:name||id,owner,layer,handler,metadata});return this.services.get(id);}
  find(service){return [...this.services.values()].find(x=>x.id===service||x.name===service)||null;}
  list(){return [...this.services.values()].map(({handler,...x})=>x);}
}
