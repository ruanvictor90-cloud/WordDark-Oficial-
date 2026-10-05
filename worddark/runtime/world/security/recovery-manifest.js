class WordDarkRecoveryManifest {
  constructor({manifestId="WORDDARK-RECOVERY-001",required=[]}={}) {
    this.manifestId=manifestId;
    this.required=required.length?[...required]:[
      "REPOSITORY_BACKUP","IP_EXPORT","LIBRARY_EXPORT","EXTERNAL_ACCOUNT_RECOVERY",
      "DOMAIN_RECOVERY","LEGAL_EVIDENCE","RESTORE_PROCEDURE"
    ];
    this.items=new Map();
  }

  register(type,{location=null,verified=false,checksum=null,updatedAt=null,notes=""}={}) {
    if(!this.required.includes(type)) throw new Error("item de recuperação não reconhecido");
    this.items.set(type,{type,location,verified,checksum,updatedAt,notes});
    return this.items.get(type);
  }

  status(){
    const missing=this.required.filter(type=>!this.items.has(type));
    const unverified=this.required.filter(type=>this.items.has(type)&&!this.items.get(type).verified);
    return {manifestId:this.manifestId,ready:missing.length===0&&unverified.length===0,missing,unverified,registered:this.items.size};
  }

  export(){return {manifestId:this.manifestId,required:[...this.required],items:[...this.items.values()],status:this.status()};}
}
if(typeof module!=="undefined") module.exports=WordDarkRecoveryManifest;
if(typeof window!=="undefined") window.WordDarkRecoveryManifest=WordDarkRecoveryManifest;
