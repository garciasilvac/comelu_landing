import assert from "node:assert/strict";
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
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

function runFixture(files, setup) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "frontend-only-boundary-"));
  const fixtureGuardPath = join(fixtureRoot, "scripts", "check-frontend-only.mjs");

  try {
    mkdirSync(dirname(fixtureGuardPath), { recursive: true });
    copyFileSync(guardSourcePath, fixtureGuardPath);
    chmodSync(fixtureGuardPath, 0o755);
    symlinkSync(join(repositoryRoot, "node_modules"), join(fixtureRoot, "node_modules"), "dir");

    for (const [relativePath, contents] of Object.entries(files)) {
      const absolutePath = join(fixtureRoot, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, contents);
    }

    if (setup) setup(fixtureRoot);

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

test("rejects unicode-escaped environment identifiers", () => {
  for (const [source, expectedText] of [
    ["const \\u0056ITE_PUBLIC_EXTRA = 1;\n", /VITE_PUBLIC_EXTRA/],
    ["const \\u0053UPABASE_URL = \"https://example.invalid\";\n", /SUPABASE_URL/],
  ]) {
    const result = runFixture({ "src/runtime.ts": source });
    assertGuardRejects(result, expectedText);
  }
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

test("rejects valid import.meta env access bypasses", () => {
  for (const source of [
    "const value = import.meta[\"env\"].API_KEY;\n",
    "const value = import.meta?.env.API_KEY;\n",
    "const value = import.meta?.[\"env\"]?.[\"API_KEY\"];\n",
    "const value = import.meta.\\u0065nv.API_KEY;\n",
    "const value = import.meta[\"\\u0065nv\"][\"API_KEY\"];\n",
    "const value = import.meta.env?.[key];\n",
    "const value = import.meta[\"env\"][key];\n",
    "const value = import.meta[envKey].API_KEY;\n",
    "const value = import.meta[\"env\"][`API_${key}`];\n",
    "const value = import.meta.env;\n",
    "const value = import.meta[\"env\"];\n",
    "const meta = import.meta;\nconst value = meta.env.API_KEY;\n",
    "const { env } = import.meta;\nconst value = env.API_KEY;\n",
  ]) {
    const result = runFixture({ "src/runtime.ts": source });
    assertGuardRejects(result, /import\.meta(?:\.env)?/);
  }
});

test("allows only approved keys across optional and unicode-escaped env syntax", () => {
  const source = [
    "import.meta[\"env\"].VITE_SUPABASE_URL;",
    "import.meta?.env?.VITE_SUPABASE_ANON_KEY;",
    "import.meta?.[\"env\"]?.[\"VITE_TURNSTILE_SITE_KEY\"];",
    "import.meta.\\u0065nv.\\u0056ITE_SUPABASE_URL;",
    "import.meta[\"\\u0065nv\"][\"VITE_SUPABASE_ANON_KEY\"];",
    "import.meta.env?.[`MODE`];",
    "import.meta[\"env\"]?.[\"SSR\"];",
  ].join("\n");
  const result = runFixture({ "src/runtime.ts": source });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
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
    "new URL(\"./asset.svg\", import.meta.url);",
  ].join("\n");
  const result = runFixture({ "src/runtime.ts": source });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("rejects import.meta env bypasses in embedded component and browser scripts", () => {
  for (const [relativePath, source] of [
    ["src/runtime.vue", "<script setup>const value = import.meta[\"env\"][key];</script>"],
    ["src/runtime.svelte", "<script>const value = import.meta?.[\"env\"]?.[key];</script>"],
    ["index.html", "<script type=\"module\">const value = import.meta[\"env\"][key];</script>"],
  ]) {
    const result = runFixture({ [relativePath]: source });
    assertGuardRejects(result, /import\.meta\.env/);
  }
});

test("does not flag backend provider text in strings, comments, or regular expressions", () => {
  const result = runFixture({
    "tools/text-only.mjs": [
      "const text = \"import nodemailer from 'nodemailer'\";",
      "// import nodemailer from \"nodemailer\";",
      "const pattern = /import nodemailer from ['\\\"]nodemailer['\\\"]/;",
    ].join("\n"),
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("rejects an unallowlisted script path such as send-email", () => {
  const result = runFixture({
    "scripts/send-email.mjs": "export default function frontendFixture() {}\n",
  });

  assertGuardRejects(result, /scripts\/send-email\.mjs/);
});

test("rejects suffixed and nested backend, server, email, and migration executables", () => {
  for (const relativePath of [
    "tools/backend.mjs",
    "server.mjs",
    "email.mjs",
    "migrator.mjs",
    "send-email-job.mjs",
    "email-worker-extra.mjs",
    "nested/tools/backend-runtime-extra.js",
    "nested/jobs/server-worker.ts",
    "nested/jobs/migrations-extra.cjs",
  ]) {
    const result = runFixture({ [relativePath]: "export default function runtimeFixture() {}\n" });
    assertGuardRejects(result, /backend\/email\/migration runtime path/);
  }
});

test("enforces backend-shaped runtime paths inside src without flagging frontend email UI", () => {
  const result = runFixture({
    "src/backend/server.ts": "export default function runtimeFixture() {}\n",
    "src/email-worker-extra.ts": "export default function runtimeFixture() {}\n",
    "src/components/email-form.tsx": "export function EmailForm() { return null; }\n",
    "src/components/email/form.tsx": "export function EmailForm() { return null; }\n",
    "src/components/mailer-form.tsx": "export function MailerForm() { return null; }\n",
    "src/components/server-status.tsx": "export function ServerStatus() { return null; }\n",
    "src/components/db-client.tsx": "export function DbClient() { return null; }\n",
  });

  assertGuardRejects(result, /forbidden backend\/email\/migration runtime path/);
  assert.match(result.stderr, /src\/(?:backend\/server|email-worker-extra)/);
  assert.doesNotMatch(result.stderr, /src\/components\/email-form\.tsx/);
  assert.doesNotMatch(result.stderr, /src\/components\/email\/form\.tsx/);
  assert.doesNotMatch(result.stderr, /src\/components\/(?:mailer-form|server-status|db-client)\.tsx/);
});

test("rejects binary backend-shaped runtime paths before content inspection", () => {
  const result = runFixture({
    "tools/backend.mjs": "\u0000binary\u0000",
    "tools/runtime.mjs": "\u0000binary\u0000",
  });

  assertGuardRejects(result, /tools\/backend\.mjs/);
  assert.match(result.stderr, /tools\/runtime\.mjs: binary source/);
});

test("rejects symlinked runtime paths without reading outside the repository", () => {
  const externalRoot = mkdtempSync(join(tmpdir(), "frontend-only-boundary-external-"));

  try {
    mkdirSync(join(externalRoot, "linked-runtime"), { recursive: true });
    writeFileSync(join(externalRoot, "linked-runtime", "clean.ts"), "export const value = 1;\n");
    const result = runFixture({}, (fixtureRoot) => {
      mkdirSync(join(fixtureRoot, "src"), { recursive: true });
      symlinkSync(
        join(externalRoot, "linked-runtime"),
        join(fixtureRoot, "src", "linked-runtime"),
        "dir",
      );
    });

    assertGuardRejects(result, /src\/linked-runtime/);
  } finally {
    rmSync(externalRoot, { recursive: true, force: true });
  }
});

test("rejects explicit backend runtime signatures outside the frontend tooling paths", () => {
  for (const source of [
    "Deno.serve(() => new Response(\"ok\"));\n",
    "Deno[\"serve\"](() => new Response(\"ok\"));\n",
    "Deno?.serve(() => new Response(\"ok\"));\n",
    "Bun?.[\"env\"].SECRET;\n",
    "process[\"env\"].SECRET;\n",
    "sendEmail?.(lead);\n",
    "new Resend(\"api-key\");\n",
    "createTransport({});\n",
  ]) {
    const result = runFixture({ "tools/backend-runtime.ts": source });
    assertGuardRejects(result, /backend runtime signature/);
  }
});

test("rejects backend email provider imports outside the frontend tooling paths", () => {
  const result = runFixture({
    "tools/provider.mjs": [
      "import nodemailer from \"nodemailer\";",
      "const resend = require(\"resend\");",
      "const postmark = await import(\"postmark\");",
      "export { mailgun } from \"mailgun\";",
    ].join("\n"),
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
    "docs/examples/.env.example": "SUPABASE_URL=https://example.invalid\n",
    "docs/examples/send-email-job.mjs": "export default function documentationFixture() {}\n",
    "test/backend-fixture.test.mjs": [
      "const example = import.meta.env.API_KEY;",
      "const emailSetting = EMAIL_DISABLED;",
      "const server = Deno.serve;",
    ].join("\n"),
    "test/supabase/fixture.test.ts": "const example = import.meta.env.API_KEY;\n",
    "tests/fixtures/email-worker-extra.mjs": "export default function testFixture() {}\n",
    "src/components/email-form.tsx": "export function EmailForm() { return null; }\n",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("passes the legitimate repository", () => {
  const result = runGuard();

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Frontend-only boundary check passed/);
});
