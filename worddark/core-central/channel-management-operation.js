import { id } from "./id.js";

export const CHANNEL_MANAGEMENT_STATUS=Object.freeze([
  "DRAFT","READY_FOR_PRODUCTION","IN_PRODUCTION","REVIEW",
  "NEEDS_EDIT","NEEDS_RESTRUCTURE","REDO","READY_FOR_HUMAN",
  "WAITING_HUMAN_AUTHORIZATION","AUTHORIZED","SCHEDULED","WAITING_EXTERNAL_CONNECTION"
]);

export class ChannelManagementOperation {
  constructor({accountManager,accountOperations,school,contentLifecycle,postingLine,audit=null}={}){
    if(!accountManager||!accountOperations||!school||!contentLifecycle||!postingLine) throw new Error("CHANNEL_OPERATION_COMPONENTS_REQUIRED");
    this.id="CHANNEL-MANAGEMENT-OPERATION";this.accountManager=accountManager;this.accountOperations=accountOperations;
    this.school=school;this.contentLifecycle=contentLifecycle;this.postingLine=postingLine;this.audit=audit;this.operations=new Map();
  }
  create({name="Gestão de Canais",profileIds=null,goal="GERIR_CANAIS"}={}){
    const targets=this.accountOperations.listTargets(profileIds);
    const operation={id:id("CHANNEL-MGMT"),name,goal,profileIds:targets.map(x=>x.profileId),targets,status:targets.length?"READY_FOR_PRODUCTION":"DRAFT",humanAuthorizationRequired:true,externalPublishingEnabled:false,createdAt:new Date().toISOString(),history:[]};
    operation.history.push({status:operation.status,at:operation.createdAt});this.operations.set(operation.id,operation);
    this.audit?.record?.("CHANNEL_MANAGEMENT_OPERATION_CREATED",operation);return structuredClone(operation);
  }
  requestProduction(operationId,{contentId=null,content={},requirements=[]}={}){
    const op=this._get(operationId);
    if(!["READY_FOR_PRODUCTION","REDO","NEEDS_EDIT","NEEDS_RESTRUCTURE"].includes(op.status)) throw new Error("CHANNEL_OPERATION_NOT_READY_FOR_PRODUCTION");
    op.status="IN_PRODUCTION";op.content={contentId:contentId||id("CONTENT"),content:structuredClone(content),requirements:structuredClone(requirements)};
    this.contentLifecycle.register(operationId,{contentId:op.content.contentId});this._history(op,"IN_PRODUCTION",{contentId:op.content.contentId});return structuredClone(op);
  }
  review(operationId,{rightsOk=true,safetyOk=true,metricsOk=true,needsEdit=false,needsRestructure=false,unresolved=false,reason=null}={}){
    const op=this._get(operationId);const result=this.contentLifecycle.evaluate(operationId,{rightsOk,safetyOk,metricsOk,needsEdit,needsRestructure,unresolved,reason});
    op.status=result.outcome==="NEEDS_EDIT"?"NEEDS_EDIT":result.outcome==="NEEDS_RESTRUCTURE"?"NEEDS_RESTRUCTURE":result.outcome==="REDO"?"REDO":"READY_FOR_HUMAN";
    op.review=structuredClone(result);this._history(op,op.status,{reason});return structuredClone(op);
  }
  prepareForHuman(operationId,{content=null,reason="HUMAN_REVIEW_REQUIRED"}={}){
    const op=this._get(operationId);if(op.status!=="READY_FOR_HUMAN")throw new Error("CHANNEL_OPERATION_NOT_READY_FOR_HUMAN");
    const prepared=this.school.prepareContent(content||op.content?.content||{},{source:"CHANNEL-MANAGEMENT",reason});
    const post=this.postingLine.submit(prepared,{source:"CHANNEL-MANAGEMENT"});
    op.status="WAITING_HUMAN_AUTHORIZATION";op.humanReview={content:prepared,post};this._history(op,op.status,{postId:post.id});
    return structuredClone({operation:op,post});
  }
  authorize(operationId,{authorizedBy,scheduledAt=null}={}){
    const op=this._get(operationId);if(!authorizedBy)throw new Error("HUMAN_AUTHORIZATION_REQUIRED");
    const postId=op.humanReview?.post?.id;if(!postId)throw new Error("POSTING_ITEM_NOT_PREPARED");
    const post=this.postingLine.confirmWorldRelease(postId,{authorizedBy,scheduledAt});
    op.status=scheduledAt?"SCHEDULED":"AUTHORIZED";op.authorization={authorizedBy,authorizedAt:new Date().toISOString(),scheduledAt:scheduledAt||null};op.humanReview.post=post;
    this._history(op,op.status,{postId});return structuredClone(op);
  }
  schedule(operationId,{contents=[],dates=[],startDate=null,times=[],postsPerDay=1,profileIds=null}={}){
    const op=this._get(operationId);if(!["AUTHORIZED","SCHEDULED"].includes(op.status))throw new Error("CHANNEL_OPERATION_NOT_AUTHORIZED");
    const schedule=this.accountOperations.createContentSchedule({contents:contents.length?contents:[op.content?.content||{}],profileIds:profileIds||op.profileIds,postsPerDay,dates,startDate,times});
    op.scheduleId=schedule.id;op.status="SCHEDULED";this._history(op,"SCHEDULED",{scheduleId:schedule.id});return structuredClone({operation:op,schedule});
  }
  list(){return [...this.operations.values()].map(structuredClone)}
  get(operationId){return structuredClone(this.operations.get(operationId)||null)}
  status(){const list=this.list();return{id:this.id,operations:list.length,waitingHuman:list.filter(x=>x.status==="WAITING_HUMAN_AUTHORIZATION").length,scheduled:list.filter(x=>x.status==="SCHEDULED").length}}
  _get(operationId){const op=this.operations.get(operationId);if(!op)throw new Error("CHANNEL_MANAGEMENT_OPERATION_NOT_FOUND");return op}
  _history(op,status,data={}){op.updatedAt=new Date().toISOString();op.history.push({status,at:op.updatedAt,data});this.audit?.record?.("CHANNEL_MANAGEMENT_OPERATION_STATUS",{operationId:op.id,status,data})}
}
