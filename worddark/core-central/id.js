/* WordDark — Identificador não secreto para registros internos.
 * Não usar este identificador como token de autenticação ou segredo.
 */
export function id(prefix = "ID") {
  const token = globalThis.crypto?.randomUUID?.()
    || (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12));
  return String(prefix || "ID").replace(/[^a-zA-Z0-9_-]/g, "-") + "-" + token;
}
