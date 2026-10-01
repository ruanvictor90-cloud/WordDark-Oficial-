/* WordDark Lab — Identity IDs */
class WordDarkLabId {
  static create(type, sequence) {
    const map = {
      CLIENT:"WD-CLI",
      CHANNEL:"WD-CH",
      PROJECT:"WD-PRJ",
      OPERATION:"WD-OP",
      REQUEST:"WD-REQ",
      MESSAGE:"WD-MSG",
      USER:"WD-USR",
      RESULT:"WD-RES",
      SERVICE:"WD-SVC",
      CONNECTOR:"WD-CON",
      GATE:"WD-GATE",
      ERROR:"WD-ERR"
    };
    if (!map[type]) throw new Error("Tipo de ID inválido: "+type);
    const n=String(sequence).padStart(4,"0");
    return map[type]+"-"+n;
  }
  static validate(id) {
    return /^(WD-(CLI|CH|PRJ|OP|REQ|MSG|USR|RES|SVC|CON|GATE|ERR)-[0-9]{4,})$/.test(id||"");
  }
}
if(typeof module!=="undefined") module.exports=WordDarkLabId;
if(typeof window!=="undefined") window.WordDarkLabId=WordDarkLabId;
