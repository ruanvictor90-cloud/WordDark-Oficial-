/* WordDark — Universal External Connector Registry
 * Infraestrutura interna. A interface pública não precisa conhecer adapters.
 */
(function(global){
  "use strict";
  class WordDarkConnectorRegistry{
    constructor({connections=null}={}){this.connections=connections||new Map();}
    register(connector={}){
      if(!connector.id)throw new Error("Connector id é obrigatório.");
      const item={
        id:String(connector.id).toUpperCase(),
        provider:connector.provider||connector.id,
        status:connector.status||"READY",
        capabilities:Array.isArray(connector.capabilities)?[...connector.capabilities]:[],
        authorize:connector.authorize||null,
        execute:connector.execute||null,
        disconnect:connector.disconnect||null,
        metadata:connector.metadata||{}
      };
      this.connections.set(item.id,item);
      return item;
    }
    get(id){return this.connections.get(String(id||"").toUpperCase())||null;}
    list(){return [...this.connections.values()].map(x=>({...x,authorize:undefined,execute:undefined,disconnect:undefined}));}
    findCapability(capability){return [...this.connections.values()].filter(x=>x.status==="READY"&&(x.capabilities||[]).includes(capability));}
    async execute(id,request={}){
      const connector=this.get(id);
      if(!connector)return{success:false,status:"CONNECTOR_NOT_FOUND"};
      if(typeof connector.execute!=="function")return{success:false,status:"CONNECTOR_NOT_EXECUTABLE"};
      return connector.execute(request);
    }
    async authorize(id,context={}){
      const connector=this.get(id);
      if(!connector)return{allowed:false,status:"CONNECTOR_NOT_FOUND"};
      if(typeof connector.authorize!=="function")return{allowed:false,status:"CONNECTOR_AUTHORIZATION_REQUIRED"};
      return connector.authorize(context);
    }
    async disconnect(id,context={}){
      const connector=this.get(id);
      if(!connector)return{success:false,status:"CONNECTOR_NOT_FOUND"};
      if(typeof connector.disconnect==="function")await connector.disconnect(context);
      connector.status="READY";
      return{success:true,status:"CONNECTOR_DISCONNECTED"};
    }
  }
  if(typeof global!=="undefined")global.WordDarkConnectorRegistry=WordDarkConnectorRegistry;
  if(typeof module!=="undefined"&&module.exports)module.exports=WordDarkConnectorRegistry;
})(typeof globalThis!=="undefined"?globalThis:window);
