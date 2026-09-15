#!/usr/bin/env node

import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

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
const executableSourceFileExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
]);
const typescriptScriptKinds = new Map([
  [".cjs", ts.ScriptKind.JS],
  [".js", ts.ScriptKind.JS],
  [".mjs", ts.ScriptKind.JS],
  [".jsx", ts.ScriptKind.JSX],
  [".cts", ts.ScriptKind.TS],
  [".mts", ts.ScriptKind.TS],
  [".ts", ts.ScriptKind.TS],
  [".tsx", ts.ScriptKind.TSX],
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
const forbiddenEnvironmentNameSet = new Set(forbiddenEnvironmentNames);
const frontendEnvironmentPattern = /\bVITE_[A-Za-z0-9_]+\b/g;
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
const forbiddenRuntimeBackendNamePattern = /^(?:backend|server|database|db)(?:[-_.](?:runtime|worker|function|job|service|handler|sender|processor|dispatcher|queue|transport|api|endpoint|runner|task|seed|migration)(?:[-_.].*)?)?$/i;
const forbiddenRuntimeMailerNamePattern = /^mailer(?:[-_.](?:worker|server|function|job|service|handler|runtime|sender|processor|dispatcher|queue|transport|api|endpoint|runner|task)(?:[-_.].*)?)?$/i;
const forbiddenRuntimeMigrationNamePattern = /^(?:migrat(?:e|or|ion|ions?))(?:[-_.].*)?$/i;
const forbiddenRuntimeEmailDirectoryNamePattern = /^(?:email|mail|send[-_]?email|send[-_]?mail)[-_.](?:worker|server|function|job|service|handler|runtime|sender|processor|dispatcher|queue|transport|api|endpoint|runner|task)(?:[-_.].*)?$/i;
const forbiddenRuntimeEmailFileNamePattern = /^(?:email|mail|send[-_]?email|send[-_]?mail)(?:[-_.](?:worker|server|function|job|service|handler|runtime|sender|processor|dispatcher|queue|transport|api|endpoint|runner|task)(?:[-_.].*)?)?$/i;
const forbiddenRuntimeDirectoryPatterns = [
  forbiddenRuntimeBackendNamePattern,
  forbiddenRuntimeMailerNamePattern,
  forbiddenRuntimeMigrationNamePattern,
  forbiddenRuntimeEmailDirectoryNamePattern,
];
const forbiddenRuntimeFileNamePatterns = [
  forbiddenRuntimeBackendNamePattern,
  forbiddenRuntimeMailerNamePattern,
  forbiddenRuntimeMigrationNamePattern,
  forbiddenRuntimeEmailFileNamePattern,
];
const forbiddenRuntimeModuleNamePattern = /^(?:resend|nodemailer|@sendgrid\/mail|postmark|mailgun)(?:\/|$)/i;
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

function isExpressionWrapper(node) {
  return (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    (typeof ts.isSatisfiesExpression === "function" && ts.isSatisfiesExpression(node))
  );
}

function unwrapExpression(node) {
  let current = node;
  while (current && isExpressionWrapper(current)) current = current.expression;
  return current;
}

function isImportMeta(node) {
  return (
    ts.isMetaProperty(node) &&
    node.keywordToken === ts.SyntaxKind.ImportKeyword &&
    node.name.text === "meta"
  );
}

function getStaticAccessName(node) {
  if (ts.isPropertyAccessExpression(node)) return { name: node.name.text, dynamic: false };

  const argument = unwrapExpression(node.argumentExpression);
  if (
    argument &&
    (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
  ) {
    return { name: argument.text, dynamic: false };
  }

  return { name: null, dynamic: true };
}

function isAccessExpression(node) {
  return Boolean(node) && (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node));
}

function isOutermostAccessExpression(node) {
  let parent = node.parent;
  while (parent && isExpressionWrapper(parent)) parent = parent.parent;
  return !isAccessExpression(parent) || unwrapExpression(parent.expression) !== node;
}

function describeImportMetaAccess(node) {
  const segments = [];
  let current = unwrapExpression(node);

  while (isAccessExpression(current)) {
    const access = getStaticAccessName(current);
    segments.unshift(access);
    current = unwrapExpression(current.expression);
  }

  if (!isImportMeta(current)) return null;
  return segments;
}

function reportForbiddenImportMetaEnvironmentAccess(path, access, violations) {
  const detail = access.dynamic ? "dynamic or unknown key" : access.name || "bare access";
  addViolation(violations, `${path}: forbidden import.meta.env access (${detail})`);
}

function inspectImportMetaEnvironmentAst(contents, path, violations, scriptKind) {
  const sourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true, scriptKind);

  function visit(node) {
    if (isImportMeta(node)) {
      let parent = node.parent;
      while (parent && isExpressionWrapper(parent)) parent = parent.parent;
      if (!isAccessExpression(parent) || unwrapExpression(parent.expression) !== node) {
        addViolation(violations, `${path}: forbidden import.meta access (bare access)`);
      }
    }

    const accessExpression = unwrapExpression(node);
    if (isAccessExpression(accessExpression) && isOutermostAccessExpression(accessExpression)) {
      const segments = describeImportMetaAccess(accessExpression);
      if (segments && segments.length > 0) {
        const environmentAccess = segments[0];
        if (environmentAccess.dynamic) {
          reportForbiddenImportMetaEnvironmentAccess(path, environmentAccess, violations);
        } else if (environmentAccess.name === "env") {
          if (segments.length !== 2) {
            reportForbiddenImportMetaEnvironmentAccess(path, {
              name: null,
              dynamic: segments.length > 2 ? true : false,
            }, violations);
          } else {
            const environmentName = segments[1];
            if (
              environmentName.dynamic ||
              !allowedImportMetaEnvironmentNames.has(environmentName.name)
            ) {
              reportForbiddenImportMetaEnvironmentAccess(path, environmentName, violations);
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function getEmbeddedScriptKind(attributes) {
  const languageMatch = attributes.match(
    /\b(?:lang|type)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i,
  );
  const language = (languageMatch?.[1] || languageMatch?.[2] || languageMatch?.[3] || "").toLowerCase();

  if (language.includes("tsx")) return ts.ScriptKind.TSX;
  if (language.includes("jsx")) return ts.ScriptKind.JSX;
  if (language.includes("typescript") || /(?:^|\/)ts$/.test(language)) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function inspectEmbeddedScriptBlocks(contents, path, violations, inspector) {
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let inspectedBlock = false;

  for (const match of contents.matchAll(scriptPattern)) {
    inspectedBlock = true;
    inspector(match[2], path, violations, getEmbeddedScriptKind(match[1] || ""));
  }

  return inspectedBlock;
}

function inspectEnvironmentIdentifiersAst(contents, path, violations, scriptKind) {
  const sourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true, scriptKind);

  function visit(node) {
    if (ts.isIdentifier(node)) {
      const name = node.text;
      const forbiddenName = name.startsWith("VITE_") ? name.slice(5) : name;
      if (forbiddenEnvironmentNameSet.has(forbiddenName)) {
        if (!allowedPublicEnvironmentNames.has(name)) {
          addViolation(violations, `${path}: forbidden backend environment name ${name}`);
        }
      } else if (name.startsWith("VITE_") && !allowedPublicEnvironmentNames.has(name)) {
        addViolation(violations, `${path}: unknown frontend environment name ${name}`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function inspectEnvironmentIdentifiers(contents, path, violations) {
  const extension = extname(path).toLowerCase();
  const scriptKind = typescriptScriptKinds.get(extension);
  if (scriptKind !== undefined) {
    inspectEnvironmentIdentifiersAst(contents, path, violations, scriptKind);
    return;
  }

  if (extension === ".html" || extension === ".vue" || extension === ".svelte") {
    inspectEmbeddedScriptBlocks(contents, path, violations, inspectEnvironmentIdentifiersAst);
  }
}

function inspectImportMetaEnvironment(contents, path, violations) {
  const extension = extname(path).toLowerCase();
  const scriptKind = typescriptScriptKinds.get(extension);
  if (scriptKind !== undefined) {
    inspectImportMetaEnvironmentAst(contents, path, violations, scriptKind);
    return;
  }

  if (extension === ".html" || extension === ".vue" || extension === ".svelte") {
    if (inspectEmbeddedScriptBlocks(contents, path, violations, inspectImportMetaEnvironmentAst)) return;
  }

  if (extension === ".json") return;

  const code = maskNonCode(contents);
  const fallbackPattern = /import\s*\.\s*meta\s*\.\s*env\b/g;
  for (const match of code.matchAll(fallbackPattern)) {
    addViolation(violations, `${path}: forbidden import.meta.env access (unknown syntax)`);
  }
}

function getStaticStringValue(node) {
  const expression = unwrapExpression(node);
  if (
    expression &&
    (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
  ) {
    return expression.text;
  }
  return null;
}

function inspectRuntimeModuleImportsAst(contents, path, violations, scriptKind) {
  const sourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true, scriptKind);

  function inspectModuleSpecifier(node) {
    const moduleName = getStaticStringValue(node);
    if (moduleName !== null && forbiddenRuntimeModuleNamePattern.test(moduleName)) {
      addViolation(violations, `${path}: forbidden backend runtime signature email provider import`);
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      inspectModuleSpecifier(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      inspectModuleSpecifier(node.moduleReference.expression);
    } else if (ts.isCallExpression(node)) {
      const expression = unwrapExpression(node.expression);
      const isDynamicImport = expression?.kind === ts.SyntaxKind.ImportKeyword;
      const isRequireCall =
        (ts.isIdentifier(expression) && expression.text === "require") ||
        (ts.isPropertyAccessExpression(expression) && expression.name.text === "require");
      if (isDynamicImport || isRequireCall) inspectModuleSpecifier(node.arguments[0]);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function inspectRuntimeModuleImports(contents, path, violations) {
  if (path === frontendOnlyGuardPath) return;

  const extension = extname(path).toLowerCase();
  const scriptKind = typescriptScriptKinds.get(extension);
  if (scriptKind !== undefined) {
    inspectRuntimeModuleImportsAst(contents, path, violations, scriptKind);
    return;
  }

  if (extension === ".html" || extension === ".vue" || extension === ".svelte") {
    inspectEmbeddedScriptBlocks(contents, path, violations, inspectRuntimeModuleImportsAst);
  }
}

function inspectRuntimeAccessAst(contents, path, violations, scriptKind) {
  const sourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true, scriptKind);
  const runtimeGlobalAccesses = new Map([
    ["Deno", new Set(["serve", "env"])],
    ["Bun", new Set(["serve", "env"])],
    ["process", new Set(["env"])],
  ]);

  function report(signatureName) {
    addViolation(violations, `${path}: forbidden backend runtime signature ${signatureName}`);
  }

  function inspectGlobalAccess(node) {
    const target = unwrapExpression(node.expression);
    if (!ts.isIdentifier(target)) return;

    const allowedNames = runtimeGlobalAccesses.get(target.text);
    if (!allowedNames) return;

    const name = ts.isPropertyAccessExpression(node)
      ? node.name.text
      : getStaticStringValue(node.argumentExpression);
    if (name === null || allowedNames.has(name)) {
      report(target.text === "process" ? "process environment access" : `${target.text} server runtime`);
    }
  }

  function getCallName(node) {
    const expression = unwrapExpression(node);
    if (ts.isIdentifier(expression)) return expression.text;
    if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
    return null;
  }

  function visit(node) {
    const expression = unwrapExpression(node);
    if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
      inspectGlobalAccess(expression);
    }

    if (ts.isCallExpression(expression)) {
      const callName = getCallName(expression.expression);
      if (callName === "sendEmail" || callName === "sendMail") {
        report("email sending runtime");
      } else if (callName === "createTransport" || callName === "Resend") {
        report("email provider runtime");
      }
    } else if (ts.isNewExpression(expression) && getCallName(expression.expression) === "Resend") {
      report("email provider runtime");
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function inspectMaskedRuntimeSignatures(code, path, violations) {
  for (const signature of forbiddenRuntimeSignatures) {
    if (signature.pattern.test(code)) {
      addViolation(violations, `${path}: forbidden backend runtime signature ${signature.name}`);
    }
  }
}

function inspectRuntimeSignatures(contents, path, violations) {
  const extension = extname(path).toLowerCase();
  const scriptKind = typescriptScriptKinds.get(extension);
  if (scriptKind !== undefined) {
    inspectMaskedRuntimeSignatures(maskNonCode(contents), path, violations);
    inspectRuntimeAccessAst(contents, path, violations, scriptKind);
  } else if (extension === ".html" || extension === ".vue" || extension === ".svelte") {
    inspectEmbeddedScriptBlocks(contents, path, violations, (script, scriptPath, scriptViolations, kind) => {
      inspectMaskedRuntimeSignatures(maskNonCode(script), scriptPath, scriptViolations);
      inspectRuntimeAccessAst(script, scriptPath, scriptViolations, kind);
    });
  }

  inspectRuntimeModuleImports(contents, path, violations);
}

function inspectRuntimePath(path, violations) {
  if (isDocumentationOrTestPath(path)) return;
  const extension = extname(path).toLowerCase();
  if (extension === ".sql") {
    addViolation(violations, `${path}: migration SQL is not allowed outside the frontend boundary`);
  }

  if (!executableSourceFileExtensions.has(extension)) return;

  const pathSegments = path.split("/");
  const fileName = pathSegments.at(-1)?.slice(0, -extension.length) ?? "";
  const hasForbiddenFileName = forbiddenRuntimeFileNamePatterns.some((pattern) => pattern.test(fileName));
  const hasForbiddenDirectory = pathSegments
    .slice(0, -1)
    .some((segment) => forbiddenRuntimeDirectoryPatterns.some((pattern) => pattern.test(segment)));

  if (hasForbiddenFileName || hasForbiddenDirectory) {
    addViolation(violations, `${path}: forbidden backend/email/migration runtime path`);
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
  const path = toRelativePath(root, absolutePath);
  if (isRuntimePath(path)) inspectRuntimePath(path, violations);

  let contents;
  try {
    contents = readFileSync(absolutePath, "utf8");
  } catch {
    addViolation(violations, `${path}: unable to inspect file`);
    return;
  }

  if (contents.includes("\u0000")) {
    if (
      !isDocumentationOrTestPath(path) &&
      (isRuntimePath(path) || environmentFilePattern.test(path))
    ) {
      addViolation(violations, `${path}: binary source or environment files cannot be inspected`);
    }
    return;
  }
  inspectedFiles.add(path);

  if (environmentFilePattern.test(path) && !isDocumentationOrTestPath(path)) {
    inspectEnvironmentFile(contents, path, violations);
  }

  if (path === "package.json") inspectPackageScripts(contents, path, violations);

  if (path !== frontendOnlyGuardPath && !isDocumentationOrTestPath(path)) {
    inspectEnvironmentNames(contents, path, violations);
    inspectEnvironmentIdentifiers(contents, path, violations);
  }

  if (!isRuntimePath(path)) return;
  if (path !== frontendOnlyGuardPath) inspectImportMetaEnvironment(contents, path, violations);
  inspectRuntimeSignatures(contents, path, violations);
}

function inspectTree(root, directory, violations, inspectedFiles) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    const path = toRelativePath(root, directory) || ".";
    addViolation(violations, `${path}: unable to inspect directory`);
    return;
  }

  for (const entry of entries) {
    if (skippedDirectories.has(entry.name)) continue;

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

    if (entry.isSymbolicLink()) {
      addViolation(violations, `${path}: symbolic link paths are not allowed in the frontend boundary`);
      continue;
    }

    if (entry.isDirectory()) {
      inspectTree(root, absolutePath, violations, inspectedFiles);
      continue;
    }

    if (!entry.isFile()) {
      if (!isDocumentationOrTestPath(path)) {
        addViolation(violations, `${path}: unsupported filesystem entry cannot be inspected`);
      }
      continue;
    }

    inspectTextFile(root, absolutePath, violations, inspectedFiles);
  }
}

export function checkFrontendOnly(root = repositoryRoot) {
  const requestedRoot = resolve(root);
  let resolvedRoot;
  try {
    resolvedRoot = realpathSync(requestedRoot);
  } catch {
    return {
      violations: [`${requestedRoot}: unable to resolve repository root`],
      inspectedFiles: [],
    };
  }

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
