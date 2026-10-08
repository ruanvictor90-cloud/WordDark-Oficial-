import assert from "node:assert/strict";
import {YouTubeAdapter} from "./youtube-adapter.js";
const adapter=new YouTubeAdapter({fetchImpl:async(url,opts)=>{
 assert.match(url,/youtube\/v3\/channels/);
 assert.equal(opts.headers.Authorization,"Bearer TEST");
 return {ok:true,json:async()=>({items:[{id:"UC-TEST",snippet:{title:"Teste"},statistics:{viewCount:"1"}}]})};
}});
const result=await adapter.execute({action:"CHANNEL_READ"},{credential:"TEST"});
assert.equal(result.success,true);
assert.equal(result.channel.id,"UC-TEST");
console.log("youtube-adapter.test: OK");
