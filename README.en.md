English | [Русский](README.md)

# Design System Engine

Token-based CSS theme engine: edit one JSON file, rebuild, and the entire UI updates.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Validator](https://img.shields.io/badge/validator-7%2F7-brightgreen)]()
[![Zero deps](https://img.shields.io/badge/dependencies-zero-brightgreen)]()

## What It Is

- Generates scoped CSS custom properties from JSON design tokens
- 3 themes (corporate, apple, minimal) with dark mode support
- 60+ ready-to-use CSS component classes with zero framework dependencies
- Built-in validator enforces 7 architectural invariants on every build
- WCAG AA checker automatically verifies contrast ratios across all themes on every token change

Built for: admin panels, internal tools, white-label products, Google Apps Script applications.

## Quick Start

**Step 1.** Download a pre-built CSS file from `theme-engine/dist/`:

```
corporate.bundle.css      — Corporate theme (tokens + components in one file)
apple.bundle.css          — Apple HIG-inspired theme
minimal.bundle.css        — Minimal theme
corporate.dark.bundle.css — Corporate, dark mode
```

**Step 2.** Link the file in your HTML:

```html
<link rel="stylesheet" href="corporate.bundle.css">
```

**Step 3.** Set the theme attribute on the root element and use component classes:

```html
<!DOCTYPE html>
<html data-theme="corporate">
<body>

  <button class="button">Save</button>

  <div class="card">
    <p class="heading">Title</p>
    <p class="text">Card content</p>
    <span class="badge badge-success">Active</span>
  </div>

  <table class="table">
    <thead><tr><th>Name</th><th>Status</th></tr></thead>
    <tbody><tr><td>Alice</td><td>Active</td></tr></tbody>
  </table>

</body>
</html>
```

To enable dark mode, add `data-mode="dark"`:

```html
<html data-theme="corporate" data-mode="dark">
```

## Architecture

3-layer token model:

```
tokens/base.json          — primitive values: colors, spacing, typography, shadows
tokens/semantic.json      — semantic mappings via {group.key} reference syntax
themes/{name}.json        — overrides of primitive tokens only
themes/{name}.dark.json   — dark-mode overrides (separate file)
```

How a token travels from JSON to the browser:

```
┌─────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────┐
│  base.json          │────▶│  semantic.json           │────▶│  dist/*.css          │
├─────────────────────┤     ├──────────────────────────┤     ├──────────────────────┤
│ color.primary       │     │ button.bg                │     │ --button-bg:         │
│   "#1a73e8"         │     │   "{color.primary}"      │     │   #1a73e8;           │
│ radius.md           │     │ button.radius            │     │ --button-radius:     │
│   "8px"             │     │   "{radius.md}"          │     │   8px;               │
│ shadow.sm           │     │ button.shadow            │     │ --button-shadow:     │
│   "0 1px 3px…"      │     │   "{shadow.sm}"          │     │   0 1px 3px…;        │
└─────────────────────┘     └──────────────────────────┘     └──────────────────────┘
         ▲
  theme.json overrides
  only this layer
```

To create a new brand, you only need one `theme.json` with the primitive overrides you want — semantics and components stay unchanged.

Theme switching works via `data-theme` and `data-mode` attributes on the root HTML element. Changing an attribute instantly applies a different set of CSS custom properties — no page reload, no JavaScript required.

`npm run build` generates `dist/` from `tokens/` and `themes/` through a pipeline: deepMerge → resolveToken → flattenTokens → emit CSS.

## Who It's For

**Good fit if you:**
- Build plain HTML/CSS interfaces without a bundler — admin panels, internal tools, dashboards
- Use Google Apps Script HTML Service — CDN and npm are unavailable in GAS production
- Need multiple brands or themes on a shared component codebase (white-label)
- Want an architectural contract — the validator prevents developers from accidentally hardcoding a color value into a component

**Not a good fit if you:**
- Already use React, Vue, or another component framework — CSS Modules, CSS-in-JS, or utility classes integrate better there
- Need a utility-first (atomic) CSS model — Tailwind CSS handles that more effectively
- Require SSR or complex CSS tree-shaking

## Themes

| Theme | Description | Dark Mode |
|-------|-------------|:---------:|
| `corporate` | Business, restrained | yes |
| `apple` | Neutral, Apple HIG-inspired | yes |
| `minimal` | Clean, minimal | — |

## Components

60+ classes: buttons, cards, forms, navigation, tables, badges, switches, tabs, accordions, dropdowns, progress bars, KPI tiles, chips, charts (sparkline, area, bar, donut, heatmap, gantt), and typography utilities.

All components use only semantic CSS custom properties — no hardcoded values anywhere. The validator guarantees this.

Full class reference and usage examples: [`theme-engine/README.md`](theme-engine/README.md)

## Google Apps Script

Bundle files are ready to embed in GAS HTML Service — no CDN or npm needed in production:

1. Copy the contents of `dist/corporate.bundle.css` into a `Styles.html` file in your GAS project
2. Include it via `<?!= include('Styles'); ?>` in your HTML template
3. Use component CSS classes in your markup as usual

Full instructions with a working example: [`theme-engine/GAS_GUIDE.md`](theme-engine/GAS_GUIDE.md)

## Development

All commands run from `theme-engine/`:

```bash
npm install       # install build dependencies (dev only)
npm run build     # generate dist/*.css and dist/*.bundle.css
npm run validate  # check 7 architectural invariants
```

Preview components: open `theme-engine/preview/index.html` in a browser.

What the validator checks (7 checks):

1. No hardcoded values (HEX/rgb/hsl) in component styles
2. Components do not use base tokens directly — only semantic tokens
3. Semantic tokens reference only existing base token groups
4. Theme files override only base tokens
5. Dark theme files add no new token names
6. Build output contains required CSS variables
7. Component styles use only semantic CSS custom properties

## License

MIT
