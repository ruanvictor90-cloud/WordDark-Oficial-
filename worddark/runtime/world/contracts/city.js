/* WordDark — City Contract */
class WordDarkCity {
  constructor(data){data=data||{};Object.assign(this,{cityId:null,name:null,parentId:null,status:"ACTIVE",identityId:null,environment:"TEST",metadata:{}},data);}
  validate(){
    const errors=[];
    if(!this.cityId) errors.push("cityId obrigatório");
    if(!this.name) errors.push("name obrigatório");
    if(!this.parentId) errors.push("parentId obrigatório");
    if(!this.identityId) errors.push("identityId obrigatório");
    if(this.environment!=="TEST"&&this.environment!=="PROD") errors.push("environment inválido");
    return {valid:errors.length===0,errors:errors};
  }
  toJSON(){return Object.assign({},this);}
}
if(typeof module!=="undefined") module.exports=WordDarkCity;
if(typeof window!=="undefined") window.WordDarkCity=WordDarkCity;
