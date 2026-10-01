import { id } from "../../../../../worddark/core-central/id.js";
export function createContent({title,type="VIDEO",asset,body="",metadata={}}={}){if(!title||!asset)throw new Error("CONTENT_INVALID");return {id:id("SC-CONT"),type,title,body,asset,metadata,version:1,status:"READY"};}
export function validateContent(content){return !!content?.id&&!!content?.title&&!!content?.type&&!!content?.asset;}
