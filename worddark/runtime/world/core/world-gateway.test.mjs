import assert from "node:assert/strict";
import test from "node:test";
import {createAuthorizedWorldGateway} from "./world-gateway.mjs";
const people={adm:{principalId:"A1",role:"world-admin",zone:"ADM",authenticated:true,active:true},dev:{principalId:"D1",role:"developer",zone:"DEV",authenticated:true,active:true},pub:{principalId:"P1",role:"public",zone:"PUBLIC",authenticated:true,active:true}};
const make=(handlers={})=>createAuthorizedWorldGateway({resolvePrincipal:id=>people[id]||null,handlers:{"operation.submit":()=>1,"dev.test":()=>2,"service.use":()=>3,...handlers}});
test("ADM can submit operation; DEV cannot administer it",async()=>{assert.equal((await make().invoke({identity:"adm",command:"operation.submit"})).status,"ACCEPTED");assert.equal((await make().invoke({identity:"dev",command:"operation.submit"})).reason,"DEV_CANNOT_ADMINISTER_WORLD");});
test("Public can use service but cannot inspect internal world",async()=>{assert.equal((await make().invoke({identity:"pub",command:"service.use"})).status,"ACCEPTED");assert.equal((await make().invoke({identity:"pub",command:"operation.submit"})).reason,"PUBLIC_INTERFACE_ONLY");});
test("Unknown commands and identities fail closed",async()=>{assert.equal((await make().invoke({identity:"nobody",command:"service.use"})).reason,"IDENTITY_NOT_RESOLVED");assert.equal((await make().invoke({identity:"adm",command:"authority.grant"})).reason,"COMMAND_NOT_RECOGNIZED");});
test("Handler exceptions are contained",async()=>{assert.equal((await make({"service.use":()=>{throw Error("secret")}}).invoke({identity:"pub",command:"service.use"})).reason,"HANDLER_FAILED");});
