const CITY_TYPE = "COMMERCE_CITY";
const CITY_LAYER = "TERRA";

export function createCommerceCity({
  id,
  name = "Cidade de Compras",
  countryId = null,
  stateId = null
}) {
  if (!id) throw new Error("INVALID_CITY");

  return {
    id,
    name,
    type: CITY_TYPE,
    layer: CITY_LAYER,
    countryId,
    stateId,
    responsibility: "MULTICHANNEL_COMMERCE",
    entryGateId: `${id}-GATE`,
    sectors: [
      "GATE",
      "COMMUNICATION",
      "ATTENDANCE",
      "COMMERCE",
      "ACCOUNTS",
      "SUPPLIERS",
      "LOGISTICS",
      "AFTER_SALES",
      "INCIDENTS",
      "LIBRARY"
    ],
    channels: [],
    externalServices: ["MARKETING", "DARK_FACTORY"],
    status: "DEVELOPMENT",
    history: [{ event: "CITY_CREATED", at: new Date().toISOString() }]
  };
}

export function registerChannel(city, channelId) {
  if (!city || !channelId) throw new Error("INVALID_CHANNEL_REGISTRATION");
  if (city.channels.includes(channelId)) return city;

  return {
    ...city,
    channels: [...city.channels, channelId],
    history: [
      ...city.history,
      { event: "CHANNEL_REGISTERED", channelId, at: new Date().toISOString() }
    ]
  };
}

export function activateCommerceCity(city) {
  if (!city || city.type !== CITY_TYPE) throw new Error("INVALID_CITY");
  return {
    ...city,
    status: "ACTIVE",
    history: [
      ...city.history,
      { event: "CITY_ACTIVATED", at: new Date().toISOString() }
    ]
  };
}
