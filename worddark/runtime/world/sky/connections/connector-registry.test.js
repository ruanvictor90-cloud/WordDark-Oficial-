const assert=require("assert");
const Registry=require("./connector-registry");
const registry=new Registry();
registry.register({id:"YOUTUBE",provider:"YouTube",capabilities:["ACCOUNT_READ","CONTENT_PUBLISH"],execute:()=>({success:true,status:"SIMULATED"})});
assert.strictEqual(registry.get("youtube").provider,"YouTube");
assert.strictEqual(registry.findCapability("CONTENT_PUBLISH").length,1);
(async()=>{const result=await registry.execute("YOUTUBE",{mode:"TEST"});assert.strictEqual(result.success,true);console.log("connector-registry: ok");})();
