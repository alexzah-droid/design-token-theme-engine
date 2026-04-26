# Changelog

All notable changes to the Design System Engine are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] — 2026-04-26

### Added
- **Static state classes** — `.is-hover`, `.is-focus`, `.is-disabled`, `.is-selected` on button, input, select, textarea, tab, chip, dropdown-item, pagination-item (DEV-6 resolved)
- **CSS grid utilities** — `.row` (flex), `.grid-2`, `.grid-3`, `.grid-4`, `.grid-6` using `var(--page-section-gap)` gap
- **Viewport simulator** in preview — Desktop / Tablet (768px) / Mobile (375px) presets for the Demo frame
- **Preview section 05** — Dev UX: Static States card + Grid Utilities card

---

## [0.3.0] — 2026-04-26

### Added
- **Charts subsystem** — 7 SVG chart components: Sparkline, Area, Bar (grouped), Stacked Bar, Donut, Heatmap, Gantt
- **`color.chartHeatColor`** base token (hex) — proper color value for heatmap intensity via `color-mix()`
- **Semantic chart tokens**: `chart.heatColor`, `chart.grid`, `chart.axis`, `chart.padding`, `chart.gap`, `chart.radius`
- **Heatmap intensity** via `color-mix(in srgb, var(--chart-heat-color) calc(var(--v, 0) * 100%), transparent)` — per-cell `--v` (0..1) inline var
- **Preview section 04** — Charts with 7 demo cards (Gantt spans full width)

### Fixed
- **DEV-7** — Heatmap pattern `rgba(var(--chart-heat), var(--v))` blocked by validator. Resolved via `color-mix()` + proper hex token. No validator changes needed.
- **`.gantt-bar`** — `var(--on-primary)` (undefined) → `var(--button-text)` (valid semantic token)

### Changed
- All themes (`corporate`, `apple`) updated with `color.chartHeatColor` brand value
- `TOKEN_REFERENCE.md` — added `--color-chart-heat-color` to base table; corrected table header; added 7 new chart semantic token rows

---

## [0.2.0] — 2026-04-26

### Added
- **Motion tokens** (`motion.dur1–4`, `motion.easeOut`, `motion.easeInOut`) in `tokens/base.json`
- **Surface hierarchy** tokens: `color.surface2/3`, semantic `surface.bg/bg2/bg3`
- **Text muted** token: `color.textMuted`, semantic `text.muted`, utility class `.text-muted`
- **Soft status variants**: `color.successSoft/warnSoft/errorSoft/infoSoft`, semantic `status.*Soft`
- **Chart palette**: `color.chart1–6`, `color.chartHeat`, semantic `chart.*` (7 tokens)
- **Focus ring token**: `color.focusRing`, semantic `focus.ring`
- **Animation semantic group**: `animation.durationFast/Normal/Slow`, `animation.easeOut/easeInOut`
- **`prefers-reduced-motion`** support in `components.css`
- **Skip link** (`.skip-link`) for accessibility
- **Focus-visible ring** on all interactive components
- **Surface utilities**: `.surface-2`, `.surface-3`
- **Switch/Toggle** component: `.switch`, `.switch-track`, `.switch-thumb` — animated track + thumb
- **Tabs** component: `.tabs`, `.tab`, `.tab--active` — accent underline indicator
- **Accordion** component: `.accordion`, `.accordion-item--open` — max-height animation
- **Dropdown** component: `.dropdown`, `.dropdown-list`, `.dropdown-item` — opacity/translateY animation, keyboard-accessible
- **Progress bars**: linear, indeterminate (`@keyframes`), circular SVG (`stroke-dashoffset`)
- **Typography scale** classes: `.t-display`, `.t-h1–3`, `.t-lead`, `.t-small`, `.t-overline`, `.t-mono`
- **KPI cards**: `.kpi`, `.kpi-value`, `.kpi-delta--up/down`
- **Filter chips**: `.chip`, `.chip--active`, `.chips`
- **Sortable table**: `.table-sortable`, `.table-sort-icon`, `aria-sort` support
- **Table empty state**: `.table-empty`, `.table-empty-text`, `.table-empty-hint`
- All themes (`corporate`, `apple` + darks) updated with brand values for new tokens
- `TOKEN_REFERENCE.md` — 14 new sections documenting all new semantic tokens

### Changed
- `validate.js`: `motion` group added to semantic token allowlist
- Preview redesigned as component explorer (Foundations / Components / Live Demo)
- Preview Section 01: 13 new color swatches, Motion card with live demo, A11y card
- Preview Section 02: 9 new component cards with interactive demos (accordion, dropdown)

---

## [0.1.0] — 2026-04-24

### Added
- 3-layer token model: `tokens/base.json` → `tokens/semantic.json` → `themes/*.json`
- Build pipeline (`build-theme.js`): deepMerge → resolveToken → flattenTokens → CSS
- Bundle generation (`*.bundle.css`) — tokens + components in one file for GAS embed
- Themes: `corporate` (+ dark), `apple` (+ dark), `minimal`
- Validator (`validate.js`) — 7 architectural invariants
- Components: `.button`, `.card`, `.input`, `.select`, `.textarea`, `.label`, `.text`, `.text-secondary`, `.heading`, `.badge` (4 variants), `.nav`, `.page-layout`, `.page-sidebar`, `.page-content`, `.sidebar-link`, `.table`, `.checkbox`, `.radio`, `.alert` (4 variants), `.pagination`
- GAS embed: `gas-example/` (Code.gs, Page.html, Styles.html), `GAS_GUIDE.md`
- Documentation: `AI_CONTEXT.md`, `TOKEN_REFERENCE.md`, `USAGE.md`, `README.md`
