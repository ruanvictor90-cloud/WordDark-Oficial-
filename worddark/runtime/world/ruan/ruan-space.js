// WordDark — Área Ruan v0.1
// Área pessoal do proprietário. Não publica dados pessoais no WordDark automaticamente.

const STORAGE_KEY = "wd.ruan.personal";

function load(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tasks: [], reminders: [], ideas: [], notes: [], requests: []
  }; } catch { return {tasks:[], reminders:[], ideas:[], notes:[], requests:[]}; }
}
function save(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return state; }

export const WordDarkRuan = {
  name: "Ruan",
  type: "OWNER_PERSONAL_AREA",
  isolation: "PRIVATE",
  load,
  save,
  add(type, item){
    const state=load();
    if(!state[type]) throw new Error("Tipo pessoal inválido");
    state[type].push({id:"RUAN-"+Date.now(), ...item, createdAt:new Date().toISOString()});
    return save(state);
  },
  list(type){ return load()[type] || []; },
  remove(type,id){
    const state=load();
    state[type]=(state[type]||[]).filter(item=>item.id!==id);
    return save(state);
  },
  status(){
    const state=load();
    return {
      area:"RUAN",
      isolation:"PRIVATE",
      worldAccess:"REQUEST_ONLY",
      worldMayEnter:false,
      personalDataSharedAutomatically:false,
      counts:Object.fromEntries(Object.entries(state).map(([k,v])=>[k,v.length]))
    };
  }
};

if(typeof window!=="undefined") window.WordDarkRuan=WordDarkRuan;
