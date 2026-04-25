# Theme Engine

Token-based theme engine. Generates scoped CSS custom properties from JSON design tokens. Supports multiple themes and light/dark modes. Zero runtime dependencies — pure HTML/CSS/JS.

---

## Architecture

3-layer token model:

```
tokens/base.json        — primitive values (colors, spacing, typography, shadow)
tokens/semantic.json    — semantic mappings via {group.key} reference syntax
themes/{name}.json      — overrides of primitive tokens only
themes/{name}.dark.json — dark-mode overrides (separate file)
```

Theme switching: `data-theme` and `data-mode` attributes on the root HTML element.

---

## Commands

Run from `theme-engine/`:

```bash
npm run build     # generate dist/ CSS files + bundle files
npm run validate  # check architectural invariants (7 checks)
```

Preview: open `preview/index.html` in a browser.

---

## Build Output

`npm run build` generates two sets of files in `dist/`:

**Theme CSS** — scoped token variables:

| File | Selector |
|------|----------|
| `corporate.css` | `[data-theme="corporate"]` |
| `corporate.dark.css` | `[data-theme="corporate"][data-mode="dark"]` |
| `apple.css` | `[data-theme="apple"]` |
| `apple.dark.css` | `[data-theme="apple"][data-mode="dark"]` |
| `minimal.css` | `[data-theme="minimal"]` |

**Bundle CSS** — tokens + component styles in one file (for GAS embed or single-file use):

| File | Theme | Mode |
|------|-------|------|
| `corporate.bundle.css` | Corporate | Light |
| `corporate.dark.bundle.css` | Corporate | Dark |
| `apple.bundle.css` | Apple | Light |
| `apple.dark.bundle.css` | Apple | Dark |
| `minimal.bundle.css` | Minimal | Light |

Bundles are auto-generated — do not edit manually.

---

## Themes

| Theme | Description |
|-------|-------------|
| `corporate` | Business, restrained (+ dark mode) |
| `apple` | Neutral, HIG-inspired (+ dark mode) |
| `minimal` | Clean, minimal (light only) |

---

## Components

`styles/components.css` — component styles using only semantic CSS variables. No hardcoded values.

Available component classes: `.button`, `.card`, `.input`, `.select`, `.textarea`, `.label`, `.text`, `.text-secondary`, `.heading`, `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`, `.nav`, `.nav-brand`, `.nav-actions`, `.page-layout`, `.page-sidebar`, `.page-content`, `.sidebar-link`, `.sidebar-link--active`, `.table`, `.checkbox`, `.checkbox-label`, `.radio`, `.radio-label`, `.alert`, `.alert-success`, `.alert-warning`, `.alert-error`, `.alert-info`, `.pagination`, `.pagination-item`, `.pagination-item--active`, `.pagination-item--disabled`.

---

## Preview

`preview/index.html` — component explorer with theme/mode switchers.

Sections:
- **01 Foundations** — color token swatches + typography scale
- **02 Components** — all components with all variants and states
- **03 Live Demo** — Invoice Manager application

---

## GAS Embed

Use bundle files to embed the design system in Google Apps Script HTML Service.

Quick start:
1. Run `npm run build`
2. Copy `dist/corporate.bundle.css` into `Styles.html` in your GAS project
3. Use `<?!= include('Styles'); ?>` in your HTML template

See `gas-example/` for a working example and `GAS_GUIDE.md` for full instructions.

---

## Contracts (Validator)

`npm run validate` checks 7 invariants — all must pass:

1. No hardcoded HEX/rgb/rgba/hsl in `styles/components.css`
2. No base tokens used directly in components (only semantic tokens)
3. Semantic tokens reference only existing base token groups
4. Theme files override only base tokens
5. Dark themes add no new token names
6. Build output contains required CSS variables
7. Component styles use only semantic CSS variables
