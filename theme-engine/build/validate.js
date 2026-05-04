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
  const allowedKeys = ["color", "spacing", "radius", "typography", "shadow", "motion"];

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
  const files = fs.readdirSync(DIST_DIR).filter(f => !f.startsWith(".") && f.endsWith(".css"));

  if (files.length === 0) {
    fail("No CSS files found in dist/ — run npm run build first");
  }

  files.forEach(file => {
    const content = read(path.join(DIST_DIR, file));

    if (content.trim().length === 0) {
      fail(`Empty output file: ${file}`);
    }

    if (!content.includes("[data-theme=")) {
      fail(`Missing [data-theme] selector in ${file}`);
    }
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
  const allowedKeys = ["color", "spacing", "radius", "typography", "shadow", "motion"];
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
// 7. Проверка: все var(--xxx) в components.css объявлены в semantic.json
//
function checkSemantic() {
  const semantic = readJson(path.join(TOKENS_DIR, "semantic.json"));
  const css = read(STYLES_FILE);

  function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function collectVarNames(obj, prefix) {
    const names = new Set();
    for (const [key, value] of Object.entries(obj)) {
      const parts = [...prefix, toKebabCase(key)];
      if (typeof value === "object" && value !== null) {
        for (const name of collectVarNames(value, parts)) names.add(name);
      } else {
        names.add(`--${parts.join("-")}`);
      }
    }
    return names;
  }

  const defined = collectVarNames(semantic, []);

  // Collect vars declared locally in components.css (--xxx: value)
  const localDefined = new Set();
  const declRe = /(--[\w-]+)\s*:/g;
  let d;
  while ((d = declRe.exec(css)) !== null) localDefined.add(d[1]);

  // Only check var(--xxx) without a fallback — vars with fallbacks are intentional
  // component-level parameters set via inline style (e.g. --s, --d on gantt bars)
  const used = new Set();
  const re = /var\(\s*(--[\w-]+)\s*\)/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    if (!localDefined.has(m[1])) used.add(m[1]);
  }

  const unknown = [...used].filter(v => !defined.has(v));
  if (unknown.length > 0) {
    fail(`components.css references undefined semantic tokens:\n  ${unknown.join("\n  ")}`);
  }

  ok(`Semantic tokens: all ${used.size} var() references are defined in semantic.json`);
}

//
// RUN
//

checkNoHardcodedColors();
checkTokenReferences();
checkThemes();
checkDarkThemes();
checkBuildOutput();
checkNoBaseVariablesInStyles();
checkSemantic();

console.log("\n🎉 All checks passed");
