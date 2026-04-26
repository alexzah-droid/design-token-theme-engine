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

// ── CSS parsing ────────────────────────────────────────────────────────────────

// Extract CSS vars with hex values from a dist/*.css file
function parseVars(cssText) {
  const vars = {};
  const re = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    vars[m[1]] = m[2]; // last-write wins (dark overrides light if bundled — but we use non-bundle files)
  }
  return vars;
}

// ── Pairs to check ─────────────────────────────────────────────────────────────
//
// severity:
//   'error' — primary surfaces; fails build (exit 1)
//   'warn'  — secondary/contextual surfaces; reported but build passes
//
// Add new pairs here as the system grows.

const PAIRS = [
  // Core text on primary surfaces
  ['text-primary',   'page-bg',     4.5, 'error'],
  ['text-primary',   'card-bg',     4.5, 'error'],
  ['text-secondary', 'page-bg',     4.5, 'error'],
  ['text-secondary', 'card-bg',     4.5, 'error'],
  ['text-muted',     'page-bg',     4.5, 'error'],
  ['text-muted',     'card-bg',     4.5, 'error'],
  ['heading-color',  'page-bg',     4.5, 'error'],
  ['heading-color',  'card-bg',     4.5, 'error'],
  // Interactive components
  ['button-text',    'button-bg',   4.5, 'error'],
  ['input-text',     'input-bg',    4.5, 'error'],
  ['label-color',    'page-bg',     4.5, 'error'],
  // Secondary/contextual surfaces — warnings
  ['text-primary',   'surface-bg2', 4.5, 'warn'],
  ['text-secondary', 'surface-bg2', 4.5, 'warn'],
  ['text-muted',     'surface-bg2', 4.5, 'warn'],
  ['text-muted',     'surface-bg3', 4.5, 'warn'],
  ['nav-text',       'nav-bg',      4.5, 'warn'],
  ['label-color',    'card-bg',     4.5, 'warn'],
];

// ── Runner ────────────────────────────────────────────────────────────────────

function checkFile(file) {
  const cssText = fs.readFileSync(path.join(DIST_DIR, file), 'utf8');
  const vars = parseVars(cssText);
  const failures = { error: [], warn: [] };

  for (const [fg, bg, threshold, severity] of PAIRS) {
    if (!vars[fg] || !vars[bg]) continue; // skip if token absent in this theme

    const ratio = contrastRatio(vars[fg], vars[bg]);
    if (ratio < threshold) {
      failures[severity].push({ fg, bg, ratio, threshold, fgVal: vars[fg], bgVal: vars[bg] });
    }
  }

  return failures;
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

  console.log('WCAG AA Contrast Checker\n');

  let totalErrors = 0;
  let totalWarns = 0;

  for (const file of files) {
    const { error: errors, warn: warns } = checkFile(file);
    const hasIssues = errors.length > 0 || warns.length > 0;

    const label = file.replace('.css', '');
    if (!hasIssues) {
      console.log(`ok  ${label}`);
      continue;
    }

    console.log(`-- ${label} -----------------`);
    for (const { fg, bg, ratio, threshold, fgVal, bgVal } of errors) {
      console.log(`  ERROR  --${fg} (${fgVal}) on --${bg} (${bgVal}): ${ratio.toFixed(2)}:1  (required >=${threshold})`);
      totalErrors++;
    }
    for (const { fg, bg, ratio, threshold, fgVal, bgVal } of warns) {
      console.log(`  WARN   --${fg} (${fgVal}) on --${bg} (${bgVal}): ${ratio.toFixed(2)}:1  (required >=${threshold})`);
      totalWarns++;
    }
    console.log('');
  }

  console.log(`\nSummary: ${totalErrors} error(s), ${totalWarns} warning(s)`);

  if (totalErrors > 0) {
    console.log('\nWCAG AA violations on primary surfaces. Fix before shipping.');
    process.exit(1);
  }

  if (totalWarns > 0) {
    console.log('\nWarnings on secondary surfaces (build passes, review recommended).');
  } else {
    console.log('\nAll contrast checks passed.');
  }
}

main();
