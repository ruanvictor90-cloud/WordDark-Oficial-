const WordDarkAccount = require("../contracts/account");
const WordDarkAccountManager = require("./account-manager");

const manager = new WordDarkAccountManager();
manager.register(new WordDarkAccount({
  accountId:"ACC-DEV-001",
  identityId:"DEV-001",
  type:"DEV"
}));

if (!manager.get("ACC-DEV-001")) throw new Error("Conta não registrada.");
manager.suspend("ACC-DEV-001");
if (manager.get("ACC-DEV-001").status !== "SUSPENDED") throw new Error("Conta não foi suspensa.");
manager.activate("ACC-DEV-001");
if (!manager.get("ACC-DEV-001").isActive()) throw new Error("Conta não foi reativada.");

console.log("account-manager.test: OK");
