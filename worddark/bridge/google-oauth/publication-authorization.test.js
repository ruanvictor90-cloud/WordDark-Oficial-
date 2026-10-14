import assert from "node:assert/strict";
import {createPublicationAuthorizationGate} from "./publication-authorization.js";

function dependencies(overrides={}){
  const records=[];
  const claims=new Map();
  const idempotencyStore={
    async claim(key,{requestFingerprint,operationId}){
      if(claims.has(key))return{claimed:false,status:claims.get(key).requestFingerprint===requestFingerprint?"DUPLICATE_PUBLICATION_REQUEST":"IDEMPOTENCY_KEY_REUSED"};
      claims.set(key,{requestFingerprint,operationId,status:"IN_PROGRESS"});
      return{claimed:true};
    },
    async complete(key,result){
      const old=claims.get(key);
      if(!old||old.requestFingerprint!==result.requestFingerprint)throw new Error("IDEMPOTENCY_RECORD_MISMATCH");
      claims.set(key,{...old,...result});
    }
  };
  const options={
    authenticateOperator:async()=>({authenticated:true,operatorId:"operator-1"}),
    authorizeOperation:async()=>({allowed:true}),
    approveOperation:async()=>({allowed:true,approvalId:"approval-1"}),
    consumeQuota:async()=>({allowed:true}),
    idempotencyStore,
    audit:async event=>{records.push(event);},
    clock:()=>new Date("2026-10-13T00:00:00.000Z"),
    ...overrides
  };
  return{gate:createPublicationAuthorizationGate(options),records,claims};
}
const request={
  requestId:"req-1",operationId:"op-1",providerId:"YOUTUBE",accountId:"channel-1",
  action:"CONTENT_PUBLISH",capability:"CONTENT_PUBLICATION",environment:"PROD",
  payload:{title:"Launch",secret:"MUST_NOT_BE_LOGGED",mediaBytes:"MUST_NOT_BE_LOGGED"}
};

const setup=dependencies();
const authorized=await setup.gate.authorize({request,idempotencyKey:"publish-001"});
assert.equal(authorized.allowed,true);
assert.equal(authorized.serverAuthorized,true);
assert.equal(authorized.mode,"AUTOMATIC");
assert.equal(authorized.approvalId,"approval-1");
assert.equal(JSON.stringify(setup.records).includes("MUST_NOT_BE_LOGGED"),false,"Audit records must not contain payloads, secrets or media bytes");
const completed=await setup.gate.complete(authorized,{status:"UPLOAD_COMPLETED",externalId:"video-1"});
assert.equal(completed.success,true);
assert.equal(setup.records.at(-1).type,"PUBLICATION_FINISHED");
assert.equal(setup.claims.get("publish-001").externalId,"video-1");

const missingOperator=dependencies({authenticateOperator:async()=>null});
const noOperator=await missingOperator.gate.authorize({request,idempotencyKey:"publish-002"});
assert.equal(noOperator.status,"OPERATOR_AUTH_REQUIRED");

const noApproval=dependencies({approveOperation:async()=>({allowed:true})});
const approvalDenied=await noApproval.gate.authorize({request,idempotencyKey:"publish-003"});
assert.equal(approvalDenied.status,"PUBLICATION_APPROVAL_REQUIRED");

const quotaBlocked=dependencies({consumeQuota:async()=>({allowed:false})});
const quotaDenied=await quotaBlocked.gate.authorize({request,idempotencyKey:"publish-004"});
assert.equal(quotaDenied.status,"PUBLICATION_QUOTA_EXCEEDED");
assert.equal(quotaBlocked.claims.get("publish-004").status,"PUBLICATION_QUOTA_EXCEEDED");

const duplicate=dependencies();
await duplicate.gate.authorize({request,idempotencyKey:"publish-005"});
const second=await duplicate.gate.authorize({request,idempotencyKey:"publish-005"});
assert.equal(second.status,"DUPLICATE_PUBLICATION_REQUEST");

const mismatch=dependencies();
const badAction=await mismatch.gate.authorize({request:{...request,action:"CONTENT_ROUTE"},idempotencyKey:"publish-006"});
assert.equal(badAction.status,"PUBLICATION_ACTION_MISMATCH");

const wrongEnvironment=dependencies();
const testEnvironment=await wrongEnvironment.gate.authorize({request:{...request,environment:"TEST"},idempotencyKey:"publish-007"});
assert.equal(testEnvironment.status,"PRODUCTION_CONTEXT_REQUIRED");

const brokenAudit=dependencies({audit:async()=>{throw new Error("audit unavailable");}});
const auditDenied=await brokenAudit.gate.authorize({request,idempotencyKey:"publish-008"});
assert.equal(auditDenied.status,"PUBLICATION_AUDIT_UNAVAILABLE");
assert.equal(brokenAudit.claims.get("publish-008").status,"PUBLICATION_AUDIT_UNAVAILABLE");

assert.throws(()=>createPublicationAuthorizationGate({}),/PUBLICATION_GATE_DEPENDENCY_REQUIRED/);
console.log("publication-authorization.test: OK");
