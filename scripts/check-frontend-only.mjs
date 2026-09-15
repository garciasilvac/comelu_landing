#!/usr/bin/env node

import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const allowedPublicEnvironmentNames = new Set([
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_TURNSTILE_SITE_KEY",
]);
const allowedViteBuiltInNames = new Set(["DEV", "PROD", "MODE", "BASE_URL", "SSR"]);
const allowedImportMetaEnvironmentNames = new Set([
  ...allowedPublicEnvironmentNames,
  ...allowedViteBuiltInNames,
]);
const frontendOnlyGuardPath = "scripts/check-frontend-only.mjs";
const allowedScriptPaths = new Set([
  frontendOnlyGuardPath,
  "scripts/generate-web-icons.mjs",
]);
const sourceFileExtensions = new Set([
  ".cjs",
  ".cts",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".mjs",
  ".mts",
  ".sql",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
]);
const nonRuntimePathSegments = new Set(["docs", "test", "tests", "__tests__", "fixtures"]);
const testFilePattern = /(?:^|\/)[^/]+\.(?:test|spec)\.[^/]+$/i;
const environmentFilePattern = /(^|\/)\.env(?:\.[^/]*)?$/;
const environmentExamplePattern = /(^|\/)\.env(?:\.[^.]+)*\.example$/;

const joinEnvironmentName = (...parts) => parts.join("_");
const forbiddenEnvironmentNames = [
  joinEnvironmentName("SUPABASE", "URL"),
  joinEnvironmentName("SUPABASE", "ANON", "KEY"),
  joinEnvironmentName("SUPABASE", "SERVICE", "ROLE", "KEY"),
  joinEnvironmentName("SUPABASE", "DB", "PASSWORD"),
  joinEnvironmentName("SUPABASE", "ACCESS", "TOKEN"),
  joinEnvironmentName("SUPABASE", "AUTH", "TOKEN"),
  joinEnvironmentName("TURNSTILE", "SECRET"),
  joinEnvironmentName("TURNSTILE", "HOSTNAMES"),
  joinEnvironmentName("TURNSTILE", "TEST", "MODE"),
  joinEnvironmentName("EMAIL", "DISABLED"),
  joinEnvironmentName("EMAIL", "FROM"),
  joinEnvironmentName("LEAD", "NOTIFICATION", "TO"),
  joinEnvironmentName("RESEND", "API", "KEY"),
  joinEnvironmentName("SERVICE", "ROLE", "KEY"),
  joinEnvironmentName("DATABASE", "URL"),
  joinEnvironmentName("POSTGRES", "PASSWORD"),
  joinEnvironmentName("JWT", "SECRET"),
];
const forbiddenEnvironmentPattern = new RegExp(
  `\\b(?:VITE_)?(?:${forbiddenEnvironmentNames.join("|")})\\b`,
  "g",
);
const frontendEnvironmentPattern = /\bVITE_[A-Za-z0-9_]+\b/g;
const importMetaEnvironmentAccessPattern = /import\s*\.\s*meta\s*\.\s*env\b/g;
const regexPrecedingWords = new Set([
  "case",
  "delete",
  "do",
  "else",
  "in",
  "instanceof",
  "of",
  "return",
  "throw",
  "typeof",
  "void",
  "yield",
  "await",
]);
const forbiddenRuntimeSignatures = [
  {
    name: "Deno server runtime",
    pattern: /\bDeno\s*\.\s*(?:serve|env)\b/,
  },
  {
    name: "Bun server runtime",
    pattern: /\bBun\s*\.\s*(?:serve|env)\b/,
  },
  {
    name: "process environment access",
    pattern: /\bprocess\s*\.\s*env\b/,
  },
  {
    name: "email provider runtime",
    pattern: /\b(?:new\s+)?Resend\s*\(|\bnodemailer\b|\bcreateTransport\s*\(/i,
  },
  {
    name: "email sending runtime",
    pattern: /\b(?:sendEmail|sendMail)\s*\(/,
  },
  {
    name: "database migration runtime",
    pattern: /\b(?:CREATE|ALTER|DROP)\s+(?:TABLE|FUNCTION|TRIGGER|POLICY)\b/i,
  },
];
const forbiddenRuntimePathPatterns = [
  /(^|\/)(?:backend|server|migrations?)(?:\/|$)/i,
  /(^|\/)(?:database|db)(?:\/|$)/i,
  /(^|\/)(?:send[-_]?email|send[-_]?mail|email[-_](?:worker|server|function|job|service|handler)|mailer|migrat(?:e|ions?)(?:[-_].*)?)(?:\.[^/]+)?$/i,
];
const forbiddenRuntimeModuleImportPattern = /(?:from\s+|import\s*|require\s*\()\s*["'](?:resend|nodemailer|@sendgrid\/mail|postmark|mailgun)/i;
const forbiddenPackageScriptKeyPattern = /^(?:email(?:[-_:].*)?|mail(?:[-_:].*)?|send[-_]?email(?:[-_:].*)?|send[-_]?mail(?:[-_:].*)?|migrat(?:e|ions?)(?:[-_:].*)?|backend(?:[-_:].*)?|server(?:[-_:].*)?)$/i;
const forbiddenPackageScriptCommandPattern = /(?:email:preview|send[-_]?email|send[-_]?mail|migrat(?:e|ions?)|backend|server)/i;

function toRelativePath(root, absolutePath) {
  return relative(root, absolutePath).split(sep).join("/");
}

function isDocumentationOrTestPath(path) {
  return path
    .split("/")
    .some((segment) => nonRuntimePathSegments.has(segment.toLowerCase())) || testFilePattern.test(path);
}

function isRuntimePath(path) {
  if (isDocumentationOrTestPath(path)) return false;
  return sourceFileExtensions.has(extname(path).toLowerCase());
}

function addViolation(violations, message) {
  violations.add(message);
}

function inspectEnvironmentNames(contents, path, violations) {
  for (const [match] of contents.matchAll(forbiddenEnvironmentPattern)) {
    if (!allowedPublicEnvironmentNames.has(match)) {
      addViolation(violations, `${path}: forbidden backend environment name ${match}`);
    }
  }

  for (const [match] of contents.matchAll(frontendEnvironmentPattern)) {
    if (!allowedPublicEnvironmentNames.has(match)) {
      addViolation(violations, `${path}: unknown frontend environment name ${match}`);
    }
  }
}

function inspectEnvironmentFile(contents, path, violations) {
  inspectEnvironmentNames(contents, path, violations);

  for (const [lineNumber, line] of contents.split(/\r?\n/).entries()) {
    const assignment = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\+?=/);
    if (assignment && !allowedPublicEnvironmentNames.has(assignment[1])) {
      const environmentFileKind = environmentExamplePattern.test(path) ? "environment examples" : "environment files";
      addViolation(
        violations,
        `${path}:${lineNumber + 1}: ${environmentFileKind} may expose only allowlisted public variables`,
      );
    }
  }
}

function maskNonCode(contents) {
  const chars = [...contents];

  const maskQuoted = (startIndex, quote) => {
    chars[startIndex] = " ";
    for (let index = startIndex + 1; index < chars.length; index += 1) {
      const character = chars[index];
      const nextCharacter = chars[index + 1];
      if (character === "\\") {
        chars[index] = " ";
        if (nextCharacter && nextCharacter !== "\n" && nextCharacter !== "\r") {
          chars[index + 1] = " ";
          index += 1;
        }
      } else if (character === quote) {
        chars[index] = " ";
        return index + 1;
      } else if (character !== "\n" && character !== "\r") {
        chars[index] = " ";
      }
    }
    return chars.length;
  };

  const maskTemplate = (startIndex) => {
    chars[startIndex] = " ";
    for (let index = startIndex + 1; index < chars.length; index += 1) {
      const character = chars[index];
      const nextCharacter = chars[index + 1];
      if (character === "\\") {
        chars[index] = " ";
        if (nextCharacter && nextCharacter !== "\n" && nextCharacter !== "\r") {
          chars[index + 1] = " ";
          index += 1;
        }
      } else if (character === "`") {
        chars[index] = " ";
        return index + 1;
      } else if (character === "$" && nextCharacter === "{") {
        chars[index] = " ";
        chars[index + 1] = " ";
        index = maskCode(index + 2, true) - 1;
      } else if (character !== "\n" && character !== "\r") {
        chars[index] = " ";
      }
    }
    return chars.length;
  };

  const isRegexStart = (startIndex) => {
    let index = startIndex - 1;
    while (index >= 0 && /\s/.test(chars[index])) index -= 1;
    if (index < 0 || "=([{,:;!&|?+*%^~<>".includes(chars[index])) return true;
    const wordEnd = index + 1;
    while (index >= 0 && /[A-Za-z0-9_$]/.test(chars[index])) index -= 1;
    const previousWord = chars.slice(index + 1, wordEnd).join("");
    return regexPrecedingWords.has(previousWord);
  };

  const maskRegex = (startIndex) => {
    chars[startIndex] = " ";
    let inCharacterClass = false;
    for (let index = startIndex + 1; index < chars.length; index += 1) {
      const character = chars[index];
      const nextCharacter = chars[index + 1];
      if (character === "\\") {
        chars[index] = " ";
        if (nextCharacter && nextCharacter !== "\n" && nextCharacter !== "\r") {
          chars[index + 1] = " ";
          index += 1;
        }
      } else if (character === "[" && !inCharacterClass) {
        chars[index] = " ";
        inCharacterClass = true;
      } else if (character === "]" && inCharacterClass) {
        chars[index] = " ";
        inCharacterClass = false;
      } else if (character === "/" && !inCharacterClass) {
        chars[index] = " ";
        index += 1;
        while (index < chars.length && /[A-Za-z]/.test(chars[index])) {
          chars[index] = " ";
          index += 1;
        }
        return index;
      } else if (character !== "\n" && character !== "\r") {
        chars[index] = " ";
      }
    }
    return chars.length;
  };

  const maskCode = (startIndex, stopAtClosingBrace = false) => {
    let braceDepth = 0;
    for (let index = startIndex; index < chars.length; index += 1) {
      const character = chars[index];
      const nextCharacter = chars[index + 1];

      if (stopAtClosingBrace && character === "}" && braceDepth === 0) return index + 1;
      if (character === "{" && stopAtClosingBrace) {
        braceDepth += 1;
        continue;
      }
      if (character === "}" && stopAtClosingBrace && braceDepth > 0) {
        braceDepth -= 1;
        continue;
      }

      if (character === "/" && nextCharacter === "/") {
        chars[index] = " ";
        chars[index + 1] = " ";
        index += 1;
        while (index + 1 < chars.length && chars[index + 1] !== "\n" && chars[index + 1] !== "\r") {
          index += 1;
          chars[index] = " ";
        }
      } else if (character === "/" && nextCharacter === "*") {
        chars[index] = " ";
        chars[index + 1] = " ";
        index += 2;
        while (index < chars.length) {
          if (chars[index] === "*" && chars[index + 1] === "/") {
            chars[index] = " ";
            chars[index + 1] = " ";
            index += 1;
            break;
          }
          if (chars[index] !== "\n" && chars[index] !== "\r") chars[index] = " ";
          index += 1;
        }
        index -= 1;
      } else if (character === "/" && isRegexStart(index)) {
        index = maskRegex(index) - 1;
      } else if (character === "'") {
        index = maskQuoted(index, "'") - 1;
      } else if (character === '"') {
        index = maskQuoted(index, '"') - 1;
      } else if (character === "`") {
        index = maskTemplate(index) - 1;
      }
    }
    return chars.length;
  };

  maskCode(0);
  return chars.join("");
}

function readImportMetaEnvironmentName(contents, startIndex) {
  const suffix = contents.slice(startIndex);
  const dotAccess = suffix.match(/^\s*(?:\?\s*)?\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/);
  if (dotAccess) return { name: dotAccess[1] };

  if (!/^\s*\[/.test(suffix)) return { name: null, dynamic: false };
  const bracketAccess = suffix.match(/^\s*\[\s*(["'`])([^"'`]*)\1\s*\]/);
  if (bracketAccess) return { name: bracketAccess[2] };
  return { name: null, dynamic: true };
}

function inspectImportMetaEnvironment(contents, path, violations) {
  const code = maskNonCode(contents);
  for (const match of code.matchAll(importMetaEnvironmentAccessPattern)) {
    const access = readImportMetaEnvironmentName(contents, match.index + match[0].length);
    if (!access.name || !allowedImportMetaEnvironmentNames.has(access.name)) {
      const detail = access.dynamic ? "dynamic or unknown key" : access.name || "bare access";
      addViolation(violations, `${path}: forbidden import.meta.env access (${detail})`);
    }
  }
}

function inspectRuntimeSignatures(contents, path, violations) {
  const code = maskNonCode(contents);
  for (const signature of forbiddenRuntimeSignatures) {
    if (signature.pattern.test(code)) {
      addViolation(violations, `${path}: forbidden backend runtime signature ${signature.name}`);
    }
  }

  if (path !== "scripts/check-frontend-only.mjs" && forbiddenRuntimeModuleImportPattern.test(contents)) {
    addViolation(violations, `${path}: forbidden backend runtime signature email provider import`);
  }
}

function inspectRuntimePath(path, violations) {
  if (isDocumentationOrTestPath(path)) return;
  if (extname(path).toLowerCase() === ".sql") {
    addViolation(violations, `${path}: migration SQL is not allowed outside the frontend boundary`);
  }
  for (const pattern of forbiddenRuntimePathPatterns) {
    if (pattern.test(path)) {
      addViolation(violations, `${path}: forbidden backend/email/migration runtime path`);
      break;
    }
  }
}

function inspectPackageScripts(contents, path, violations) {
  let packageJson;
  try {
    packageJson = JSON.parse(contents);
  } catch {
    return;
  }

  if (!packageJson.scripts || typeof packageJson.scripts !== "object") return;
  for (const [name, command] of Object.entries(packageJson.scripts)) {
    if (
      forbiddenPackageScriptKeyPattern.test(name) ||
      (typeof command === "string" && forbiddenPackageScriptCommandPattern.test(command))
    ) {
      addViolation(violations, `${path}: forbidden backend/email/migration package script ${name}`);
    }
  }
}

function inspectTextFile(root, absolutePath, violations, inspectedFiles) {
  let contents;
  try {
    contents = readFileSync(absolutePath, "utf8");
  } catch {
    return;
  }

  if (contents.includes("\u0000")) return;
  const path = toRelativePath(root, absolutePath);
  inspectedFiles.add(path);

  if (environmentFilePattern.test(path)) {
    inspectEnvironmentFile(contents, path, violations);
  }

  if (path === "package.json") inspectPackageScripts(contents, path, violations);

  if (path !== frontendOnlyGuardPath && !isDocumentationOrTestPath(path)) {
    inspectEnvironmentNames(contents, path, violations);
  }

  if (!isRuntimePath(path)) return;
  inspectRuntimePath(path, violations);
  if (path !== frontendOnlyGuardPath) inspectImportMetaEnvironment(contents, path, violations);
  inspectRuntimeSignatures(contents, path, violations);
}

function inspectTree(root, directory, violations, inspectedFiles) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    const path = toRelativePath(root, absolutePath);
    const pathSegments = path.split("/");

    if (pathSegments.some((segment) => segment.toLowerCase() === "supabase") && !isDocumentationOrTestPath(path)) {
      addViolation(violations, `${path}: backend artifact path is not allowed in the landing repository`);
      if (entry.isDirectory()) continue;
    }

    if (
      pathSegments.some((segment) => segment.toLowerCase() === "scripts") &&
      !entry.isDirectory() &&
      !isDocumentationOrTestPath(path) &&
      !allowedScriptPaths.has(path)
    ) {
      addViolation(violations, `${path}: script path is not allowlisted frontend tooling`);
    }

    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) inspectTree(root, absolutePath, violations, inspectedFiles);
      continue;
    }

    inspectTextFile(root, absolutePath, violations, inspectedFiles);
  }
}

export function checkFrontendOnly(root = repositoryRoot) {
  const resolvedRoot = resolve(root);
  const violations = new Set();
  const inspectedFiles = new Set();
  inspectTree(resolvedRoot, resolvedRoot, violations, inspectedFiles);
  return {
    violations: [...violations].sort(),
    inspectedFiles: [...inspectedFiles].sort(),
  };
}

function runCli() {
  const result = checkFrontendOnly(repositoryRoot);
  if (result.violations.length > 0) {
    console.error("Frontend-only boundary check failed:");
    for (const violation of result.violations) console.error(`- ${violation}`);
    process.exitCode = 1;
  } else {
    console.log(`Frontend-only boundary check passed (${result.inspectedFiles.length} text files inspected).`);
  }
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
  }
}

if (isMainModule()) runCli();
