import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)];
assert.ok(scripts.length > 0, "WordDark app must contain its client script");
const source = scripts.at(-1)[1];
assert.ok(source.includes("function workbench()"), "Content workbench must be registered");
assert.ok(source.includes("data-save-review"), "Review controls must be present");
assert.ok(source.includes("KEYS.contentJobs"), "Content jobs must use their own local storage key");
assert.doesNotThrow(() => new vm.Script(source), "Inline app script must be valid JavaScript syntax");
console.log("worddark app script test: OK");
