export const VEIL_VERSION="1.0.0";

export const VEIL_ZONES=Object.freeze([
  "IDENTITY","OAUTH","CREDENTIAL_VAULT","TOKEN_SESSIONS","CONNECTIONS",
  "CAPABILITIES","INGRESS","EGRESS","REVOCATION","ROTATION",
  "AUDIT","PRIVACY","RECOVERY","EMERGENCY","INTEGRITY","WORLD_BRIDGE"
]);

export const FORBIDDEN_WORLD_MATERIAL=Object.freeze([
  "client_secret","clientSecret","refresh_token","refreshToken",
  "access_token","accessToken","authorization_code","authorizationCode",
  "password","private_key","privateKey","cookie","session_secret"
]);

export class VeilContract{
  constructor({id="VEIL",version=VEIL_VERSION}={}){this.id=id;this.version=version;this.status="ACTIVE";}
  sanitize(input={}){
    const clean=structuredClone(input);
    const remove=(obj)=>{
      if(!obj||typeof obj!=="object")return;
      for(const key of Object.keys(obj)){
        if(FORBIDDEN_WORLD_MATERIAL.includes(key)){delete obj[key];continue;}
        if(typeof obj[key]==="object")remove(obj[key]);
      }
    };
    remove(clean);
    return clean;
  }
  containsForbiddenMaterial(input={}){
    const text=JSON.stringify(input);
    return FORBIDDEN_WORLD_MATERIAL.some(key=>text.includes('"'+key+'"'));
  }
  status(){return{id:this.id,version:this.version,status:this.status,worldReceivesSecrets:false};}
}
