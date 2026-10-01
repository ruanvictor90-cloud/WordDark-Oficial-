const WordDarkEnvironment = require("../contracts/environment");
const WordDarkEnvironmentGuard = require("./environment-guard");

const test = new WordDarkEnvironment({name:"TEST"});
const prod = new WordDarkEnvironment({name:"PROD"});

const guard = new WordDarkEnvironmentGuard({
  environments:{TEST:test, PROD:prod},
  productionApproval:() => ({allowed:false, reason:"APROVACAO_AUSENTE"})
});

const testResult = guard.canRun({environment:"TEST"});
if (!testResult.allowed) throw new Error("TEST deveria estar liberado.");

const prodResult = guard.canRun({environment:"PROD"});
if (prodResult.allowed) throw new Error("PROD não deveria executar sem aprovação.");

console.log("environment-guard.test: OK");
