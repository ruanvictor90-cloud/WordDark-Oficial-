/* WordDark Lab — External connector boundary */
class WordDarkLabConnector {
  constructor(s={}){this.id=s.id||null;this.platform=s.platform||null;this.accountId=s.accountId||null;this.status=s.status||"DISCONNECTED";this.permissions=s.permissions||[];this.logs=[];}
  connect(){this.status="CONNECTED";this.logs.push({event:"CONNECTED",timestamp:new Date().toISOString()});return this.status;}
  disconnect(){this.status="DISCONNECTED";this.logs.push({event:"DISCONNECTED",timestamp:new Date().toISOString()});return this.status;}
  publish(payload){if(this.status!=="CONNECTED")return {success:false,status:"REJECTED",reason:"CONNECTOR_DISCONNECTED"};const r={success:true,status:"PUBLISHED",platform:this.platform,externalId:"EXT-"+Date.now().toString(36).toUpperCase(),payload};this.logs.push({event:"PUBLISHED",timestamp:new Date().toISOString(),externalId:r.externalId});return r;}
  getLogs(){return [...this.logs];}
}
if(typeof module!=="undefined")module.exports=WordDarkLabConnector;
if(typeof window!=="undefined")window.WordDarkLabConnector=WordDarkLabConnector;
