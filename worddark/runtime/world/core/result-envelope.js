/* WordDark — Standard Result Envelope */
(function(global){
  "use strict";
  class WordDarkResultEnvelope{
    static create({operationId,status="PENDING",output=null,artifacts=[],errors=[],nextAction=null,metadata={}}={}){
      return {operationId,status,output,artifacts:Array.isArray(artifacts)?artifacts:[],errors:Array.isArray(errors)?errors:[],nextAction,metadata,createdAt:new Date().toISOString()};
    }
    static success(operationId,output=null,options={}){return this.create({operationId,status:"COMPLETED",output,...options});}
    static failure(operationId,errors=[],options={}){return this.create({operationId,status:"FAILED",errors,...options});}
  }
  global.WordDarkResultEnvelope=WordDarkResultEnvelope;
  if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkResultEnvelope;
})(typeof globalThis!=="undefined"?globalThis:window);