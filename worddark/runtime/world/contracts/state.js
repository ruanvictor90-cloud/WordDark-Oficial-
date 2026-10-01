/* WordDark — Terra State Contract */
class WordDarkState {
  constructor(data){data=data||{};Object.assign(this,{stateId:null,name:null,parentId:null,status:"ACTIVE",cities:[],sectors:[],responsibilities:["define_requirement","receive_result","decide_destination","distribute"],metadata:{}},data);}
  validate(){const errors=[];if(!this.stateId)errors.push("stateId obrigatório");if(!this.name)errors.push("name obrigatório");if(!this.parentId)errors.push("parentId obrigatório");return {valid:errors.length===0,errors:errors};}
}
if(typeof module!=="undefined") module.exports=WordDarkState;
if(typeof window!=="undefined") window.WordDarkState=WordDarkState;
