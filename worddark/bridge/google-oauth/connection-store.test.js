import assert from "node:assert/strict";
import {createConnectionStore} from "./connection-store.js";

const docs=new Map();
const firestore={collection(name){assert.equal(name,"connections-test");return{doc(id){return{
  async set(value,options){docs.set(id,{...value,options})},
  async get(){const value=docs.get(id);return{exists:Boolean(value),data:()=>value}}
}}}}};
const kms={
  async encrypt({name,plaintext}){assert.equal(name,"projects/test/locations/global/keyRings/wd/cryptoKeys/oauth");return[{ciphertext:Buffer.from(plaintext).toString("base64")}];},
  async decrypt({name,ciphertext}){assert.equal(name,"projects/test/locations/global/keyRings/wd/cryptoKeys/oauth");return[{plaintext:Buffer.from(Buffer.from(ciphertext).toString(),"base64")}];}
};
let now=new Date("2026-10-09T00:00:00.000Z");
const store=createConnectionStore({firestore,kms,keyName:"projects/test/locations/global/keyRings/wd/cryptoKeys/oauth",collectionName:"connections-test",clock:()=>now});
const tokens={access_token:"ACCESS_SECRET_TEST",refresh_token:"REFRESH_SECRET_TEST",expires_in:3600,scope:"youtube.readonly youtube.upload"};
const account={id:"UC-test-123",title:"WordDark Oficial",customUrl:"@worddarkoficial",statistics:{subscriberCount:"0"}};
const saved=await store.save({account,tokens,scope:tokens.scope});
assert.equal(saved.providerId,"YOUTUBE");
assert.equal(saved.accountId,account.id);
assert.equal(saved.status,"PERSISTED");
assert.equal(docs.size,1);
const record=[...docs.values()][0];
assert.equal(record.options.merge,true);
assert.equal(record.status,"PERSISTED");
assert.ok(record.encryptedTokenBundle);
assert.ok(!JSON.stringify(record).includes("ACCESS_SECRET_TEST"));
assert.ok(!JSON.stringify(record).includes("REFRESH_SECRET_TEST"));
const decrypted=await store.decryptTokens(record.encryptedTokenBundle);
assert.equal(decrypted.access_token,tokens.access_token);
assert.equal(decrypted.refresh_token,tokens.refresh_token);
const metadata=await store.load({providerId:"YOUTUBE",accountId:account.id});
assert.equal(metadata.status,"PERSISTED");
assert.equal(metadata.accountId,account.id);
assert.ok(!("encryptedTokenBundle" in metadata),"Metadata reads must not expose ciphertext");
assert.ok(!JSON.stringify(metadata).includes("REFRESH_SECRET_TEST"),"Metadata reads must not expose tokens");
const runtimeTokens=await store.loadTokens({providerId:"YOUTUBE",accountId:account.id});
assert.equal(runtimeTokens.refresh_token,tokens.refresh_token);
assert.equal(await store.load({providerId:"YOUTUBE",accountId:"missing"}),null);
assert.equal(await store.loadTokens({providerId:"YOUTUBE",accountId:"missing"}),null);
await assert.rejects(()=>store.load({providerId:"YOUTUBE"}),/ACCOUNT_ID_REQUIRED/);
await assert.rejects(()=>store.save({account,tokens:{access_token:"A"}}),/REFRESH_TOKEN_REQUIRED/);
console.log("connection-store.test: OK");
