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
npm run wcag      # check WCAG AA contrast and design integrity across all themes
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

**Base:** `.button`, `.card`, `.input`, `.select`, `.textarea`, `.label`, `.text`, `.text-secondary`, `.text-muted`, `.heading`, `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`, `.nav`, `.nav-brand`, `.nav-actions`, `.page-layout`, `.page-sidebar`, `.page-content`, `.sidebar-link`, `.sidebar-link--active`, `.table`, `.checkbox`, `.checkbox-label`, `.radio`, `.radio-label`, `.alert`, `.alert-success`, `.alert-warning`, `.alert-error`, `.alert-info`, `.pagination`, `.pagination-item`, `.pagination-item--active`, `.pagination-item--disabled`

**Interactive:** `.switch`, `.switch-track`, `.switch-thumb`, `.tabs`, `.tab`, `.tab--active`, `.accordion`, `.accordion-item`, `.accordion-item--open`, `.accordion-head`, `.accordion-body`, `.dropdown`, `.dropdown-head`, `.dropdown-list`, `.dropdown-item`, `.dropdown-item--selected`, `.dropdown--open`

**Progress:** `.progress`, `.progress-fill`, `.progress--indeterminate`, `.progress-circle`, `.progress-circle-track`, `.progress-circle-fill`

**Data display:** `.kpi`, `.kpi-label`, `.kpi-value`, `.kpi-delta`, `.kpi-delta--up`, `.kpi-delta--down`, `.chips`, `.chip`, `.chip--active`, `.table-sortable`, `.table-sort-icon`, `.table-empty`, `.table-empty-text`, `.table-empty-hint`, `.table-row-expandable`, `.table-row-expandable--open`, `.table-expand-cell`, `.table-expand-icon`, `.table-row-expand`, `.table-row-expand-body`

**Typography scale:** `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-small`, `.t-overline`, `.t-mono`

**Charts:** `.chart-card`, `.chart-title`, `.chart-svg`, `.chart-legend`, `.chart-legend-item`, `.chart-legend-dot`, `.sparkline`, `.sparkline-line`, `.sparkline-area`, `.sparkline-dot`, `.area-chart-line`, `.bar-chart-bar`, `.donut-chart`, `.donut-segment`, `.donut-label`, `.donut-sublabel`, `.donut-legend`, `.heatmap`, `.heatmap-cell`, `.heatmap-label`, `.gantt`, `.gantt-header`, `.gantt-header-cell`, `.gantt-row`, `.gantt-row-label`, `.gantt-track`, `.gantt-bar`, `.gantt-bar--1..6`

**Static states:** `.is-hover`, `.is-focus`, `.is-disabled`, `.is-selected` — apply to button, input, select, textarea, tab, chip, dropdown-item, pagination-item

**Layout utilities:** `.row` (flex wrap), `.grid-2`, `.grid-3`, `.grid-4`, `.grid-6` (CSS grid columns)

**Date Picker:** `.datepicker`, `.datepicker-header`, `.datepicker-title`, `.datepicker-nav`, `.datepicker-grid`, `.datepicker-weekday`, `.datepicker-day`, `.datepicker-day--today`, `.datepicker-day--selected`, `.datepicker-day--disabled`, `.datepicker-day--empty`

**Utilities:** `.surface-2`, `.surface-3` (surface hierarchy), `.skip-link` (a11y)

---

## Preview

`preview/index.html` — component explorer with theme/mode switchers.

Sections:
- **01 Foundations** — color token swatches (including surface hierarchy, soft-status, chart palette), typography scale, motion tokens with live demo
- **02 Components** — all components with all variants and states; A11y & Utilities card (skip-link, surface-2/3, prefers-reduced-motion)
- **03 Live Demo** — Invoice Manager application
- **04 Charts** — Sparkline, Area, Bar, Stacked Bar, Donut, Heatmap, Gantt demos
- **05 Dev UX** — Static states demo + Grid utilities demo

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

## WCAG AA Checker

`npm run wcag` (`build/check-wcag.js`) reads all `dist/*.css` files automatically — no configuration needed when adding new themes.

**Contrast pairs (4.5:1):** text-primary/secondary/muted/heading/label on page-bg and card-bg; input, select, button (default + hover), nav, badge ×4, alert ×4, pagination-active, chip-active, tab-active, table-header. Secondary surfaces (surface-bg2/3) checked as `warn`.

**Design integrity:** text hierarchy (primary > secondary > muted by contrast ratio); radius monotonicity (sm ≤ md ≤ lg).

**Severity:** `error` → exits with code 1, blocks shipping. `warn` → build passes, review recommended.

**Extending:** add a row to `PAIRS` in `build/check-wcag.js` to check new token pairs.
