const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const STYLES_FILE = path.join(ROOT, "styles", "components.css");
const TOKENS_DIR = path.join(ROOT, "tokens");
const THEMES_DIR = path.join(ROOT, "themes");
const DIST_DIR = path.join(ROOT, "dist");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

function getValueByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

function fail(message) {
  console.error("❌", message);
  process.exit(1);
}

function ok(message) {
  console.log("✅", message);
}

//
// 1. Проверка: нет хардкода цветов в CSS
//
function checkNoHardcodedColors() {
  const css = read(STYLES_FILE);

  const hasHex = /#[0-9a-fA-F]{3,6}/.test(css);
  const hasColorFunctions = /\b(?:rgb|rgba|hsl|hsla)\s*\(/.test(css);

  if (hasHex) {
    fail("Found hardcoded HEX colors in components.css");
  }

  if (hasColorFunctions) {
    fail("Found hardcoded color functions in components.css");
  }

  ok("No hardcoded color values");
}

//
// 2. Проверка: semantic токены ссылаются только на base
//
function checkSemantic() {
  const semantic = readJson(path.join(TOKENS_DIR, "semantic.json"));

  function traverse(obj) {
    for (const value of Object.values(obj)) {
      if (typeof value === "string") {
        const match = value.match(/^\{(.+)\}$/);
        if (match) {
          const path = match[1];

          if (!path.startsWith("color") &&
              !path.startsWith("spacing") &&
              !path.startsWith("radius") &&
              !path.startsWith("typography") &&
              !path.startsWith("shadow") &&
              !path.startsWith("motion")) {
            fail(`Invalid semantic reference: ${path}`);
          }
        }
      } else if (typeof value === "object") {
        traverse(value);
      }
    }
  }

  traverse(semantic);

  ok("Semantic tokens are valid");
}

function checkTokenReferences() {
  const base = readJson(path.join(TOKENS_DIR, "base.json"));
  const semantic = readJson(path.join(TOKENS_DIR, "semantic.json"));

  function traverse(obj) {
    for (const value of Object.values(obj)) {
      if (typeof value === "string") {
        const match = value.match(/^\{(.+)\}$/);
        if (match) {
          const tokenPath = match[1];

          const exists = getValueByPath(base, tokenPath);

          if (exists === undefined) {
            fail(`Token not found: ${tokenPath}`);
          }
        }
      } else if (typeof value === "object") {
        traverse(value);
      }
    }
  }

  traverse(semantic);

  ok("All token references exist");
}

//
// 3. Проверка: themes не содержат semantic
//
function checkThemes() {
  const files = fs.readdirSync(THEMES_DIR).filter(f => !f.startsWith(".") && f.endsWith(".json"));
  const allowedKeys = ["color", "spacing", "radius", "typography", "shadow"];

  files.forEach(file => {
    const theme = readJson(path.join(THEMES_DIR, file));

    for (const key of Object.keys(theme)) {
      if (!allowedKeys.includes(key)) {
        fail(`Theme ${file} contains non-base overrides: ${key}`);
      }
    }
  });

  ok("Themes contain only base overrides");
}

function checkBuildOutput() {
  const files = fs.readdirSync(DIST_DIR).filter(f => !f.startsWith("."));

  const requiredVars = [
    "--button-bg",
    "--button-text",
    "--button-hover-bg",
    "--button-disabled-bg"
  ];

  files.forEach(file => {
    if (!file.endsWith(".css") || file.includes(".dark.")) return;

    const content = read(path.join(DIST_DIR, file));

    requiredVars.forEach(v => {
      if (!content.includes(v)) {
        fail(`Missing ${v} in ${file}`);
      }
    });
  });

  ok("Build output contains required CSS variables");
}

function checkNoBaseVariablesInStyles() {
  const css = read(STYLES_FILE);
  const hasBaseVars = /var\(--(?:color|spacing|radius|typography|shadow)-/.test(css);

  if (hasBaseVars) {
    fail("Found direct base token usage in components.css");
  }

  ok("Styles use semantic CSS variables only");
}

function checkDarkThemes() {
  const base = readJson(path.join(TOKENS_DIR, "base.json"));
  const allowedKeys = ["color", "spacing", "radius", "typography", "shadow"];
  const files = fs.readdirSync(THEMES_DIR).filter(f => !f.startsWith(".") && f.endsWith(".dark.json"));

  if (files.length === 0) {
    ok("No dark themes found (skipped)");
    return;
  }

  files.forEach(file => {
    const theme = readJson(path.join(THEMES_DIR, file));

    for (const key of Object.keys(theme)) {
      if (!allowedKeys.includes(key)) {
        fail(`Dark theme ${file} contains non-base key: ${key}`);
      }
    }

    function checkNoNewKeys(darkObj, baseObj, prefix) {
      for (const key of Object.keys(darkObj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (!(key in baseObj)) {
          fail(`Dark theme ${file} introduces new token: ${fullPath}`);
        }
        if (typeof darkObj[key] === "object" && darkObj[key] !== null &&
            typeof baseObj[key] === "object" && baseObj[key] !== null) {
          checkNoNewKeys(darkObj[key], baseObj[key], fullPath);
        }
      }
    }

    checkNoNewKeys(theme, base, "");
  });

  ok("Dark themes are valid");
}

//
// RUN
//

checkNoHardcodedColors();
checkSemantic();
checkTokenReferences();
checkThemes();
checkDarkThemes();
checkBuildOutput();
checkNoBaseVariablesInStyles();

console.log("\n🎉 All checks passed");
