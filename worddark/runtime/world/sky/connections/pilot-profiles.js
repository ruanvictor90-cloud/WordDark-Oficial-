/* WordDark — Perfis-piloto de canais
 * Estes perfis são clientes de teste da infraestrutura, não novas camadas estruturais do mundo.
 */
(function(global){
  const PROFILES=Object.freeze([
    {id:"PILOT-SUCO-01",name:"SucoCast",networkAccounts:{}},
    {id:"PILOT-SUCO-02",name:"SucoGeek",networkAccounts:{}},
    {id:"PILOT-SUCO-03",name:"SucoComed",networkAccounts:{}},
    {id:"PILOT-SUCO-04",name:"SucoEmpreendimento",networkAccounts:{}}
  ]);
  const KEY="wd.pilot.profiles";
  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||"[]");
      return PROFILES.map(base=>({...base,...(saved.find(x=>x.id===base.id)||{})}));
    }catch{return PROFILES.map(x=>({...x}));}
  }
  function bind(profileId,network,account){
    const profiles=load(),p=profiles.find(x=>x.id===profileId);
    if(!p)throw new Error("PILOT_PROFILE_NOT_FOUND");
    p.networkAccounts={...(p.networkAccounts||{}),[String(network).toUpperCase()]:account};
    localStorage.setItem(KEY,JSON.stringify(profiles));
    return p;
  }
  function get(id){return load().find(x=>x.id===id)||null;}
  global.WordDarkPilotProfiles={list:load,get,bind};
})(typeof globalThis!=="undefined"?globalThis:window);
