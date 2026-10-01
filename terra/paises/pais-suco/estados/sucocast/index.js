export const SucoCastState={id:"SUCOCAST",type:"ESTADO",countryId:"PAIS-SUCO",responsibility:"CHANNEL_BRANCH"};
export function createSucoCastCity(){return {id:"SUCOCAST-CIDADE",type:"CIDADE",stateId:"SUCOCAST",responsibility:"STATE_OPERATING_SYSTEM",status:"ACTIVE"};}
export function createSucoCastNeighborhood(){return {id:"SUCOCAST-BAIRRO",type:"BAIRRO",cityId:"SUCOCAST-CIDADE",responsibility:"NEEDS_MANAGEMENT",requests:[]};}
