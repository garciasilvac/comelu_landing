import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const { validateTurnstile } = await import("./turnstile.ts");

const validationInput = {
  token: "test-token",
  secret: "test-secret",
  expectedAction: "waitlist",
  expectedHostnames: new Set(["comelu.cl"]),
  remoteIp: "203.0.113.1",
};

test("submitLead verifies a waitlist Turnstile token before inserting a lead", async () => {
  const handler = await readFile(new URL("./index.ts", import.meta.url), "utf8");
  const verifier = await readFile(new URL("./turnstile.ts", import.meta.url), "utf8");

  assert.match(handler, /from "\.\/turnstile\.ts"/);
  assert.match(handler, /await validateTurnstile\(/);
  assert.match(verifier, /result\.success !== true/);
  assert.match(verifier, /result\.action !== expectedAction/);
  assert.match(verifier, /expectedHostnames\.has\(result\.hostname\)/);
  assert.ok(handler.indexOf("await validateTurnstile(") < handler.indexOf('.from("leads")'));
});

test("rejects a missing Turnstile token without calling Siteverify", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response();
  };

  try {
    const result = await validateTurnstile({ ...validationInput, token: "" });
    assert.deepEqual(result, { valid: false, reason: "missing_token" });
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("accepts only successful Siteverify results with the expected action and hostname", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: true, action: "waitlist", hostname: "comelu.cl" }), { status: 200 });

  try {
    const result = await validateTurnstile(validationInput);
    assert.deepEqual(result, { valid: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects invalid, expired, replayed, wrong-action, and wrong-hostname tokens", async () => {
  const originalFetch = globalThis.fetch;
  const rejectedResults = [
    { success: false, "error-codes": ["invalid-input-response"] },
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: true, action: "signup", hostname: "comelu.cl" },
    { success: true, action: "waitlist", hostname: "example.com" },
  ];

  try {
    for (const siteverifyResult of rejectedResults) {
      globalThis.fetch = async () => new Response(JSON.stringify(siteverifyResult), { status: 200 });
      const result = await validateTurnstile(validationInput);
      assert.deepEqual(result, { valid: false, reason: "invalid_token" });
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
