import assert from "node:assert/strict";import {WordDarkRuntime,Operation} from "./index.js";
const runtime=new WordDarkRuntime();runtime.registerGate({gateId:"GATE-1",ownerId:"TEST",layer:"TERRA"});runtime.registerModule({id:"TEST-SERVICE",owner:"TEST",layer:"CEU",handle:()=>({success:true,result:{ok:true}})});
const op=runtime.request({gateId:"GATE-1",origin:"CITY",destination:"TEST-SERVICE",service:"TEST-SERVICE",payload:{task:"x"}});assert.equal(op.status,"COMPLETED");assert.equal(op.checkpoints[0].module,"TEST-SERVICE");console.log("core-central OK");
