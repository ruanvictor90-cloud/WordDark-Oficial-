import assert from "node:assert/strict";
import {createPublicationStore} from "./publication-store.js";

function fakeFirestore(){
  const collections=new Map();
  let nextId=0;
  function docFor(collection,id){
    const records=collections.get(collection)||new Map();
    collections.set(collection,records);
    return{
      id,
      async get(){return{exists:records.has(id),data:()=>records.get(id)};},
      async set(data){records.set(id,{...(records.get(id)||{}),...data});},
      async create(data){if(records.has(id))throw new Error("DOCUMENT_EXISTS");records.set(id,data);},
      async update(data){if(!records.has(id))throw new Error("DOCUMENT_MISSING");records.set(id,{...records.get(id),...data});}
    };
  }
  const firestore={
    collection(name){return{doc(id){return docFor(name,id||"auto-"+(++nextId));}};},
    async runTransaction(callback){
      const pending=[];
      const tx={
        async get(ref){return ref.get();},
        create(ref,data){pending.push(()=>ref.create(data));},
        update(ref,data){pending.push(()=>ref.update(data));},
        set(ref,data){pending.push(()=>ref.set(data));}
      };
      const result=await callback(tx);
      for(const apply of pending)await apply();
      return result;
    },
    _records:collections
  };
  return firestore;
}
const clock=()=>new Date("2026-10-13T12:00:00.000Z");
const firestore=fakeFirestore();
const store=createPublicationStore({firestore,clock});
const fingerprint="a".repeat(64);

const first=await store.claim("publish-1",{requestFingerprint:fingerprint,operationId:"operation-1"});
assert.deepEqual(first,{claimed:true});
const duplicate=await store.claim("publish-1",{requestFingerprint:fingerprint,operationId:"operation-1"});
assert.equal(duplicate.status,"DUPLICATE_PUBLICATION_REQUEST");
const reused=await store.claim("publish-1",{requestFingerprint:"b".repeat(64),operationId:"operation-2"});
assert.equal(reused.status,"IDEMPOTENCY_KEY_REUSED");

const completed=await store.complete("publish-1",{requestFingerprint:fingerprint,status:"UPLOAD_COMPLETED",externalId:"video-123"});
assert.equal(completed.updated,true);
const repeatedComplete=await store.complete("publish-1",{requestFingerprint:fingerprint,status:"UPLOAD_COMPLETED",externalId:"video-123"});
assert.equal(repeatedComplete.status,"ALREADY_RECORDED");
await assert.rejects(()=>store.complete("publish-1",{requestFingerprint:fingerprint,status:"DIFFERENT_RESULT"}),/PUBLICATION_RESULT_ALREADY_FINAL/);

const principal={operatorId:"operator-1"};
const request={providerId:"YOUTUBE",accountId:"channel-1"};
// Sequential checks exercise the cap deterministically; production uses Firestore transactions for atomic reservations.
const quotaStore=createPublicationStore({firestore:fakeFirestore(),clock});
assert.equal((await quotaStore.consumeQuota({principal,request,limit:2,windowMs:86400000})).allowed,true);
assert.equal((await quotaStore.consumeQuota({principal,request,limit:2,windowMs:86400000})).allowed,true);
assert.equal((await quotaStore.consumeQuota({principal,request,limit:2,windowMs:86400000})).allowed,false);

const audit=await store.audit({at:clock().toISOString(),type:"PUBLICATION_AUTHORIZED",status:"AUTHORIZED",operatorId:"operator-1",idempotencyKeyHash:"c".repeat(64),payload:"DO_NOT_STORE",accessToken:"DO_NOT_STORE"});
assert.equal(audit.recorded,true);
const auditRecords=[...(firestore._records.get("worddarkPublicationAudit")||new Map()).values()];
assert.equal(auditRecords.length,1);
assert.equal(JSON.stringify(auditRecords).includes("DO_NOT_STORE"),false);
assert.equal(JSON.stringify(auditRecords).includes("accessToken"),false);

await assert.rejects(()=>store.claim("../unsafe",{requestFingerprint:fingerprint,operationId:"operation-1"}),/IDEMPOTENCY_KEY_INVALID/);
assert.throws(()=>createPublicationStore({}),/PUBLICATION_FIRESTORE_REQUIRED/);
console.log("publication-store.test: OK");
