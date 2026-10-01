const assert=require("assert");
const Id=require("./id");
const {Client,Channel,Project,User,Service}=require("./entities");
const {WordDarkLabPermission}=require("./permissions");
const Operation=require("./operation");
const {WordDarkLabRoute}=require("./route");
const Gate=require("./gate");
const Connector=require("./connector");
const Runtime=require("./runtime");

function ok(name,fn){try{fn();console.log("PASS",name);}catch(e){console.error("FAIL",name,e.message);process.exitCode=1;}}

ok("IDs",()=>{assert.strictEqual(Id.create("CLIENT",1),"WD-CLI-0001");assert(Id.validate("WD-OP-0341"));assert(!Id.validate("BAD-1"));});

ok("Entity hierarchy",()=>{
 const c=new Client({id:"WD-CLI-0001",name:"País Suco"});
 const ch=new Channel({id:"WD-CH-0001",name:"SucoGeek",clientId:c.id});
 const p=new Project({id:"WD-PRJ-0001",name:"Campanha Anime",clientId:c.id,resourceId:ch.id});
 const u=new User({id:"WD-USR-0001",name:"Operador",profile:"CLIENT_OPERATOR",clientId:c.id});
 assert(c.validate().valid&&ch.validate().valid&&p.validate().valid&&u.validate().valid);
});

ok("Permissions with context",()=>{
 const rule=new WordDarkLabPermission({profile:"CLIENT_OPERATOR",capability:"content.produce",action:"request",resourceId:"WD-CH-0001",clientId:"WD-CLI-0001",environment:"TEST"});
 assert(rule.validate().valid);
 assert(rule.matches({profile:"CLIENT_OPERATOR",capability:"content.produce",action:"request",resourceId:"WD-CH-0001",clientId:"WD-CLI-0001",environment:"TEST"}));
 assert(!rule.matches({profile:"CLIENT_OPERATOR",capability:"content.produce",action:"request",resourceId:"WD-CH-9999",clientId:"WD-CLI-0001",environment:"TEST"}));
});

ok("Operation lifecycle",()=>{
 const o=new Operation({operationId:"WD-OP-0001",requesterId:"WD-USR-0001",clientId:"WD-CLI-0001",resourceId:"WD-CH-0001",origin:"sucogeek",destination:"darkfactory",serviceId:"WD-SVC-0001"});
 assert(o.validate().valid);o.transition("RECEIVED");o.transition("VALIDATED");o.transition("EXECUTING");o.transition("COMPLETED");assert.strictEqual(o.status,"COMPLETED");assert(o.history.length>=4);
});

ok("Gate separation",()=>{
 const g=new Gate({gateId:"WD-GATE-0001",destinationId:"darkfactory",allowedProfiles:["CLIENT_OPERATOR"]});
 assert(g.receive({profile:"CLIENT_OPERATOR"}).success);
 assert.strictEqual(g.receive({profile:"VIEWER"}).reason,"PROFILE_NOT_ALLOWED");
});

ok("Transport route",()=>{
 const r=new WordDarkLabRoute({routeId:"WD-ROUTE-0001",origin:"sucogeek",destination:"darkfactory",serviceId:"WD-SVC-0001"});
 const o={origin:"sucogeek",destination:"darkfactory",serviceId:"WD-SVC-0001"};
 assert(r.allows(o)); assert(!r.allows({...o,destination:"other"}));
});

ok("Connector isolation",()=>{
 const c=new Connector({id:"WD-CON-0001",platform:"YouTube",accountId:"yt-test"});
 assert.strictEqual(c.publish({title:"x"}).reason,"CONNECTOR_DISCONNECTED");
 c.connect();const p=c.publish({title:"x"});assert(p.success);assert(p.externalId);
});

ok("End-to-end SucoGeek -> Dark Factory -> Result",()=>{
 const rt=new Runtime();
 const client=rt.register(new Client({id:"WD-CLI-0001",name:"País Suco"}));
 const channel=rt.register(new Channel({id:"WD-CH-0001",name:"SucoGeek",clientId:client.id}));
 const user=rt.register(new User({id:"WD-USR-0001",name:"Operador",profile:"CLIENT_OPERATOR",clientId:client.id}));
 const service=new Service({id:"WD-SVC-0001",name:"Dark Factory Content",executor:o=>({success:true,status:"DONE",operationId:o.operationId,output:"TEST_CONTENT"})});
 rt.register(channel);rt.register(user);rt.register(service);
 rt.permissions.grant(new WordDarkLabPermission({profile:"CLIENT_OPERATOR",capability:"content.produce",action:"request",resourceId:channel.id,clientId:client.id,environment:"TEST"}));
 rt.router.add(new WordDarkLabRoute({routeId:"WD-ROUTE-0001",origin:"sucogeek",destination:"darkfactory",serviceId:service.id}));
 rt.addGate(new Gate({gateId:"WD-GATE-DF-001",destinationId:"darkfactory",allowedProfiles:["CLIENT_OPERATOR"]}));
 const op=new Operation({operationId:"WD-OP-0001",requesterId:user.id,clientId:client.id,resourceId:channel.id,origin:"sucogeek",destination:"darkfactory",serviceId:service.id,environment:"TEST",request:{title:"Short de teste"}});
 const out=rt.process(op,"WD-GATE-DF-001");
 assert(out.success);assert.strictEqual(out.status,"PROCESSED");assert.strictEqual(out.operation.status,"COMPLETED");assert.strictEqual(out.result.status,"READY");assert.strictEqual(rt.inbox.getOpen().length,0);assert(rt.versioning.latest(op.operationId));assert(rt.events.some(e=>e.event==="EXECUTION_FINISHED"));
});

ok("Error recovery and actionable inbox",()=>{
 const rt=new Runtime();const u=rt.register(new User({id:"WD-USR-0001",name:"Viewer",profile:"VIEWER"}));
 rt.addGate(new Gate({gateId:"WD-GATE-DF-001",destinationId:"darkfactory",allowedProfiles:["CLIENT_OPERATOR"]}));
 const op=new Operation({operationId:"WD-OP-0002",requesterId:u.id,clientId:"WD-CLI-0001",resourceId:"WD-CH-0001",origin:"sucogeek",destination:"darkfactory",serviceId:"WD-SVC-0001"});
 const out=rt.process(op,"WD-GATE-DF-001");assert(!out.success);assert.strictEqual(rt.inbox.getOpen().length,1);assert.strictEqual(rt.recovery.list().length,1);
});


ok("Unknown requester is rejected without crashing permission lookup",()=>{
 const rt=new Runtime();
 rt.addGate(new Gate({gateId:"WD-GATE-DF-001",destinationId:"darkfactory",allowedProfiles:["CLIENT_OPERATOR"]}));
 const op=new Operation({operationId:"WD-OP-0003",requesterId:"WD-USR-4040",clientId:"WD-CLI-0001",resourceId:"WD-CH-0001",origin:"sucogeek",destination:"darkfactory",serviceId:"WD-SVC-0001"});
 const out=rt.process(op,"WD-GATE-DF-001");assert(!out.success);assert.strictEqual(out.error.reason,"REQUESTER_NOT_FOUND");
});

console.log("WordDark Lab integration suite: COMPLETE");
