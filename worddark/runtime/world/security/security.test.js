const assert = require("assert");
const WordDarkIdentity = require("../contracts/identity");
const WordDarkAccessRule = require("../contracts/access");
const WordDarkSecurityManager = require("./security-manager");

function runSecurityMVPTests(){
  const security = new WordDarkSecurityManager();
  security.registerIdentity(new WordDarkIdentity({identityId:"CITY-TEST",type:"UNIT"}));
  security.grant(new WordDarkAccessRule({
    identityId:"CITY-TEST",capability:"content.produce",action:"request",
    environment:"TEST",scope:"world/sky/darkfactory"
  }));

  const allowed = security.authorize({
    identityId:"CITY-TEST",operationId:"OP-001",capability:"content.produce",
    action:"request",environment:"TEST",scope:"world/sky/darkfactory"
  });
  assert.strictEqual(allowed.allowed,true);
  assert.strictEqual(allowed.reason,"AUTHORIZED");

  const unknown = security.authorize({
    identityId:"UNKNOWN",capability:"content.produce",action:"request",
    environment:"TEST",scope:"world/sky/darkfactory"
  });
  assert.strictEqual(unknown.allowed,false);
  assert.strictEqual(unknown.reason,"IDENTITY_NOT_FOUND");

  const wrongAction = security.authorize({
    identityId:"CITY-TEST",capability:"content.produce",action:"publish",
    environment:"TEST",scope:"world/sky/darkfactory"
  });
  assert.strictEqual(wrongAction.allowed,false);
  assert.strictEqual(wrongAction.reason,"ACCESS_DENIED");

  const wrongEnvironment = security.authorize({
    identityId:"CITY-TEST",capability:"content.produce",action:"request",
    environment:"PROD",scope:"world/sky/darkfactory"
  });
  assert.strictEqual(wrongEnvironment.allowed,false);

  const wrongScope = security.authorize({
    identityId:"CITY-TEST",capability:"content.produce",action:"request",
    environment:"TEST",scope:"world/earth/other"
  });
  assert.strictEqual(wrongScope.allowed,false);

  const audit = security.getAudit();
  assert.strictEqual(audit.length,5);
  assert.strictEqual(audit[0].allowed,true);

  const expired = new WordDarkAccessRule({
    identityId:"CITY-TEST",capability:"content.read",action:"request",
    environment:"TEST",scope:"world/earth",expiresAt:"2000-01-01T00:00:00.000Z"
  });
  assert.strictEqual(expired.validate().valid,true);
  security.grant(expired);
  const expiredDecision = security.authorize({
    identityId:"CITY-TEST",capability:"content.read",action:"request",
    environment:"TEST",scope:"world/earth"
  });
  assert.strictEqual(expiredDecision.allowed,false);

  const invalidDateRule = new WordDarkAccessRule({
    identityId:"CITY-TEST",capability:"content.read",action:"request",
    environment:"TEST",scope:"world/earth",expiresAt:"invalid-date"
  });
  assert.strictEqual(invalidDateRule.validate().valid,false);

  return {passed:true,auditCount:security.getAudit().length};
}

if(require.main===module) console.log(runSecurityMVPTests());
module.exports=runSecurityMVPTests;
