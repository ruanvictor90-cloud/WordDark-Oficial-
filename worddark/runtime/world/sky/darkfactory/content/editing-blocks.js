/* WordDark — Dark Factory Editing Blocks · DF-EDIT-0.1 */
(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory();
  else root.WordDarkEditingBlocks=factory();
})(typeof self!=="undefined"?self:this,function(){
  const BLOCKS={
    TRIM:{sector:"content.video",name:"Corte",description:"Define início e fim do trecho.",fields:["start","end"]},
    CROP:{sector:"content.image",name:"Recorte",description:"Recorta a área útil do conteúdo.",fields:["x","y","width","height"]},
    RESIZE:{sector:"content.image",name:"Redimensionamento",description:"Define dimensões e proporção de saída.",fields:["width","height","fit"]},
    TEXT_OVERLAY:{sector:"content.identity",name:"Texto sobreposto",description:"Aplica título, chamada ou marca sobre o conteúdo.",fields:["text","position","style"]},
    FILTER:{sector:"content.image",name:"Filtro",description:"Aplica uma configuração visual.",fields:["preset","intensity"]},
    SPEED:{sector:"content.video",name:"Velocidade",description:"Ajusta velocidade e duração.",fields:["rate"]},
    TRANSITION:{sector:"content.video",name:"Transição",description:"Define passagem entre trechos.",fields:["type","duration"]},
    SUBTITLE:{sector:"content.script",name:"Legenda",description:"Converte o roteiro em instrução de legendagem.",fields:["text","style","position"]},
    WATERMARK:{sector:"content.identity",name:"Marca d'água",description:"Aplica identificação visual do ativo.",fields:["asset","position","opacity"]},
    AUDIO_MIX:{sector:"content.audio",name:"Mixagem",description:"Define níveis relativos de trilha, voz e efeitos.",fields:["voice","music","effects"]},
    RENDER:{sector:"content.render",name:"Renderização",description:"Define formato, qualidade e saída final.",fields:["format","quality","fps"]},
    VALIDATE:{sector:"content.control",name:"Validação",description:"Verifica requisitos antes da entrega.",fields:["rules"]}
  };
  function list(){return Object.keys(BLOCKS).map(id=>({id,...BLOCKS[id]}));}
  function get(id){return BLOCKS[String(id||"").toUpperCase()]||null;}
  function create(id,params={}){
    const block=get(id); if(!block)return{success:false,status:"BLOCK_NOT_FOUND",blockId:id};
    return{success:true,status:"BLOCK_READY",blockId:String(id).toUpperCase(),sector:block.sector,name:block.name,params:{...params},reusable:true};
  }
  return{VERSION:"0.1.0",list,get,create};
});