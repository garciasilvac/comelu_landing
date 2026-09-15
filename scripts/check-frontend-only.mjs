#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const frontendEnvironmentPrefix = "VITE_";
const publicEnvironmentExamplePattern = /(^|[\\/])\.env(?:\.[^.]+)*\.example$/;
const allowedEmailIdentifier = "EMAIL_PATTERN";
const forbiddenScriptName = ["email", "preview"].join(":");

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
  `(?<![A-Z0-9_])(?:${forbiddenEnvironmentNames.join("|")})(?![A-Z0-9_])`,
  "g",
);
const frontendEmailIdentifiersPattern = /\bEMAIL_[A-Z0-9_]+\b/g;

const violations = [];
const inspectedFiles = [];

function relativePath(absolutePath) {
  return relative(repositoryRoot, absolutePath).split(sep).join("/");
}

function inspectTextFile(absolutePath) {
  let contents;
  try {
    contents = readFileSync(absolutePath, "utf8");
  } catch {
    return;
  }

  if (contents.includes("\u0000")) return;
  const path = relativePath(absolutePath);
  inspectedFiles.push(path);

  const forbiddenEnvironmentMatches = [...contents.matchAll(forbiddenEnvironmentPattern)].map(
    ([match]) => match,
  );
  for (const match of new Set(forbiddenEnvironmentMatches)) {
    violations.push(`${path}: forbidden backend environment name ${match}`);
  }

  for (const match of new Set([...contents.matchAll(frontendEmailIdentifiersPattern)].map(([value]) => value))) {
    if (match !== allowedEmailIdentifier) {
      violations.push(`${path}: forbidden backend-style EMAIL_* identifier ${match}`);
    }
  }

  if (contents.includes(forbiddenScriptName)) {
    violations.push(`${path}: forbidden backend script ${forbiddenScriptName}`);
  }

  if (publicEnvironmentExamplePattern.test(path)) {
    for (const [lineNumber, line] of contents.split(/\r?\n/).entries()) {
      const assignment = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (assignment && !assignment[1].startsWith(frontendEnvironmentPrefix)) {
        violations.push(`${path}:${lineNumber + 1}: environment examples may expose only VITE_* variables`);
      }
    }
  }
}

function inspectTree(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    const path = relativePath(absolutePath);
    const pathSegments = path.split("/");

    if (pathSegments.includes("supabase")) {
      violations.push(`${path}: backend artifact path is not allowed in the landing repository`);
      if (entry.isDirectory()) continue;
    }

    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) inspectTree(absolutePath);
      continue;
    }

    inspectTextFile(absolutePath);
  }
}

inspectTree(repositoryRoot);

if (violations.length > 0) {
  console.error("Frontend-only boundary check failed:");
  for (const violation of [...new Set(violations)].sort()) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`Frontend-only boundary check passed (${inspectedFiles.length} text files inspected).`);
}
