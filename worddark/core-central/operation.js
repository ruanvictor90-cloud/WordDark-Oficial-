import { id } from "./id.js";

const TERMINAL=new Set(["COMPLETED","REJECTED","CANCELLED"]);
export class Operation {
  constructor(input={}){
    this.id=input.id||id("OP");
    this.type=input.type||"REQUEST";
    this.clientId=input.clientId||null;
    this.requesterId=input.requesterId||null;
    this.origin=input.origin||null;
    this.destination=input.destination||null;
    this.service=input.service||null;
    this.gateId=input.gateId||null;
    this.payload=input.payload||{};
    this.context=input.context||{};
    this.status=input.status||"CREATED";
    this.checkpoints=Array.isArray(input.checkpoints)?structuredClone(input.checkpoints):[];
    this.history=Array.isArray(input.history)?structuredClone(input.history):[];
    this.pipeline=input.pipeline?structuredClone(input.pipeline):null;
    this.createdAt=input.createdAt||new Date().toISOString();
    this.updatedAt=new Date().toISOString();
  }
  validate(){
    const e=[];
    for(const [k,v] of Object.entries({origin:this.origin,service:this.service,gateId:this.gateId})) if(!v)e.push(k+" é obrigatório.");
    return {valid:e.length===0,errors:e};
  }
  transition(status,data={}){
    if(TERMINAL.has(this.status)) throw new Error("OPERATION_TERMINAL");
    const now=new Date().toISOString();
    this.status=status;this.updatedAt=now;
    this.history.push({status,at:now,data});
    return this;
  }
  checkpoint(module,status="PASSED",data={}){
    const now=new Date().toISOString();
    const cp={module,status,at:now,data};
    this.checkpoints=this.checkpoints.filter(x=>x.module!==module);
    this.checkpoints.push(cp);this.updatedAt=now;return cp;
  }
  lastCheckpoint(){return this.checkpoints[this.checkpoints.length-1]||null;}
  canReenter(module){return this.checkpoints.some(x=>x.module===module&&x.status==="PASSED");}
  reenter(module,reason="MODULE_REENTRY"){
    if(!module)throw new Error("MODULE_REQUIRED");
    this.status="REENTRY";this.updatedAt=new Date().toISOString();
    this.history.push({status:"REENTRY",module,reason,at:this.updatedAt});return this;
  }
  toJSON(){return structuredClone(this);}
}
export { TERMINAL };
