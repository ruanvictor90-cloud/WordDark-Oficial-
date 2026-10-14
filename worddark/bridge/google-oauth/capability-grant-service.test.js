import assert from "node:assert/strict";
import {createCapabilityGrantService} from "./capability-grant-service.js";

function fixture({scope="youtube.upload",authorized=true,approved=true,connection=true,auditFails=false}={}){
  const record=connection?{providerId:"YOUTUBE",accountId:"channel-1",status:"PERSISTED",scope,capabilities:[]}:null;
  const events=[],claims=new Map();let mutationCount=0;
  const connectionStore={
    async load(){return record?structuredClone(record):null;},
    async setCapability({providerId,accountId,capability,granted}){
      if(!record||record.providerId!==providerId||record.accountId!==accountId)throw new Error("CONNECTION_MISMATCH");
      const next=new Set(record.capabilities||[]);
      if(granted)next.add(capability);else next.delete(capability);
      record.capabilities=[...next];mutationCount++;
      return{capabilities:[...record.capabilities]};
    }
  };
  const idempotencyStore={
    async claim(key,{requestFingerprint}){if(claims.has(key))return{claimed:false,status:"DUPLICATE"};claims.set(key,{requestFingerprint,status:"IN_PROGRESS"});return{claimed:true};},
    async complete(key,result){const item=claims.get(key);if(!item||item.requestFingerprint!==result.requestFingerprint)throw new Error("CLAIM_MISMATCH");Object.assign(item,result);}
  };
  const service=createCapabilityGrantService({
    connectionStore,
    authenticateOperator:async()=>({authenticated:true,operatorId:"operator-1"}),
    authorizeOperation:async()=>({allowed:authorized}),
    approveOperation:async()=>approved?({allowed:true,approvalId:"approval-1"}):({allowed:false}),
    idempotencyStore,
    audit:async event=>{if(auditFails)throw new Error("AUDIT_DOWN");events.push(event);},
    clock:()=>new Date("2026-10-13T12:00:00.000Z")
  });
  const input={idempotencyKey:"grant-1",request:{requestId:"request-1",operationId:"operation-1",providerId:"YOUTUBE",accountId:"channel-1",action:"CAPABILITY_GRANT",capability:"CONTENT_PUBLICATION",approvalRef:"approval-1"}};
  return{service,input,record,events,claims,get mutationCount(){return mutationCount;}};
}

const granted=fixture();
const result=await granted.service.execute(granted.input);
assert.equal(result.success,true);
assert.equal(result.status,"CAPABILITY_GRANTED");
assert.deepEqual(granted.record.capabilities,["CONTENT_PUBLICATION"]);
assert.equal(granted.mutationCount,1);
assert.equal(granted.events[0].type,"CAPABILITY_CHANGE_AUTHORIZED");
assert.equal(JSON.stringify(granted.events).includes("ACCESS_TOKEN"),false);

const duplicate=await granted.service.execute(granted.input);
assert.equal(duplicate.success,false);
assert.equal(duplicate.status,"DUPLICATE");
assert.equal(granted.mutationCount,1);

const missingScope=fixture({scope:"youtube.readonly"});
assert.equal((await missingScope.service.execute(missingScope.input)).status,"OAUTH_SCOPE_REQUIRED");
assert.equal(missingScope.mutationCount,0);

const missingConnection=fixture({connection:false});
assert.equal((await missingConnection.service.execute(missingConnection.input)).status,"PERSISTED_CONNECTION_REQUIRED");
assert.equal(missingConnection.mutationCount,0);

const noPermission=fixture({authorized:false});
assert.equal((await noPermission.service.execute(noPermission.input)).status,"CAPABILITY_PERMISSION_DENIED");
assert.equal(noPermission.mutationCount,0);

const noApproval=fixture({approved:false});
assert.equal((await noApproval.service.execute(noApproval.input)).status,"CAPABILITY_APPROVAL_REQUIRED");
assert.equal(noApproval.mutationCount,0);

const auditDown=fixture({auditFails:true});
assert.equal((await auditDown.service.execute(auditDown.input)).status,"CAPABILITY_AUDIT_UNAVAILABLE");
assert.equal(auditDown.mutationCount,0);

const revoked=fixture();
revoked.record.capabilities=["CONTENT_PUBLICATION"];
const revokeInput={idempotencyKey:"revoke-1",request:{...revoked.input.request,action:"CAPABILITY_REVOKE"}};
const revoke=await revoked.service.execute(revokeInput);
assert.equal(revoke.status,"CAPABILITY_REVOKED");
assert.deepEqual(revoked.record.capabilities,[]);

const mismatchedApproval=fixture();
mismatchedApproval.input.request.approvalRef="other-approval";
assert.equal((await mismatchedApproval.service.execute(mismatchedApproval.input)).status,"CAPABILITY_APPROVAL_REQUIRED");
assert.equal(mismatchedApproval.mutationCount,0);

console.log("capability-grant-service.test: OK");
