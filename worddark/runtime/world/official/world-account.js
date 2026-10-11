/* WordDark — Conta primária do mundo
 * Conta oficial de homologação. Não é uma empresa nem um perfil-piloto.
 */
(function(global){
  const KEY="wd.world.primary.account";
  const BASE=Object.freeze({
    id:"WORDDARK-OFFICIAL",
    name:"WordDark",
    type:"WORLD_PRIMARY_ACCOUNT",
    status:"HOMOLOGATION",
    environment:"PILOT",
    purpose:"Primeira conta pública usada para validar o mundo antes das operações dos clientes-piloto.",
    externalAccounts:{},
    contentHistory:[],
    createdAt:"2026-10-04T00:00:00.000Z"
  });
  function load(){
    try{return {...BASE,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...BASE}}
  }
  function save(account){localStorage.setItem(KEY,JSON.stringify(account));return account}
  function bindExternal(provider,account){
    const current=load();
    current.externalAccounts={...(current.externalAccounts||{}),[String(provider).toUpperCase()]:account};
    return save(current);
  }
  function recordContent(content){
    const current=load();
    current.contentHistory=[...(current.contentHistory||[]),content];
    return save(current);
  }
  function promote(){
    const current=load();
    current.status="VALIDATED";
    return save(current);
  }
  global.WordDarkWorldAccount={get:load,save,bindExternal,recordContent,promote};
})(typeof globalThis!=="undefined"?globalThis:window);
