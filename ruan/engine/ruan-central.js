import { createRuanEngine } from "./central-engine.js";
import { createRuanSovereignCore } from "./sovereign-core.js";

/** Composes the existing personal engine with a request-only sovereign boundary. */
export function createRuanCentral(options = {}) {
  const personal = createRuanEngine(options.personal || {});
  const sovereignty = createRuanSovereignCore({ now: options.now, idFactory: options.idFactory });
  return Object.freeze({
    personal,
    owner: sovereignty.owner,
    connectPeer: sovereignty.connectPeer,
    status() {
      return {
        identity: "RUAN",
        authority: "SOVEREIGN",
        personalEngineAvailable: true,
        peerAccess: "REQUEST_ONLY",
        externalPersonalWrites: false,
        externalApprovalAccess: false,
        sovereignty: sovereignty.owner.status()
      };
    }
  });
}
