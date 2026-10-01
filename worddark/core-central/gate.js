import { id } from "./id.js";
export class Gate {
  constructor({gateId=id("GATE"),ownerId,layer,accepts=["REQUEST"]}={}){this.gateId=gateId;this.ownerId=ownerId;this.layer=layer;this.accepts=new Set(accepts);this.logs=[];}
  receive(packet){if(!packet?.type||!this.accepts.has(packet.type)&&!this.accepts.has("*"))return {success:false,reason:"GATE_TYPE_NOT_ALLOWED"};const receipt={id:id("REC"),gateId:this.gateId,ownerId:this.ownerId,layer:this.layer,packetId:packet.id||null,receivedAt:new Date().toISOString()};this.logs.push(receipt);return {success:true,receipt};}
  listLogs(){return [...this.logs];}
}
