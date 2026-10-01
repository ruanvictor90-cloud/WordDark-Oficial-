import { id } from "../../../../../worddark/core-central/id.js";

export class SucoCastCity {
  constructor({stateId="SUCOCAST",cityId="SUCOCAST-CIDADE"}={}){this.id=cityId;this.type="CIDADE";this.stateId=stateId;this.responsibility="STATE_OPERATING_SYSTEM";this.status="ACTIVE";this.gateId=`${cityId}-GATE`;this.bairroId=`${cityId}-BAIRRO`;this.operations=new Map();this.integrations=new Map();this.events=[];}
  registerOperation(operation){if(!operation?.id)throw new Error("OPERATION_REQUIRED");this.operations.set(operation.id,operation);return operation;}
  registerIntegration(adapter){if(!adapter?.id||typeof adapter.execute!=="function")throw new Error("INVALID_INTEGRATION");this.integrations.set(adapter.id,adapter);return adapter;}
  record(type,data={}){const event={id:id("SC-EVT"),type,data,at:new Date().toISOString()};this.events.push(event);return event;}
  getOperation(operationId){return this.operations.get(operationId)||null;}
  getIntegration(integrationId){return this.integrations.get(integrationId)||null;}
  status(){return {id:this.id,type:this.type,stateId:this.stateId,operations:this.operations.size,integrations:this.integrations.size,events:this.events.length};}
}
