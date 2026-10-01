export const WORLD_ROUTES = Object.freeze({
  CUSTOMER_TO_ORDER: ["CHANNEL", "ATTENDANT", "COMMERCE_CITY", "ORDER"],
  ORDER_TO_SUPPLIER: ["COMMERCE_CITY", "SUPPLIER"],
  ORDER_TO_LOGISTICS: ["SUPPLIER", "LOGISTICS"],
  COMMERCE_TO_ACCOUNTS: ["COMMERCE_CITY", "ACCOUNTS"],
  CITY_TO_MARKETING: ["TERRA", "RODOVIA", "CEU", "MARKETING"],
  MARKETING_TO_FACTORY: ["MARKETING", "DARK_FACTORY"],
  FACTORY_TO_CITY: ["DARK_FACTORY", "RODOVIA", "TERRA", "COMMERCE_CITY"],
  CITY_TO_LIBRARY: ["COMMERCE_CITY", "LIBRARY"]
});

const SERVICE_ROUTES = Object.freeze({
  MARKETING: WORLD_ROUTES.CITY_TO_MARKETING,
  DARK_FACTORY: ["TERRA", "RODOVIA", "CEU", "DARK_FACTORY"]
});

export function routeServiceRequest(request) {
  if (!request || request.status !== "DISPATCHED_TO_HEAVEN") {
    throw new Error("SERVICE_ROUTE_NOT_READY");
  }

  const route = SERVICE_ROUTES[request.service];
  if (!route) throw new Error("SERVICE_ROUTE_NOT_FOUND");

  return {
    requestId: request.id,
    origin: "TERRA",
    destination: "CEU",
    service: request.service,
    route,
    status: "ROUTED"
  };
}
