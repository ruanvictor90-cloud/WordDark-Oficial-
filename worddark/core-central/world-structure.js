import { id } from "./id.js";

export const STRUCTURAL_LAYERS=Object.freeze({
  PAIS:{id:"PAIS",meaning:"GRUPO",layer:"TERRA"},
  ESTADO:{id:"ESTADO",meaning:"OPERACAO",layer:"TERRA"},
  CIDADE:{id:"CIDADE",meaning:"REDE_SOCIAL_OU_PERFIL",layer:"TERRA"},
  BAIRRO:{id:"BAIRRO",meaning:"SETOR_EXECUTOR",layer:"TERRA"},
  DOMINIO:{id:"DOMINIO",meaning:"GRUPO_GLOBAL",layer:"CEU"},
  REGIAO:{id:"REGIAO",meaning:"OPERACAO_GLOBAL",layer:"CEU"},
  NUCLEO:{id:"NUCLEO",meaning:"AMBIENTE_OU_UNIDADE_GLOBAL",layer:"CEU"},
  DISTRITO:{id:"DISTRITO",meaning:"SETOR_GLOBAL",layer:"CEU"}
});

const TERRA_ORDER=["PAIS","ESTADO","CIDADE","BAIRRO"];
const CEU_ORDER=["DOMINIO","REGIAO","NUCLEO","DISTRITO"];

export class WorldStructureClassifier {
  constructor(){this.id="WORLD-STRUCTURE-CLASSIFIER";this.version="2.0.0";}
  describe(type){return STRUCTURAL_LAYERS[type]||null;}
  classify({existingGroup=false,existingOperation=false,existingEnvironment=false,existingSector=false}={}){
    if(!existingGroup)return {createType:"PAIS",reason:"NO_EXISTING_GROUP"};
    if(!existingOperation)return {createType:"ESTADO",reason:"NO_EXISTING_OPERATION"};
    if(!existingEnvironment)return {createType:"CIDADE",reason:"NO_EXISTING_ENVIRONMENT"};
    if(!existingSector)return {createType:"BAIRRO",reason:"NO_EXISTING_SECTOR"};
    return {createType:"SOLUTION",reason:"FIT_EXISTING_STRUCTURE"};
  }
  path(types=[]){
    return types.map(type=>this.describe(type)).filter(Boolean);
  }
  createProposal({name,type,parentId=null,reason="STRUCTURAL_FIT"}={}){
    if(!name||!type)throw new Error("STRUCTURE_NAME_AND_TYPE_REQUIRED");
    if(!this.describe(type)&&type!=="SOLUTION")throw new Error("STRUCTURE_TYPE_INVALID");
    return {id:id("STRUCTURE"),name,type,parentId,reason,status:"PROPOSED",classifierVersion:this.version,createdAt:new Date().toISOString()};
  }
  status(){return {id:this.id,version:this.version,terra:TERRA_ORDER.map(x=>STRUCTURAL_LAYERS[x]),ceu:CEU_ORDER.map(x=>STRUCTURAL_LAYERS[x])};}
}
