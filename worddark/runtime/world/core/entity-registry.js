/* WordDark Core — Entity Registry */
class WordDarkEntityRegistry {
 constructor(){this.entities=new Map();}
 register(entity){if(!entity||!entity.id)throw new Error("Entidade inválida.");if(this.entities.has(entity.id))throw new Error("ID já registrado: "+entity.id);this.entities.set(entity.id,{...entity});return this.get(entity.id);}
 get(id){return this.entities.get(id)||null;}
 list(type=null){return [...this.entities.values()].filter(e=>!type||e.type===type);}
 update(id,patch){const current=this.get(id);if(!current)return null;const next={...current,...patch,id};this.entities.set(id,next);return this.get(id);}
}
if(typeof module!=="undefined")module.exports=WordDarkEntityRegistry;
if(typeof window!=="undefined")window.WordDarkEntityRegistry=WordDarkEntityRegistry;
