/* WordDark — Account Manager
 * Registro e ciclo de vida de contas.
 * Não armazena senha/token e não representa autenticação de produção.
 */
class WordDarkAccountManager {
  constructor({ accounts = null, security = null } = {}) {
    this.accounts = accounts || new Map();
    this.security = security || null;
  }

  register(account) {
    const validation = account.validate();
    if (!validation.valid) throw new Error(validation.errors.join(" "));
    if (this.accounts.has(account.accountId)) throw new Error("Conta já registrada: " + account.accountId);
    this.accounts.set(account.accountId, account);
    return account;
  }

  get(accountId) { return this.accounts.get(accountId) || null; }

  suspend(accountId) { return this._setStatus(accountId, "SUSPENDED"); }
  revoke(accountId) { return this._setStatus(accountId, "REVOKED"); }
  activate(accountId) { return this._setStatus(accountId, "ACTIVE"); }

  _setStatus(accountId, status) {
    const account = this.get(accountId);
    if (!account) return null;
    account.status = status;
    return account;
  }

  list() { return [...this.accounts.values()].map(account => account.toJSON()); }
}
if (typeof module !== "undefined") module.exports = WordDarkAccountManager;
if (typeof window !== "undefined") window.WordDarkAccountManager = WordDarkAccountManager;
