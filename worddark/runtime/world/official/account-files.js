/* WordDark — Arquivos temporários da conta oficial
 * Regra: arquivo nasce aqui -> validação -> promoção para Biblioteca -> remoção daqui.
 */
(function(global){
  const KEY="wd.worddark.official.files";
  const LIBRARY_KEY="wd.world.central.library.records";
  const ACCOUNT_ID="WORDDARK-OFFICIAL";
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
  function save(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
  function add(file){
    if(!file||!file.name)throw new Error("FILE_NAME_REQUIRED");
    const item={id:file.id||("WD-FILE-"+Date.now()),accountId:ACCOUNT_ID,name:file.name,type:file.type||"unknown",size:file.size||0,data:file.data||null,status:"TEMPORARY",createdAt:new Date().toISOString()};
    save([...load(),item]);return item;
  }
  function get(id){return load().find(x=>x.id===id)||null}
  function list(){return load()}
  function remove(id){save(load().filter(x=>x.id!==id))}
  function promote(id,metadata={}){
    const item=get(id);if(!item)throw new Error("FILE_NOT_FOUND");
    const record={recordId:"LIB-"+item.id,source:"ACCOUNT_TEMP_FILES",sourceAccount:ACCOUNT_ID,type:"ACCOUNT_FILE",name:item.name,fileType:item.type,size:item.size,data:item.data,metadata,archivedAt:new Date().toISOString()};
    let library=[];try{library=JSON.parse(localStorage.getItem(LIBRARY_KEY)||"[]")}catch{}
    localStorage.setItem(LIBRARY_KEY,JSON.stringify([...library,record]));
    remove(id);
    return record;
  }
  function clearPromoted(){save(load())}
  global.WordDarkAccountFiles={add,get,list,remove,promote,clearPromoted,accountId:ACCOUNT_ID};
})(typeof globalThis!=="undefined"?globalThis:window);
