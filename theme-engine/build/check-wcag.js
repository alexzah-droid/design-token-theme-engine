const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');

// ── WCAG math ─────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]) {
  return [r, g, b]
    .map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); })
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hexToRgb(hex1));
  const L2 = relativeLuminance(hexToRgb(hex2));
  const [li, da] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (li + 0.05) / (da + 0.05);
}

function parsePx(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ── CSS parsing ────────────────────────────────────────────────────────────────

function parseVars(cssText) {
  const vars = {};
  // hex values
  const hexRe = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g;
  let m;
  while ((m = hexRe.exec(cssText)) !== null) vars[m[1]] = m[2];
  // px values (for radius checks)
  const pxRe = /--([a-z0-9-]+)\s*:\s*([0-9.]+px)\s*;/g;
  while ((m = pxRe.exec(cssText)) !== null) vars[m[1]] = m[2];
  return vars;
}

// ── 1. Contrast pairs ─────────────────────────────────────────────────────────
//
// severity:
//   'error' — primary UI surfaces; fails build (exit 1)
//   'warn'  — secondary/contextual; reported but build passes
//
// To extend: add a row [fg-var, bg-var, min-ratio, severity].

const PAIRS = [
  // Core text — primary surfaces
  ['text-primary',          'page-bg',              4.5, 'error'],
  ['text-primary',          'card-bg',              4.5, 'error'],
  ['text-secondary',        'page-bg',              4.5, 'error'],
  ['text-secondary',        'card-bg',              4.5, 'error'],
  ['text-muted',            'page-bg',              4.5, 'error'],
  ['text-muted',            'card-bg',              4.5, 'error'],
  ['heading-color',         'page-bg',              4.5, 'error'],
  ['heading-color',         'card-bg',              4.5, 'error'],
  // Form elements
  ['input-text',            'input-bg',             4.5, 'error'],
  ['select-text',           'select-bg',            4.5, 'error'],
  ['label-color',           'page-bg',              4.5, 'error'],
  // Button — default + hover states
  ['button-text',           'button-bg',            4.5, 'error'],
  ['button-text',           'button-hover-bg',      4.5, 'error'],
  // Navigation
  ['nav-text',              'nav-bg',               4.5, 'error'],
  // Badges (all variants)
  ['badge-success-text',    'badge-success-bg',     4.5, 'error'],
  ['badge-warning-text',    'badge-warning-bg',     4.5, 'error'],
  ['badge-error-text',      'badge-error-bg',       4.5, 'error'],
  ['badge-neutral-text',    'badge-neutral-bg',     4.5, 'error'],
  // Alerts (all variants)
  ['alert-success-text',    'alert-success-bg',     4.5, 'error'],
  ['alert-warning-text',    'alert-warning-bg',     4.5, 'error'],
  ['alert-error-text',      'alert-error-bg',       4.5, 'error'],
  ['alert-info-text',       'alert-info-bg',        4.5, 'error'],
  // Interactive components
  ['pagination-active-text','pagination-active-bg', 4.5, 'error'],
  ['chip-active-text',      'chip-active-bg',       4.5, 'error'],
  ['tab-active-text',       'tab-bg',               4.5, 'error'],
  ['table-header-text',     'table-header-bg',      4.5, 'error'],
  // Secondary/contextual surfaces — warnings
  ['text-primary',          'surface-bg2',          4.5, 'warn'],
  ['text-secondary',        'surface-bg2',          4.5, 'warn'],
  ['text-muted',            'surface-bg2',          4.5, 'warn'],
  ['text-muted',            'surface-bg3',          4.5, 'warn'],
  ['label-color',           'card-bg',              4.5, 'warn'],
  // Disabled state — intentionally low contrast, warn only
  ['button-disabled-text',  'button-disabled-bg',   4.5, 'warn'],
];

function checkContrast(vars) {
  const errors = [], warns = [];
  for (const [fg, bg, threshold, severity] of PAIRS) {
    if (!vars[fg] || !vars[bg]) continue;
    const ratio = contrastRatio(vars[fg], vars[bg]);
    if (ratio < threshold) {
      const entry = { check: 'contrast', fg, bg, ratio, threshold, fgVal: vars[fg], bgVal: vars[bg] };
      (severity === 'error' ? errors : warns).push(entry);
    }
  }
  return { errors, warns };
}

// ── 2. Text hierarchy ─────────────────────────────────────────────────────────
//
// On page-bg: text-primary must have higher contrast than text-secondary,
// which must have higher contrast than text-muted.
// Violation = visual hierarchy is broken (a "less prominent" token looks bolder).

function checkTextHierarchy(vars) {
  const warns = [];
  const bg = vars['page-bg'];
  if (!bg) return { errors: [], warns };

  const tokens = [
    ['text-primary',   vars['text-primary']],
    ['text-secondary', vars['text-secondary']],
    ['text-muted',     vars['text-muted']],
  ].filter(([, v]) => v);

  for (let i = 0; i < tokens.length - 1; i++) {
    const [nameA, hexA] = tokens[i];
    const [nameB, hexB] = tokens[i + 1];
    const crA = contrastRatio(hexA, bg);
    const crB = contrastRatio(hexB, bg);
    if (crB >= crA) {
      warns.push({
        check: 'hierarchy',
        msg: `--${nameB} (${crB.toFixed(2)}:1) ≥ --${nameA} (${crA.toFixed(2)}:1) on --page-bg — visual hierarchy broken`,
      });
    }
  }
  return { errors: [], warns };
}

// ── 3. Radius monotonicity ────────────────────────────────────────────────────
//
// radius-sm ≤ radius-md ≤ radius-lg.
// Violation = scale is inconsistent (e.g. sm=4px, md=2px).

function checkRadius(vars) {
  const warns = [];
  const sm = parsePx(vars['radius-sm']);
  const md = parsePx(vars['radius-md']);
  const lg = parsePx(vars['radius-lg']);

  if (sm !== null && md !== null && sm > md) {
    warns.push({
      check: 'radius',
      msg: `radius-sm (${vars['radius-sm']}) > radius-md (${vars['radius-md']}) — scale broken`,
    });
  }
  if (md !== null && lg !== null && md > lg) {
    warns.push({
      check: 'radius',
      msg: `radius-md (${vars['radius-md']}) > radius-lg (${vars['radius-lg']}) — scale broken`,
    });
  }
  return { errors: [], warns };
}

// ── Runner ────────────────────────────────────────────────────────────────────

function checkFile(file) {
  const cssText = fs.readFileSync(path.join(DIST_DIR, file), 'utf8');
  const vars = parseVars(cssText);

  const contrast   = checkContrast(vars);
  const hierarchy  = checkTextHierarchy(vars);
  const radius     = checkRadius(vars);

  return {
    errors: [...contrast.errors, ...hierarchy.errors, ...radius.errors],
    warns:  [...contrast.warns,  ...hierarchy.warns,  ...radius.warns],
  };
}

function formatIssue(issue) {
  if (issue.check === 'contrast') {
    return `--${issue.fg} (${issue.fgVal}) on --${issue.bg} (${issue.bgVal}): ${issue.ratio.toFixed(2)}:1  (required ≥${issue.threshold})`;
  }
  return issue.msg;
}

function main() {
  const files = fs
    .readdirSync(DIST_DIR)
    .filter(f => f.endsWith('.css') && !f.endsWith('.bundle.css') && !f.startsWith('.'))
    .sort();

  if (files.length === 0) {
    console.error('No CSS files in dist/ — run npm run build first');
    process.exit(1);
  }

  console.log('WCAG AA + Design Integrity Checker\n');

  let totalErrors = 0;
  let totalWarns  = 0;

  for (const file of files) {
    const { errors, warns } = checkFile(file);
    const label = file.replace('.css', '');

    if (errors.length === 0 && warns.length === 0) {
      console.log(`✅ ${label}`);
      continue;
    }

    console.log(`── ${label} ${'─'.repeat(Math.max(1, 40 - label.length))}`);
    for (const e of errors) {
      console.log(`  ❌ ERROR  ${formatIssue(e)}`);
      totalErrors++;
    }
    for (const w of warns) {
      console.log(`  ⚠️   WARN  ${formatIssue(w)}`);
      totalWarns++;
    }
    console.log('');
  }

  console.log(`Summary: ${totalErrors} error(s), ${totalWarns} warning(s)`);

  if (totalErrors > 0) {
    console.log('\n❌ Violations found. Fix before shipping.');
    process.exit(1);
  }

  if (totalWarns > 0) {
    console.log('\n⚠️  Warnings on secondary surfaces or design hints (build passes).');
  } else {
    console.log('\n🎉 All checks passed.');
  }
}

main();
