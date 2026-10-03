/* WordDark — Terra Operation Gateway
 * Terra declara intenção/necessidade. WordDark decide a rota.
 */
class WordDarkEarthOperationGateway{
  constructor({coordinator,defaultOrigin="world/earth"}={}){this.coordinator=coordinator||null;this.defaultOrigin=defaultOrigin;}
  submit({
    requesterId="ORIGIN-001",
    originId=this.defaultOrigin,
    operationType="content.create",
    environment="TEST",
    intent=null,
    need=null,
    capability=null,
    destinationId=null,
    payload={}
  }={}){
    if(!this.coordinator)return{success:false,status:"FAILED",reason:"Coordenador central não configurado."};
    return this.coordinator.submit({
      requesterId,originId,operationType,environment,intent,need,capability,destinationId,
      payload:{...payload,originId,requesterId}
    });
  }
  getStatus(){return{status:this.coordinator?"READY":"OFFLINE",origin:this.defaultOrigin};}
}
if(typeof module!=="undefined")module.exports=WordDarkEarthOperationGateway;
if(typeof window!=="undefined")window.WordDarkEarthOperationGateway=WordDarkEarthOperationGateway;
