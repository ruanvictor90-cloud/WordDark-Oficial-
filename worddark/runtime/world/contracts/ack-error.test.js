const assert=require("assert");
const Ack=require("./ack");
const WordDarkError=require("./error");

const ack=new Ack({ackId:"ACK-001",messageId:"MSG-001",requestId:"REQ-001",operationId:"OP-001",receiverId:"DF",senderId:"TERRA",routeId:"R-001"});
assert.strictEqual(ack.validate(),true);
assert.strictEqual(ack.status,"RECEIVED");

const error=new WordDarkError({operationId:"OP-001",stage:"EXECUTING",code:"EXECUTOR_UNAVAILABLE",message:"Executor indisponível.",retryable:true});
assert.strictEqual(error.validate(),true);
assert.strictEqual(error.retryable,true);
console.log("ack-error.test.js: OK");
