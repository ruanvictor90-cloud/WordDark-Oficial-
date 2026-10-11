export const CONNECTION_CONTRACT_VERSION="1.0.0";

export const CONNECTION_STATUS=Object.freeze([
  "DISCOVERED","CONFIGURED","AUTH_REQUIRED","AUTHORIZING","CONNECTED","DEGRADED","REVOKED","ERROR"
]);

export const CONNECTION_CHANNELS=Object.freeze([
  "GOOGLE","META","TIKTOK","GITHUB","OPENAI","EMAIL","STORAGE","ANALYTICS","OTHER"
]);

export const CONNECTION_CAPABILITIES=Object.freeze([
  "IDENTITY_READ","PROFILE_READ","CONTENT_READ","CONTENT_CREATE","CONTENT_UPDATE",
  "CONTENT_DELETE","CONTENT_PUBLISH","MEDIA_UPLOAD","MEDIA_READ","MEDIA_DELETE",
  "ANALYTICS_READ","STORAGE_READ","STORAGE_WRITE","MESSAGING_SEND","ACCOUNT_MANAGE"
]);

export class ConnectionContract{
  constructor({id,provider,service,accountId=null,status="DISCOVERED",capabilities=[]}={}){
    if(!id)throw new Error("CONNECTION_ID_REQUIRED");
    if(!provider)throw new Error("CONNECTION_PROVIDER_REQUIRED");
    this.id=id;this.provider=provider;this.service=service||provider;this.accountId=accountId;
    this.status=status;this.capabilities=[...new Set(capabilities)];this.version=CONNECTION_CONTRACT_VERSION;
  }
  validate(){
    const errors=[];
    if(!CONNECTION_STATUS.includes(this.status))errors.push("CONNECTION_STATUS_INVALID");
    for(const capability of this.capabilities)if(!CONNECTION_CAPABILITIES.includes(capability))errors.push("CAPABILITY_INVALID:"+capability);
    return{valid:errors.length===0,errors};
  }
  publicView(){
    return{ id:this.id,provider:this.provider,service:this.service,accountId:this.accountId,
      status:this.status,capabilities:[...this.capabilities],version:this.version };
  }
}
