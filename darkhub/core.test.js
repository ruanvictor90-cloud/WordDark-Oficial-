import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto?.subtle) globalThis.crypto = webcrypto;
import { DarkHubVault, DARKHUB_STORAGE_KEYS } from "./core.js";

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

test("vault encrypts records and reopens them only with the correct passphrase", async () => {
  const storage = new MemoryStorage();
  const vault = new DarkHubVault(storage);
  await vault.setup("uma-frase-secreta-forte");
  await vault.createProject({ name: "Projeto confidencial", owner: "darkHub", status: "Planejado" });
  const encrypted = storage.getItem(DARKHUB_STORAGE_KEYS.vault);
  assert.ok(encrypted);
  assert.equal(encrypted.includes("Projeto confidencial"), false);
  vault.lock();
  const wrongVault = new DarkHubVault(storage);
  await assert.rejects(wrongVault.unlock("frase-errada-123"), /Frase secreta incorreta/);
  const reopened = new DarkHubVault(storage);
  await reopened.unlock("uma-frase-secreta-forte");
  assert.equal(reopened.getState().projects[0].name, "Projeto confidencial");
  assert.ok(reopened.getState().audit.some(item => item.event === "security.vault_unlocked"));
});

test("analysis records and app specifications validate inputs", async () => {
  const storage = new MemoryStorage();
  const vault = new DarkHubVault(storage);
  await vault.setup("frase-de-teste-mais-forte");
  const review = await vault.createAnalysis("technical", { title: "Revisão", target: "core.js", findings: "Teste executado", status: "Aprovada", severity: "Baixo" });
  await assert.rejects(vault.updateStatus("technicalAnalyses", review.id, "Acesso total"), /Estado não permitido/);
  await assert.rejects(vault.createApp({ name: "Inválido", slug: "../bad", description: "Não deve ser aceito" }), /identificador interno/);
  await vault.createApp({ name: "Base independente", slug: "base-independente", description: "Descrição inicial", type: "standalone", platform: "Web responsiva", security: "Isolamento local" });
  await assert.rejects(vault.createApp({ name: "Duplicado", slug: "base-independente", description: "Outro registro" }), /já existe/);
  const state = vault.getState();
  assert.equal(state.technicalAnalyses.length, 1);
  assert.equal(state.apps.length, 1);
});

test("generated app files escape user text and include restrictive policy", async () => {
  const vault = new DarkHubVault(new MemoryStorage());
  await vault.setup("outra-frase-secreta-forte");
  const app = await vault.createApp({ name: "Teste <script>", slug: "teste-seguro", description: "Descrição <img src=x onerror=alert(1)>", type: "standalone", platform: "Web", security: "Review" });
  const output = await vault.exportAppFiles(app.id);
  assert.match(output.html, /&lt;script&gt;/);
  assert.match(output.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(output.html, /<script\b/i);
  assert.match(output.html, /Content-Security-Policy/);
  assert.equal(output.manifest.id, "teste-seguro");
  assert.match(output.css, /:root/);
  assert.match(output.html, /app.css/);
});

test("lock clears the in-memory decrypted state", async () => {
  const vault = new DarkHubVault(new MemoryStorage());
  await vault.setup("bloqueio-de-teste-seguro");
  vault.lock();
  assert.equal(vault.isUnlocked, false);
  assert.throws(() => vault.getState(), /cofre está bloqueado/i);
});

test("encrypted backups restore only with the correct phrase and preserve validated records", async () => {
  const sourceStorage = new MemoryStorage();
  const source = new DarkHubVault(sourceStorage);
  await source.setup("backup-phrase-is-strong");
  await source.createProject({ name: "Shadoweb handoff", owner: "Shadoweb", status: "Planejado" });
  const backup = await source.exportEncryptedBackup();
  assert.equal(JSON.stringify(backup).includes("Shadoweb handoff"), false);

  const targetStorage = new MemoryStorage();
  const target = new DarkHubVault(targetStorage);
  await assert.rejects(target.restoreEncryptedBackup(backup, "wrong-phrase-123"), /não corresponde/);
  assert.equal(targetStorage.getItem(DARKHUB_STORAGE_KEYS.security), null);

  await target.restoreEncryptedBackup(backup, "backup-phrase-is-strong");
  assert.equal(target.isUnlocked, true);
  assert.equal(target.getState().projects[0].name, "Shadoweb handoff");
  assert.ok(target.getState().audit.some(item => item.event === "security.backup_restored"));
  target.lock();
  const reopened = new DarkHubVault(targetStorage);
  await reopened.unlock("backup-phrase-is-strong");
  assert.equal(reopened.getState().projects[0].name, "Shadoweb handoff");
});

test("encrypted backup restore rejects malformed structure without writing it", async () => {
  const storage = new MemoryStorage();
  const vault = new DarkHubVault(storage);
  await assert.rejects(vault.restoreEncryptedBackup({ format: "wrong", version: 1 }, "some-phrase-123"), /inválido/);
  assert.equal(storage.getItem(DARKHUB_STORAGE_KEYS.security), null);
});
