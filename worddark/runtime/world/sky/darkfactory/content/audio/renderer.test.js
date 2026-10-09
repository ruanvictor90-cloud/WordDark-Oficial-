const assert=require("node:assert/strict");
const Renderer=require("./renderer");
assert.equal(typeof Renderer.render,"function");
assert.equal(typeof Renderer.wavBlob,"function");
Renderer.render({duration:1}).then(result=>{assert.equal(result.status,typeof Blob!=="undefined"?"GENERATED":"PLANNED");if(typeof Blob!=="undefined"){assert.equal(result.format,"wav");assert.equal(result.artifact.mime,"audio/wav");}console.log("audio renderer contract ok");}).catch(err=>{console.error(err);process.exit(1);});
