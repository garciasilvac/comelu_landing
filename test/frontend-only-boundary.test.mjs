import assert from "node:assert/strict";
import { copyFileSync, chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, "..");
const guardSourcePath = join(repositoryRoot, "scripts", "check-frontend-only.mjs");

const publicEnvironmentExample = [
  "VITE_SUPABASE_URL=http://127.0.0.1:54321",
  "VITE_SUPABASE_ANON_KEY=public-anon-key",
  "VITE_TURNSTILE_SITE_KEY=public-site-key",
].join("\n");

function runGuard(scriptPath = guardSourcePath, cwd = repositoryRoot) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd,
    encoding: "utf8",
  });
}

function runFixture(files) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "frontend-only-boundary-"));
  const fixtureGuardPath = join(fixtureRoot, "scripts", "check-frontend-only.mjs");

  try {
    mkdirSync(dirname(fixtureGuardPath), { recursive: true });
    copyFileSync(guardSourcePath, fixtureGuardPath);
    chmodSync(fixtureGuardPath, 0o755);

    for (const [relativePath, contents] of Object.entries(files)) {
      const absolutePath = join(fixtureRoot, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, contents);
    }

    return runGuard(fixtureGuardPath, fixtureRoot);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function assertGuardRejects(result, expectedText) {
  assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  if (expectedText) assert.match(result.stderr, expectedText);
}

test("rejects VITE_RESEND_API_KEY in frontend runtime code", () => {
  const result = runFixture({
    "src/runtime.ts": "const leakedKey = import.meta.env.VITE_RESEND_API_KEY;\n",
  });

  assertGuardRejects(result, /VITE_RESEND_API_KEY/);
});

test("rejects VITE_TURNSTILE_SECRET in frontend runtime code", () => {
  const result = runFixture({
    "src/runtime.ts": "const leakedSecret = import.meta.env[\"VITE_TURNSTILE_SECRET\"];\n",
  });

  assertGuardRejects(result, /VITE_TURNSTILE_SECRET/);
});

test("allows only the documented public variables in environment examples", () => {
  const result = runFixture({
    ".env.example": publicEnvironmentExample,
    ".env.local.example": publicEnvironmentExample,
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("rejects an unknown VITE variable in environment examples", () => {
  const result = runFixture({
    ".env.example": `${publicEnvironmentExample}\nVITE_PUBLIC_EXTRA=value\n`,
  });

  assertGuardRejects(result, /allowlisted public variables/);
});

test("rejects a backend variable in environment examples even with VITE_", () => {
  const result = runFixture({
    ".env.example": "VITE_RESEND_API_KEY=server-secret\n",
  });

  assertGuardRejects(result, /VITE_RESEND_API_KEY/);
});

test("rejects unknown dot and bracket import.meta.env access", () => {
  for (const source of [
    "const value = import.meta.env.API_KEY;\n",
    "const value = import.meta.env[\"UNKNOWN_KEY\"];\n",
    "const value = import.meta.env[environmentName];\n",
    "const regex = /[\"']/;\nconst value = import.meta.env.API_KEY;\n",
    "const value = `${import.meta.env.API_KEY}`;\n",
  ]) {
    const result = runFixture({ "src/runtime.ts": source });
    assertGuardRejects(result, /import\.meta\.env/);
  }
});

test("rejects a VITE-prefixed backend import.meta.env bracket access", () => {
  const result = runFixture({
    "src/runtime.ts": "const value = import.meta.env[\"VITE_RESEND_API_KEY\"];\n",
  });

  assertGuardRejects(result, /VITE_RESEND_API_KEY/);
});

test("allows the public variables and documented Vite built-ins in runtime code", () => {
  const source = [
    "import.meta.env.VITE_SUPABASE_URL;",
    "import.meta.env[\"VITE_SUPABASE_ANON_KEY\"];",
    "import.meta.env['VITE_TURNSTILE_SITE_KEY'];",
    "import.meta.env.DEV;",
    "import.meta.env[\"PROD\"];",
    "import.meta.env.MODE;",
    "import.meta.env['BASE_URL'];",
    "import.meta.env.SSR;",
  ].join("\n");
  const result = runFixture({ "src/runtime.ts": source });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("rejects an unallowlisted script path such as send-email", () => {
  const result = runFixture({
    "scripts/send-email.mjs": "export default function frontendFixture() {}\n",
  });

  assertGuardRejects(result, /scripts\/send-email\.mjs/);
});

test("rejects explicit backend runtime signatures outside the frontend tooling paths", () => {
  const result = runFixture({
    "tools/backend-runtime.ts": "Deno.serve(() => new Response(\"ok\"));\n",
  });

  assertGuardRejects(result, /backend runtime signature/);
});

test("rejects backend email provider imports outside the frontend tooling paths", () => {
  const result = runFixture({
    "tools/provider.mjs": "import nodemailer from \"nodemailer\";\nexport { nodemailer };\n",
  });

  assertGuardRejects(result, /backend runtime signature/);
});

test("rejects migration and email runtime paths outside the frontend tooling paths", () => {
  for (const relativePath of [
    "tools/migration-runner.mjs",
    "tools/migrations.mjs",
    "tools/email-handler.mjs",
  ]) {
    const result = runFixture({ [relativePath]: "export default function runtimeFixture() {}\n" });
    assertGuardRejects(result, /backend\/email\/migration runtime path/);
  }
});

test("rejects migration SQL outside the frontend boundary", () => {
  const result = runFixture({
    "schema.sql": "CREATE TABLE leads (id integer);\n",
  });

  assertGuardRejects(result, /migration SQL/);
});

test("rejects backend and email package scripts", () => {
  const result = runFixture({
    "package.json": JSON.stringify({ scripts: { "email:preview": "node preview.mjs" } }),
  });

  assertGuardRejects(result, /backend\/email\/migration package script/);
});

test("does not flag backend-looking examples in documentation or tests", () => {
  const result = runFixture({
    "docs/security.md": "Documented forbidden names: VITE_RESEND_API_KEY and VITE_TURNSTILE_SECRET.\n",
    "docs/supabase/reference.md": "Deno.serve and migration examples may appear in this documentation.\n",
    "test/backend-fixture.test.mjs": [
      "const example = import.meta.env.API_KEY;",
      "const emailSetting = EMAIL_DISABLED;",
      "const server = Deno.serve;",
    ].join("\n"),
    "test/supabase/fixture.test.ts": "const example = import.meta.env.API_KEY;\n",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("passes the legitimate repository", () => {
  const result = runGuard();

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Frontend-only boundary check passed/);
});
