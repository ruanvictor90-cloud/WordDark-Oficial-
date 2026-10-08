import {id} from "./id.js";
import {ConnectionContract} from "./connection-contract.js";

export class ConnectionRegistry{
  constructor({audit=null}={}){this.id="CONNECTION-REGISTRY";this.audit=audit;this.connections=new Map();this.providers=new Map();}
  registerProvider(provider={}){if(!provider.id)throw new Error("PROVIDER_ID_REQUIRED");this.providers.set(provider.id,structuredClone(provider));return structuredClone(provider);}
  register(connection={}){
    const entry=new ConnectionContract({id:connection.id||id("CONNECTION"),...connection});
    const validation=entry.validate();if(!validation.valid)throw new Error(validation.errors.join("|"));
    this.connections.set(entry.id,entry);this.audit?.record?.("CONNECTION_REGISTERED",entry.publicView());return entry.publicView();
  }
  updateStatus(connectionId,status,extra={}){
    const connection=this.connections.get(connectionId);if(!connection)throw new Error("CONNECTION_NOT_FOUND");
    connection.status=status;Object.assign(connection,extra);
    this.audit?.record?.("CONNECTION_STATUS_CHANGED",{connectionId,status,extra});
    return connection.publicView();
  }
  get(connectionId){return this.connections.get(connectionId)?.publicView()||null;}
  list(){return [...this.connections.values()].map(item=>item.publicView());}
  listProviders(){return [...this.providers.values()].map(structuredClone);}
  status(){return{id:this.id,status:"ACTIVE",providers:this.providers.size,connections:this.connections.size};}
}
