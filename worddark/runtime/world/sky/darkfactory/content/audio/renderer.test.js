const assert=require("node:assert/strict");
const Renderer=require("./renderer");
assert.equal(typeof Renderer.render,"function");
assert.equal(typeof Renderer.wavBlob,"function");
Renderer.render({duration:1}).then(result=>{assert.equal(result.status,"PLANNED");console.log("audio renderer contract ok");}).catch(err=>{console.error(err);process.exit(1);});
