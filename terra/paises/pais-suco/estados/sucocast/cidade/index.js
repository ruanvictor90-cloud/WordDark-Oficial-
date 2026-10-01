import { id } from "../../../../../worddark/core-central/id.js";
import { SucoCastPermissions } from "./permissions.js";

export class SucoCastCity {
  constructor({stateId="SUCOCAST",cityId="SUCOCAST-CIDADE",countryId="PAIS-SUCO"}={}){
    this.id=cityId;this.type="CIDADE";this.layer="TERRA";this.countryId=countryId;this.stateId=stateId;
    this.responsibility="STATE_OPERATING_SYSTEM";this.status="ACTIVE";
    this.gateId=`${cityId}-GATE`;this.bairroId=`${cityId}-BAIRRO`;
    this.operations=new Map();this.integrations=new Map();this.events=[];this.permissions=new SucoCastPermissions();
    this.needs=[];this.requests=[];
  }
  receiveNeed(need){if(!need?.type)throw new Error("NEED_TYPE_REQUIRED");const entry={id:id("NEED"),...need,status:"PENDING",at:new Date().toISOString()};this.needs.push(entry);this.record("NEED_REGISTERED",entry);return entry;}
  requestService(service,payload={},destination=null){
    if(!service)throw new Error("SERVICE_REQUIRED");
    const request={id:id("REQ"),origin:this.id,destination,service,payload,status:"REQUESTED",at:new Date().toISOString()};
    this.requests.push(request);this.record("SERVICE_REQUESTED",request);return request;
  }
  registerOperation(operation){if(!operation?.id)throw new Error("OPERATION_REQUIRED");this.operations.set(operation.id,operation);return operation;}
  registerIntegration(adapter){if(!adapter?.id||typeof adapter.execute!=="function")throw new Error("INVALID_INTEGRATION");this.integrations.set(adapter.id,adapter);return adapter;}
  record(type,data={}){const event={id:id("SC-EVT"),type,data,at:new Date().toISOString()};this.events.push(event);return event;}
  getOperation(operationId){return this.operations.get(operationId)||null;}
  getIntegration(integrationId){return this.integrations.get(integrationId)||null;}
  status(){return {id:this.id,type:this.type,countryId:this.countryId,stateId:this.stateId,operations:this.operations.size,integrations:this.integrations.size,needs:this.needs.length,requests:this.requests.length,events:this.events.length};}
}
