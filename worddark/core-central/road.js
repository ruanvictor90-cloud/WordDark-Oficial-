import { id } from "./id.js";
export class Road {
  constructor({registry}){this.registry=registry;this.deliveries=[];}
  route(operation){const cap=this.registry.find(operation.service);if(!cap)return {success:false,status:"CAPABILITY_NOT_FOUND",reason:"Nenhuma capacidade ativa para o serviço.",operationId:operation.id};const delivery={id:id("DLV"),operationId:operation.id,owner:cap.owner,layer:cap.layer,service:cap.id,status:"ROUTED",at:new Date().toISOString()};this.deliveries.push(delivery);return {success:true,capability:cap,delivery};}
  list(){return [...this.deliveries];}
}
