const SCHEMA = "darkhub-backup-v1";
const COMPONENTS = ["runtime", "orchestrator", "shadow", "workspace", "rodovia"];

export function createDarkHubBackup({ runtime, orchestrator, shadow, workspace, rodovia, now = () => new Date().toISOString() } = {}) {
  const engines = { runtime, orchestrator, shadow, workspace, rodovia };
  for (const name of COMPONENTS) {
    if (!engines[name] || typeof engines[name].exportState !== "function") {
      throw new TypeError("O componente " + name + " não oferece exportState().");
    }
  }

  return {
    schema: SCHEMA,
    exportedAt: now(),
    scope: "local-state-snapshot",
    components: {
      darkHub: runtime.exportState(),
      orchestrator: orchestrator.exportState(),
      shadow: shadow.exportState(),
      workspace: workspace.exportState(),
      rodovia: rodovia.exportState()
    },
    limitations: [
      "Este arquivo reúne dados locais para preservação; a restauração integral deste pacote pela interface ainda não está disponível.",
      "Rotas, endpoints executáveis e conexões remotas não são recriados por importar dados.",
      "A exportação não sincroniza dispositivos nem publica projetos."
    ]
  };
}

export const DARKHUB_BACKUP_SCHEMA = SCHEMA;
