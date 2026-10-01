/* WordDark — Dark Factory Modular Factory · DF-0.7 */
class DarkFactory {
  constructor(options){options=options||{};this.registry=options.registry||null;this.pipeline=options.pipeline||null;this.status="ONLINE";}
  process(request){
    if(!request) return {success:false,status:"REJECTED",reason:"Requerimento ausente."};
    if(!request.taskType) return {success:false,status:"REJECTED",reason:"taskType obrigatório."};
    if(!this.pipeline) return {success:false,status:"FAILED",reason:"Pipeline não configurado."};
    return this.pipeline.run(request);
  }
  getStatus(){return {status:this.status,serviceCount:this.registry?this.registry.list().length:0};}
}
if(typeof module!=="undefined") module.exports=DarkFactory;
if(typeof window!=="undefined") window.DarkFactory=DarkFactory;
