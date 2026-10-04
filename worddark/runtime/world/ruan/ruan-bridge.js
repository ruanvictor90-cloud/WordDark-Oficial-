// WordDark — Ponte Ruan ↔ WordDark v0.1
// A ponte não permite entrada automática do WordDark na área pessoal.
// Somente Ruan cria uma solicitação explícita ao mundo.

export const WordDarkRuanBridge = {
  createRequest({intent, payload={}, share=[]}={}){
    if(!intent) throw new Error("Uma intenção é obrigatória");
    return {
      type:"RUAN_TO_WORDDARK_REQUEST",
      requestId:"RUAN-REQ-"+Date.now(),
      source:"RUAN",
      destination:"WORDDARK",
      intent,
      payload,
      share,
      authorization:"EXPLICIT_USER_REQUEST",
      createdAt:new Date().toISOString()
    };
  },
  canWorldEnter(){ return false; },
  canShareAutomatically(){ return false; },
  receiveWorldResponse(response){
    return {
      type:"WORDDARK_TO_RUAN_RESPONSE",
      source:"WORDDARK",
      destination:"RUAN",
      response,
      receivedAt:new Date().toISOString()
    };
  }
};

if(typeof window!=="undefined") window.WordDarkRuanBridge=WordDarkRuanBridge;
