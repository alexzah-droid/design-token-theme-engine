# Changelog

All notable changes to the Design System Engine are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
