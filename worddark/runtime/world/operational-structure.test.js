const assert=require("assert");
const fs=require("fs");
const path=require("path");

const root=path.resolve(__dirname,"..");
const required=[
  "world/core/world-runtime.js",
  "world/core/operation-engine.js",
  "world/core/operation-coordinator.js",
  "world/core/communication.js",
  "world/core/capability-catalog.js",
  "world/core/company-registry.js",
  "world/core/company-intent-router.js",
  "world/core/road.js",
  "world/contracts/operation.js",
  "world/contracts/request.js",
  "world/contracts/message.js",
  "world/contracts/receipt.js",
  "world/sky/darkfactory/core/factory.js",
  "world/sky/darkfactory/core/content-factory.js",
  "world/sky/darkfactory/core/social-factory.js",
  "world/sky/darkfactory/core/operation-bridge.js",
  "world/core/connections/connection-registry.js",
  "world/core/connections/connection-contract.js",
  "world/core/connections/connection-gateway.js",
  "world/library/hierarchical-library.js"
];
for(const relative of required)assert.ok(fs.existsSync(path.join(root,relative)),"Missing operational file: "+relative);

const legacyExecutable=[
  "core-central/index.js",
  "core-central/external-connection-hub.js",
  "core-central/emergency-stop.js",
  "core-central/central-automation-controller.js"
];
for(const relative of legacyExecutable)assert.ok(!fs.existsSync(path.join(root,relative)),"Legacy core executable still exists: "+relative);

console.log("operational-structure.test: OK");
