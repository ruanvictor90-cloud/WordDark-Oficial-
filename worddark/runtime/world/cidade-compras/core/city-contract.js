export const CITY_CONTRACT_V1 = Object.freeze({
  layer: "TERRA",
  responsibility: "MULTICHANNEL_COMMERCE",
  sectors: Object.freeze([
    "GATE","COMMUNICATION","ATTENDANCE","COMMERCE","ACCOUNTS",
    "SUPPLIERS","LOGISTICS","AFTER_SALES","INCIDENTS","LIBRARY"
  ]),
  externalServices: Object.freeze(["MARKETING","DARK_FACTORY"]),
  rules: Object.freeze([
    "CITY_OWNS_COMMERCE",
    "CHANNELS_ARE_MULTIPLE",
    "SERVICES_OF_CEU_ARE_REQUESTED_NOT_EMBEDDED",
    "EVERY_OPERATION_HAS_HISTORY",
    "EVERY_ENTRY_PASSES_GATE"
  ])
});

export function validateCityContract(city) {
  if (!city || city.layer !== CITY_CONTRACT_V1.layer) throw new Error("CITY_LAYER_INVALID");
  if (city.responsibility !== CITY_CONTRACT_V1.responsibility) throw new Error("CITY_RESPONSIBILITY_INVALID");
  for (const sector of CITY_CONTRACT_V1.sectors) {
    if (!city.sectors.includes(sector)) throw new Error("CITY_SECTOR_MISSING");
  }
  return true;
}
