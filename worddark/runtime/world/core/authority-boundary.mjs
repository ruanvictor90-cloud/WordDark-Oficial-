/** WordDark Core — Authority Boundary v1.
 * ADM Dono is external and sovereign, never an internal role.
 * Internal authorization only; not authentication or a replacement for server controls.
 */
export const WORLD_ZONES = Object.freeze(["ADM", "DEV", "PUBLIC"]);
export const WORLD_ACTIONS = Object.freeze(["world.read","world.operate","world.configure","dev.read","dev.write","dev.test","public.read","service.use","authority.grant","authority.revoke","security.audit"]);
const ROLE_PERMISSIONS = Object.freeze({
 "world-admin":Object.freeze(["world.read","world.operate","world.configure","dev.read","dev.test","security.audit"]),
 "developer":Object.freeze(["world.read","dev.read","dev.write","dev.test"]),
 "public":Object.freeze(["public.read","service.use"])
});
const INTERNAL_ROLES=new Set(Object.keys(ROLE_PERMISSIONS));
export function normalizePrincipal(p={}){return{principalId:typeof p.principalId==="string"?p.principalId:null,role:INTERNAL_ROLES.has(p.role)?p.role:null,zone:WORLD_ZONES.includes(p.zone)?p.zone:null,authenticated:p.authenticated===true,active:p.active===true};}
export function authorizeWorldAction(input,action){
 const p=normalizePrincipal(input),deny=reason=>Object.freeze({allowed:false,reason,principalId:p.principalId,action});
 if(!p.principalId||!p.authenticated||!p.active)return deny("IDENTITY_NOT_ACTIVE");
 if(!WORLD_ACTIONS.includes(action))return deny("ACTION_NOT_RECOGNIZED");
 if(!p.role||!p.zone)return deny("ROLE_OR_ZONE_NOT_RECOGNIZED");
 if((p.role==="world-admin"&&p.zone!=="ADM")||(p.role==="developer"&&p.zone!=="DEV")||(p.role==="public"&&p.zone!=="PUBLIC"))return deny("ROLE_ZONE_MISMATCH");
 if(action==="authority.grant"||action==="authority.revoke")return deny("SOVEREIGN_AUTHORITY_OUTSIDE_WORLD");
 if(p.role==="world-admin"&&action==="dev.write")return deny("SEPARATION_OF_DUTIES");
 if(p.role==="developer"&&["world.operate","world.configure","world.write","security.audit"].includes(action))return deny("DEV_CANNOT_ADMINISTER_WORLD");
 if(p.role==="public"&&!["public.read","service.use"].includes(action))return deny("PUBLIC_INTERFACE_ONLY");
 if(!ROLE_PERMISSIONS[p.role].includes(action))return deny("PERMISSION_NOT_GRANTED");
 return Object.freeze({allowed:true,reason:"PERMISSION_GRANTED",principalId:p.principalId,action});
}
export function describeWorldBoundary(){return Object.freeze({version:1,zones:WORLD_ZONES,sovereignAuthority:"ADM_DONO_EXTERNAL",sovereignAuthorityIsInternalRole:false,defaultDecision:"DENY",publicCanInspectInternalBlueprint:false,developerCanGrantSovereignAuthority:false,worldCanGrantSovereignAuthority:false});}
