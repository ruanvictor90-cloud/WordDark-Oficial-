import assert from "node:assert/strict";
import {createConnectionSystem} from "./connection-system.js";

const audit={events:[],record(type,data){this.events.push({type,data});}};
const system=createConnectionSystem({audit});

const google=system.registry.register({
  provider:"GOOGLE",service:"YOUTUBE",accountId:"ACCOUNT-LOCAL",
  status:"CONNECTED",capabilities:["CONTENT_READ","CONTENT_PUBLISH"]
});

assert.equal(google.provider,"GOOGLE");
assert.equal(system.status().boundary.rawCredentialsVisibleToWorld,false);

const blocked=system.bridge.ingest({
  connectionId:google.id,capability:"CONTENT_PUBLISH",payload:{title:"Teste"},approved:false
});
assert.equal(blocked.accepted,false);
assert.equal(blocked.reason,"APPROVAL_REQUIRED");

const accepted=system.bridge.ingest({
  connectionId:google.id,capability:"CONTENT_PUBLISH",payload:{title:"Teste"},approved:true
});
assert.equal(accepted.accepted,true);
assert.equal(accepted.status,"DELIVERED_TO_WORLD");
assert.equal(accepted.information.title,"Teste");

console.log("CONNECTION-SYSTEM TESTS: PASS");
