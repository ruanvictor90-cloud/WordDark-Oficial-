export class InformationBoundary{
  constructor({registry,policy,audit=null}={}){if(!registry||!policy)throw new Error("INFORMATION_BOUNDARY_COMPONENTS_REQUIRED");this.registry=registry;this.policy=policy;this.audit=audit;this.id="WORLD-INFORMATION-BOUNDARY";}
  receive({connectionId,capability,payload={},metadata={},approved=false,subjectId=null,resourceId="*" }={}){
    const connection=this.registry.get(connectionId);if(!connection)throw new Error("CONNECTION_NOT_FOUND");
    const decision=this.policy.authorize({providerId:connection.provider,capability,approved,subjectId,resourceId});
    if(!decision.allowed){this.audit?.record?.("BOUNDARY_REJECTED",{connectionId,capability,reason:decision.reason});return{accepted:false,status:"BLOCKED",reason:decision.reason};}
    const envelope=this._sanitize({connection,capability,payload,metadata});
    this.audit?.record?.("BOUNDARY_ACCEPTED",{connectionId,capability,eventId:envelope.eventId});
    return{accepted:true,status:"RECEIVED",event:envelope};
  }
  _sanitize({connection,capability,payload,metadata}){
    const safeMetadata={provider:connection.provider,service:connection.service,connectionId:connection.id,capability,
      receivedAt:new Date().toISOString(),sourceType:metadata.sourceType||"EXTERNAL"};
    return{eventId:"WORLD-EVT-"+crypto.randomUUID(),type:"EXTERNAL_INFORMATION",metadata:safeMetadata,
      data:structuredClone(payload)};
  }
  status(){return{id:this.id,status:"ACTIVE",mode:"SANITIZED_INGRESS",rawCredentialsVisibleToWorld:false};}
}
