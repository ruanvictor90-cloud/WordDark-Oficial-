const assert = require("node:assert/strict");
const WordDarkEnvironment = require("../contracts/environment");
const WordDarkEnvironmentGuard = require("./environment-guard");

const test = new WordDarkEnvironment({ name: "TEST" });
const prod = new WordDarkEnvironment({ name: "PROD" });

const guard = new WordDarkEnvironmentGuard({
  environments: { TEST: test, PROD: prod },
  productionApproval: () => ({ allowed: false, reason: "APROVACAO_AUSENTE" })
});

assert.deepEqual(guard.canRun({ environment: "TEST" }), {
  allowed: true,
  reason: "ENVIRONMENT_ALLOWED"
});

assert.deepEqual(guard.canRun({ environment: "PROD" }), {
  allowed: false,
  reason: "APROVACAO_AUSENTE"
});

assert.equal(guard.canRun({ environment: "STAGING" }).allowed, false);
assert.equal(guard.canRun({}).reason, "AMBIENTE_INVALIDO");
assert.equal(guard.canRun(null).reason, "OPERACAO_INVALIDA");

const unconfigured = new WordDarkEnvironmentGuard();
assert.equal(unconfigured.canRun({ environment: "TEST" }).reason, "AMBIENTE_NAO_CONFIGURADO");
assert.equal(unconfigured.canRun({ environment: "PROD" }).reason, "AMBIENTE_NAO_CONFIGURADO");

const noProductionApproval = new WordDarkEnvironmentGuard({
  environments: { TEST: test, PROD: prod }
});
assert.equal(noProductionApproval.canRun({ environment: "PROD" }).reason, "PROD_SEM_APROVACAO_CONFIGURADA");

const approvedProduction = new WordDarkEnvironmentGuard({
  environments: { TEST: test, PROD: prod },
  productionApproval: () => ({ allowed: true, reference: "APPROVAL-TEST-001" })
});
assert.equal(approvedProduction.canRun({ environment: "PROD" }).allowed, true);

const failingApproval = new WordDarkEnvironmentGuard({
  environments: { TEST: test, PROD: prod },
  productionApproval: () => { throw new Error("approval service unavailable"); }
});
assert.equal(failingApproval.canRun({ environment: "PROD" }).reason, "PROD_APROVACAO_FALHOU");

const lockedTest = new WordDarkEnvironment({ name: "TEST", status: "LOCKED" });
const lockedGuard = new WordDarkEnvironmentGuard({
  environments: { TEST: lockedTest, PROD: prod },
  productionApproval: () => ({ allowed: true })
});
assert.equal(lockedGuard.canRun({ environment: "TEST" }).reason, "AMBIENTE_BLOQUEADO");

console.log("environment-guard.test: OK");
