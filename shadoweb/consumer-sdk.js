const APP_ID = /^[a-z][a-z0-9-]{1,47}$/;

export function createShadowebClient({ appId, bridge, registry }) {
  if (typeof appId !== "string" || !APP_ID.test(appId)) throw new Error("ID de aplicativo consumidor inválido.");
  if (!bridge || typeof bridge.request !== "function") throw new Error("Bridge Shadoweb indisponível.");
  if (!registry || typeof registry.authorize !== "function") throw new Error("Registro de permissões Shadoweb indisponível.");
  return Object.freeze({
    appId,
    async request({ connectorId, action, input, scope }) {
      if (typeof scope !== "string" || !scope.trim()) throw new Error("O escopo é obrigatório.");
      registry.authorize(appId, connectorId, scope);
      return bridge.request({ connectorId, action, input }, { scope, appId });
    }
  });
}
