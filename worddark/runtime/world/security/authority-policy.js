class WordDarkAuthorityPolicy {
  constructor({levels=null,rootAuthorityId="ADM-RUAN"}={}) {
    this.rootAuthorityId=rootAuthorityId;
    this.levels=levels||{PUBLIC:10,OPERATION:20,WORLD:30,ADM:100};
  }

  levelOf(identityId, authority="PUBLIC") {
    if (identityId===this.rootAuthorityId) return this.levels.ADM;
    return this.levels[authority]||this.levels.PUBLIC;
  }

  authorize({actorId,actorAuthority="PUBLIC",action,targetAuthority="PUBLIC",targetId=null,allowSelfElevation=false}={}) {
    if (!actorId) return {allowed:false,reason:"IDENTITY_REQUIRED"};
    if (!action) return {allowed:false,reason:"ACTION_REQUIRED"};
    if (actorId!==this.rootAuthorityId && targetId===this.rootAuthorityId) {
      return {allowed:false,reason:"ADM_ROOT_FORBIDDEN"};
    }
    if (actorId!==this.rootAuthorityId && targetAuthority==="ADM") {
      return {allowed:false,reason:"ADM_SCOPE_FORBIDDEN"};
    }
    if (actorId!==this.rootAuthorityId && action==="ELEVATE_AUTHORITY") {
      return {allowed:false,reason:"SELF_ELEVATION_FORBIDDEN"};
    }
    if (action==="ELEVATE_AUTHORITY" && !allowSelfElevation && actorId!==this.rootAuthorityId) {
      return {allowed:false,reason:"AUTHORITY_CHANGE_REQUIRES_ADM"};
    }
    const actorLevel=this.levelOf(actorId,actorAuthority);
    const targetLevel=this.levels[targetAuthority]||this.levels.PUBLIC;
    if (actorLevel<targetLevel) return {allowed:false,reason:"INSUFFICIENT_AUTHORITY"};
    return {allowed:true,reason:"AUTHORIZED",reference:"AUTH-"+Date.now().toString(36).toUpperCase()};
  }

  assertWorldBoundary({actorId,targetId,targetAuthority="WORLD"}={}) {
    const result=this.authorize({
      actorId,
      action:"ACCESS_SCOPE",
      targetId,
      targetAuthority
    });
    return result;
  }
}
if(typeof module!=="undefined") module.exports=WordDarkAuthorityPolicy;
if(typeof window!=="undefined") window.WordDarkAuthorityPolicy=WordDarkAuthorityPolicy;
