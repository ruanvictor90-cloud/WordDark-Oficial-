import test from "node:test";
import assert from "node:assert/strict";
import { RuanAppRegistry } from "./app-registry.mjs";

test("apps are registered as independent lines with no permissions by default", () => {
  const registry = new RuanAppRegistry();
  const app = registry.register({ id: "notes.app", name: "Notes", capabilities: ["notes.read", "notes.write"] });
  assert.deepEqual(app.grantedCapabilities, []);
  assert.equal(app.status, "registered");
});

test("apps cannot receive unrequested or unknown capabilities", () => {
  const registry = new RuanAppRegistry();
  registry.register({ id: "calendar.app", name: "Calendar", capabilities: ["calendar.read"] });
  assert.throws(() => registry.authorize("calendar.app", ["calendar.read"]), /RUAN_APP_PERMISSION_APPROVAL_REQUIRED/);
  assert.throws(() => registry.authorize("calendar.app", ["notes.read"], { approved: true }), /RUAN_APP_PERMISSION_NOT_REQUESTED/);
  assert.throws(() => registry.register({ id: "bad.app", name: "Bad", capabilities: ["ruan.root"] }), /RUAN_APP_CAPABILITY_UNKNOWN/);
});

test("an app context exposes only explicitly granted capabilities", () => {
  const registry = new RuanAppRegistry();
  registry.register({ id: "widget.weather", name: "Weather", capabilities: ["calendar.read"] });
  registry.authorize("widget.weather", ["calendar.read"], { approved: true });
  const context = registry.createContext("widget.weather");
  assert.equal(context.can("calendar.read"), true);
  assert.equal(context.can("notes.read"), false);
  assert.throws(() => context.require("notes.read"), /RUAN_APP_ACCESS_DENIED/);
});

test("apps cannot create WordDark requests without the world.request grant", () => {
  const registry = new RuanAppRegistry();
  registry.register({ id: "widget.one", name: "Widget", capabilities: ["notes.read"] });
  const context = registry.createContext("widget.one");
  assert.throws(() => context.createRequest("Help"), /RUAN_APP_ACCESS_DENIED/);
});

test("permissions can be revoked", () => {
  const registry = new RuanAppRegistry();
  registry.register({ id: "files.app", name: "Files", capabilities: ["files.read.selected"] });
  registry.authorize("files.app", ["files.read.selected"], { approved: true });
  registry.revoke("files.app");
  assert.deepEqual(registry.createContext("files.app").permissions, []);
});
