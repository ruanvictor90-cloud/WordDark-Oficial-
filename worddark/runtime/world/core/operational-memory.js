/* WordDark — Operational Memory
 * Memória do que o mundo executou, aprendeu, corrigiu e validou.
 * Não substitui a Biblioteca: organiza o significado operacional dos registros.
 */
(function(global){
  "use strict";

  class WordDarkOperationalMemory{
    constructor({library=null,storage=null,maxRecords=5000}={}){
      this.library=library||null;
      this.storage=storage||((typeof localStorage!=="undefined")?localStorage:null);
      this.maxRecords=maxRecords;
      this.records=[];
      this._load();
    }

    _load(){
      if(!this.storage)return;
      try{this.records=JSON.parse(this.storage.getItem("wd.operational.memory")||"[]");}
      catch(_){this.records=[];}
    }

    _save(){
      if(!this.storage)return;
      try{this.storage.setItem("wd.operational.memory",JSON.stringify(this.records.slice(-this.maxRecords)));}
      catch(_){}
    }

    remember({operationId=null,type="OPERATION_MEMORY",stage=null,companyId=null,moduleId=null,status=null,lesson=null,data={}}={}){
      const record={
        recordId:"MEM-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase(),
        operationId, type, stage, companyId, moduleId, status, lesson,
        data, createdAt:new Date().toISOString()
      };
      this.records.push(record);
      this.records=this.records.slice(-this.maxRecords);
      this._save();
      if(this.library?.append)try{this.library.append({...record,type:"OPERATION_MEMORY"});}catch(_){}
      return record;
    }

    rememberFailure({operationId,moduleId,reason,data={}}={}){
      return this.remember({operationId,type:"FAILURE",stage:"EXECUTION",moduleId,status:"FAILED",lesson:"Módulo afetado registrado para reentrada.",data:{reason,...data}});
    }

    rememberResolution({operationId,moduleId,resolution,data={}}={}){
      return this.remember({operationId,type:"RESOLUTION",stage:"REENTRY",moduleId,status:"RESOLVED",lesson:resolution,data});
    }

    rememberCompletion({operationId,status="COMPLETED",data={}}={}){
      return this.remember({operationId,type:"COMPLETION",stage:"COMPLETED",status,data});
    }

    find({operationId=null,moduleId=null,type=null}={}){
      return this.records.filter(r=>
        (!operationId||r.operationId===operationId)&&
        (!moduleId||r.moduleId===moduleId)&&
        (!type||r.type===type)
      );
    }

    latest(operationId){const rows=this.find({operationId});return rows.length?rows[rows.length-1]:null;}
    list(){return [...this.records];}
    clear(){this.records=[];this._save();}
  }

  if(typeof global!=="undefined")global.WordDarkOperationalMemory=WordDarkOperationalMemory;
  if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkOperationalMemory;
})(typeof globalThis!=="undefined"?globalThis:window);
