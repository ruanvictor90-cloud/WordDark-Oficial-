const assert=require("assert");
const WordDarkMemoryPersistence=require("./persistence");

const store=new WordDarkMemoryPersistence();
store.save("OP-001",{status:"COMPLETED"});
assert.ok(store.has("OP-001"));
assert.deepStrictEqual(store.get("OP-001"),{status:"COMPLETED"});
assert.strictEqual(store.list().length,1);
assert.strictEqual(store.delete("OP-001"),true);
assert.strictEqual(store.get("OP-001"),null);
console.log("persistence.test.js: OK");
