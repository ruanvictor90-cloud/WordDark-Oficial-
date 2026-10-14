/**
 * Test-only Node loader for the deliberately mixed legacy CommonJS / modern ESM
 * layout under worddark/runtime. It marks only the explicitly listed ESM files
 * as modules; all other .js files keep their package-defined CommonJS behavior.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ESM_FILES = new Set([
  "worddark/runtime/world/core/connections/persisted-knowledge-gateway.js",
  "worddark/runtime/world/core/connections/knowledge-search-adapter.js",
  "worddark/runtime/world/core/connections/darknet-knowledge-adapter.js",
  "worddark/runtime/world/core/connections/ruan-hub-control-runtime.js",
  "worddark/runtime/world/core/connections/ruan-hub-control-adapter.js",
  "worddark/runtime/world/library/durable-knowledge-repository.js",
  "worddark/runtime/world/library/durable-knowledge-intake-registry.js",
  "worddark/runtime/world/library/firestore-knowledge-adapters.js",
  "worddark/runtime/world/library/central-knowledge-archiver.js",
  "worddark/runtime/world/library/knowledge-intake-registry.js",
  "worddark/runtime/world/core/connections/persisted-knowledge-gateway.test.js",
  "worddark/runtime/world/core/connections/knowledge-search-adapter.test.js",
  "worddark/runtime/world/core/connections/darknet-knowledge-adapter.test.js",
  "worddark/runtime/world/core/connections/ruan-hub-control-runtime.test.js",
  "worddark/runtime/world/core/connections/ruan-hub-control-adapter.test.js",
  "worddark/runtime/world/core/commercial-order-operation-bridge.js",
  "worddark/runtime/world/core/commercial-order-operation-bridge.test.js",
  "worddark/runtime/world/core/earth-commercial-intake-adapter.js",
  "worddark/runtime/world/core/earth-commercial-intake-adapter.test.js",
  "worddark/runtime/world/core/terra-commercial-core.integration.test.js",
  "worddark/runtime/world/library/durable-knowledge-intake-registry.test.js",
  "worddark/runtime/world/library/firestore-knowledge-adapters.test.js",
  "worddark/runtime/world/library/central-knowledge-archiver.test.js",
  "worddark/runtime/world/library/knowledge-intake-registry.test.js",
  "worddark/runtime/world/architecture-alignment.test.js"
]);

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:")) {
    const pathname = fileURLToPath(url).replace(/\\/g, "/");
    if ([...ESM_FILES].some(path => pathname.endsWith("/" + path))) {
      return { format: "module", source: await readFile(fileURLToPath(url), "utf8"), shortCircuit: true };
    }
  }
  return nextLoad(url, context);
}
