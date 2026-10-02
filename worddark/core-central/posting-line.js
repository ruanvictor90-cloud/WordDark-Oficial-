import { id } from "./id.js";

export const POSTING_STATUS=Object.freeze({
  WAITING_HUMAN_AUTHORIZATION:"WAITING_HUMAN_AUTHORIZATION",
  AUTHORIZED:"AUTHORIZED",
  SCHEDULED:"SCHEDULED",
  SENT:"SENT",
  BLOCKED:"BLOCKED"
});

export class PostingLine {
  constructor({audit=null}={}) {this.id="POSTING-LINE";this.audit=audit;this.queue=[];}
  submit(content,{source="SCHOOL",authorizedBy=null,scheduledAt=null}={}) {
    const item={id:id("POST"),content:structuredClone(content),source,authorizedBy,scheduledAt,status:authorizedBy?POSTING_STATUS.AUTHORIZED:POSTING_STATUS.WAITING_HUMAN_AUTHORIZATION,createdAt:new Date().toISOString()};
    this.queue.push(item);this.audit?.record?.("POSTING_LINE_SUBMITTED",item);return structuredClone(item);
  }
  authorize(postId,{authorizedBy,scheduledAt=null}={}) {
    if(!authorizedBy) throw new Error("HUMAN_AUTHORIZATION_REQUIRED");
    const item=this.queue.find(x=>x.id===postId);if(!item) throw new Error("POST_NOT_FOUND");
    item.status=scheduledAt?POSTING_STATUS.SCHEDULED:POSTING_STATUS.AUTHORIZED;
    item.authorizedBy=authorizedBy;item.authorizedAt=new Date().toISOString();item.scheduledAt=scheduledAt;
    this.audit?.record?.("POSTING_HUMAN_AUTHORIZED",item);return structuredClone(item);
  }
  confirmWorldRelease(postId,{authorizedBy,scheduledAt=null}={}) {
    if(!authorizedBy) throw new Error("HUMAN_AUTHORIZATION_REQUIRED");
    const item=this.queue.find(x=>x.id===postId);if(!item) throw new Error("POST_NOT_FOUND");
    if(item.status===POSTING_STATUS.BLOCKED) throw new Error("POST_BLOCKED");
    item.status=scheduledAt?POSTING_STATUS.SCHEDULED:POSTING_STATUS.AUTHORIZED;
    item.worldReleaseConfirmedBy=authorizedBy;
    item.worldReleaseConfirmedAt=new Date().toISOString();
    item.scheduledAt=scheduledAt||item.scheduledAt||null;
    this.audit?.record?.("WORLD_RELEASE_HUMAN_CONFIRMED",item);
    return structuredClone(item);
  }
  block(postId,{reason}={}) {
    const item=this.queue.find(x=>x.id===postId);if(!item) throw new Error("POST_NOT_FOUND");
    item.status=POSTING_STATUS.BLOCKED;item.blockReason=reason||"BLOCKED";
    this.audit?.record?.("POSTING_BLOCKED",item);return structuredClone(item);
  }
  list(){return this.queue.map(structuredClone);}
  status(){return {id:this.id,queue:this.queue.length,waitingHuman:this.queue.filter(x=>x.status===POSTING_STATUS.WAITING_HUMAN_AUTHORIZATION).length,scheduled:this.queue.filter(x=>x.status===POSTING_STATUS.SCHEDULED).length,blocked:this.queue.filter(x=>x.status===POSTING_STATUS.BLOCKED).length};}
}
