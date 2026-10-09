import assert from "node:assert/strict";
import test from "node:test";
import { authorizeWorldAction, describeWorldBoundary, normalizePrincipal } from "./authority-boundary.mjs";

const principal = (role, zone, extra = {}) => ({
  principalId: "TEST-IDENTITY",
  role, zone, authenticated: true, active: true, ...extra
});

test("sovereign ADM Ruan is explicitly outside internal roles", () => {
  const boundary = describeWorldBoundary();
  assert.equal(boundary.sovereignAuthority, "ADM_RUAN_EXTERNAL");
  assert.equal(boundary.sovereignAuthorityIsInternalRole, false);
  assert.equal(normalizePrincipal({ role: "ADM-Ruan", zone: "ADM", authenticated: true, active: true }).role, null);
});

test("internal ADM can operate world but cannot grant sovereign authority or write DEV code", () => {
  assert.equal(authorizeWorldAction(principal("world-admin", "ADM"), "world.operate").allowed, true);
  assert.equal(authorizeWorldAction(principal("world-admin", "ADM"), "authority.grant").reason, "SOVEREIGN_AUTHORITY_OUTSIDE_WORLD");
  assert.equal(authorizeWorldAction(principal("world-admin", "ADM"), "dev.write").reason, "SEPARATION_OF_DUTIES");
});

test("DEV can write and test code but cannot administer the world", () => {
  assert.equal(authorizeWorldAction(principal("developer", "DEV"), "dev.write").allowed, true);
  assert.equal(authorizeWorldAction(principal("developer", "DEV"), "dev.test").allowed, true);
  assert.equal(authorizeWorldAction(principal("developer", "DEV"), "world.operate").reason, "DEV_CANNOT_ADMINISTER_WORLD");
  assert.equal(authorizeWorldAction(principal("developer", "DEV"), "authority.revoke").reason, "SOVEREIGN_AUTHORITY_OUTSIDE_WORLD");
});

test("PUBLIC is restricted to published interfaces and authorized services", () => {
  assert.equal(authorizeWorldAction(principal("public", "PUBLIC"), "public.read").allowed, true);
  assert.equal(authorizeWorldAction(principal("public", "PUBLIC"), "service.use").allowed, true);
  assert.equal(authorizeWorldAction(principal("public", "PUBLIC"), "world.read").reason, "PUBLIC_INTERFACE_ONLY");
});

test("role-zone mismatch and inactive identity fail closed", () => {
  assert.equal(authorizeWorldAction(principal("developer", "ADM"), "dev.write").reason, "ROLE_ZONE_MISMATCH");
  assert.equal(authorizeWorldAction(principal("public", "PUBLIC", { active: false }), "public.read").reason, "IDENTITY_NOT_ACTIVE");
  assert.equal(authorizeWorldAction({}, "public.read").allowed, false);
});

console.log("WordDark Authority Boundary tests: OK");
