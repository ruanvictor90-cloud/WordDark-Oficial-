const ACTIONS = new Set([
  "ENTER_CITY",
  "VIEW",
  "OPERATE",
  "REQUEST_SERVICE"
]);

export function authorizeCityAction({ actorId, actorRole, action, cityId }) {
  if (!actorId || !actorRole || !action || !cityId) {
    throw new Error("INVALID_AUTHORIZATION");
  }

  if (!ACTIONS.has(action)) {
    throw new Error("ACTION_NOT_ALLOWED");
  }

  const allowedRoles = {
    ADMIN: ACTIONS,
    MANAGER: new Set(["ENTER_CITY", "VIEW", "OPERATE", "REQUEST_SERVICE"]),
    OPERATOR: new Set(["ENTER_CITY", "VIEW", "OPERATE", "REQUEST_SERVICE"]),
    VIEWER: new Set(["ENTER_CITY", "VIEW"]),
    CUSTOMER: new Set(["ENTER_CITY", "VIEW"])
  };

  const roleActions = allowedRoles[actorRole];
  if (!roleActions || !roleActions.has(action)) {
    throw new Error("PERMISSION_DENIED");
  }

  return {
    authorized: true,
    actorId,
    actorRole,
    action,
    cityId
  };
}
