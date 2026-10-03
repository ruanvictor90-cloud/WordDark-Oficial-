/* WordDark — Operation Reentry Controller
 * Permite retomar somente o módulo afetado de uma operação.
 */
class WordDarkOperationReentry {
  constructor({contentFactory=null}={}) {
    this.contentFactory=contentFactory||null;
  }
  prepare(operationId,moduleId,patch={}) {
    if(!this.contentFactory)return{success:false,status:"FACTORY_UNAVAILABLE"};
    if(typeof this.contentFactory.reenterFromModule==="function"){
      return this.contentFactory.reenterFromModule(operationId,moduleId,patch);
    }
    return{success:false,status:"MODULE_REENTRY_UNAVAILABLE"};
  }
  resume(operationId,moduleId,patch={}) {
    const prepared=this.prepare(operationId,moduleId,patch);
    if(!prepared.success)return prepared;
    if(typeof this.contentFactory.executeFromModule==="function"){
      return this.contentFactory.executeFromModule(operationId,moduleId);
    }
    return{...prepared,status:"REENTRY_READY",execution:"WAITING_FOR_FACTORY_MODULE_EXECUTOR"};
  }
}
if(typeof module!=="undefined")module.exports=WordDarkOperationReentry;
if(typeof window!=="undefined")window.WordDarkOperationReentry=WordDarkOperationReentry;
