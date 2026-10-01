import { id } from "../../../../../worddark/core-central/id.js";
export function createPublication({contentId,platform,account=null,operation=null}={}){if(!contentId||!platform)throw new Error("PUBLICATION_INVALID");return {id:id("SC-PUB"),contentId,platform,account,operation,status:"REQUESTED",externalId:null,externalUrl:null,createdAt:new Date().toISOString()};}
export function confirmPublication(publication,{externalId=null,externalUrl=null}={}){return {...publication,status:"CONFIRMED",externalId,externalUrl,updatedAt:new Date().toISOString()};}
