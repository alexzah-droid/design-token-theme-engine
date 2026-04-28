# Changelog

All notable changes to the Design System Engine are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.7.0] — 2026-04-28

### Added
- **Expandable Table Row** — новый компонент: `.table-row-expandable`, `.table-row-expandable--open`, `.table-expand-cell`, `.table-expand-icon`, `.table-row-expand`, `.table-row-expand-body`; анимация max-height по паттерну accordion; только существующие семантические токены; validator 7/7, WCAG 0 errors
- **Preview: Download bundle дропдаун** — кнопка в шапке preview заменена на дропдаун со всеми 5 bundle-файлами; «current» синхронизируется с активной темой/режимом
- **Preview: ↓ CSS на каждом компоненте** — кнопка скачивает `ds2-{component}.css` с `:root {}` блоком (реальные значения из текущей темы через `getComputedStyle`) и HTML-сниппетом в комментарии; 17 компонентов
- **Preview: Copy HTML** — кнопка на 16 компонентных карточках
- **GAS_GUIDE.md / GAS_GUIDE.en.md** — полная переработка: раздел «Подготовка» с таблицей нужных файлов, 2 самодостаточных AI-промпта (одна тема / все темы с переключателем), ручные шаги оставлены ниже
- **Multi-theme switcher** — HTML/JS пример переключателя всех тем с `localStorage`, guard для minimal (no dark mode)

### Fixed
- Expandable Table Row: `border-bottom` на `<td>` скрыт при свёрнутом состоянии (не было пустой рамки)

---

## [0.6.0] — 2026-04-26

### Added
- **WCAG AA checker** (`build/check-wcag.js`, `npm run wcag`) — автоматическая проверка контраста и design integrity всех тем из `dist/`:
  - 30+ контрастных пар: text, heading, label, button (default + hover), input, select, nav, badge ×4, alert ×4, pagination, chip, tab, table header, secondary surfaces
  - Проверка визуальной иерархии текста: text-primary > text-secondary > text-muted
  - Проверка монотонности радиусов: sm ≤ md ≤ lg
  - Severity: `error` (primary surfaces) → exit 1; `warn` (secondary) → build passes
  - Новые темы подхватываются автоматически без изменений в checker

### Fixed
- **WCAG AA — все темы:** `text-muted` и `text-secondary` не проходили 4.5:1 на primary surfaces
  - corporate light: textMuted `#9A9590`→`#6E6B65`; corporate dark: textMuted `#6A7468`→`#8C9489`
  - apple light: textMuted `#A2A2A7`→`#606063`; apple dark: textMuted `#7C7C82`→`#898990`
  - minimal: textSecondary `#8e8e93`→`#636366` (via base.json); textMuted `#b0b0b8`→`#696969`
- **WCAG AA — base colors:** success/error слишком светлые для белого текста в badge и alert
  - `color.success` `#34a853`→`#1e7e34` (3.06:1→5.14:1); `color.error` `#ea4335`→`#d32f2f` (3.92:1→4.98:1)
- **WCAG AA — apple button:** primary `#007aff`→`#0070f0` (4.02:1→4.59:1); primaryHover `#0a84ff`→`#006ee8` (3.65:1→4.78:1)
- **Semantic — tab.activeText:** `{color.primary}`→`{color.textPrimary}` — primary был невидим в corporate dark (1.24:1) и не проходил в apple light (4.11:1); visual active state сохранён через tab.indicatorColor

---

## [0.5.3] — 2026-04-27

### Fixed
- `minimal.json`: `radius` шкала исправлена — sm=0px / md=2px / lg=4px (было только md=2px, sm наследовал 4px из base → иерархия sm > md была сломана)
- `minimal.json`: `focusRing` заменён с синего Google на чёрный `rgba(0,0,0,.25)` — соответствует монохромному primary #000000
- `minimal.json`: chart-палитра заменена с Google-brand цветов на монохромную шкалу (#1a1a1a → #d9d9d9); `chartHeat`/`chartHeatColor` — чёрные
- `minimal.json`: `fontFamily` заменён с `Arial` на `system-ui, -apple-system, sans-serif`

---

## [0.5.2] — 2026-04-27

### Fixed
- `corporate.json`: `radius.lg` 6px → 8px — восстановлена прогрессивная шкала (sm=2 / md=4 / lg=8)
- `validate.js`: удалена избыточная `checkSemantic()` — её функцию полностью покрывает `checkTokenReferences()`
- `validate.js`: `checkBuildOutput()` переписана с хрупкой проверки конкретных имён переменных на структурную (наличие `[data-theme]` селектора + непустой файл)

### Added
- GitHub Pages workflow (`.github/workflows/pages.yml`) — auto-deploy preview на push в main

---

## [0.5.1] — 2026-04-26

### Changed
- `README.md` (RU) и `README.en.md` (EN) — улучшена диаграмма архитектуры (box diagram с рамками и стрелками вместо таблицы); добавлен раздел "Для кого подходит / не подходит"

---

## [0.5.0] — 2026-04-26

### Added
- **Glass effect** — `.glass` utility class with `backdrop-filter: blur(20px) saturate(180%)`. New tokens: `color.glassBg`, `color.glassBorder` in `base.json`; semantic group `glass.bg`/`glass.border`
- **Apple dark glass overrides** — `apple.dark.json` overrides `glassBg: rgba(30,30,32,0.82)`, `glassBorder: rgba(255,255,255,0.12)`
- **Glass demo card** in Preview Foundations section
- **Glass section** in `TOKEN_REFERENCE.md`
- **Pre-built `dist/` CSS** committed to repo — 10 files (themes × light/dark × bundle variants). No `npm install` needed to use the engine.
- **Bilingual docs** — `README.md` (RU), `README.en.md` (EN), `GAS_GUIDE.en.md`, `USAGE.en.md`. Language switcher links in all files.
- **MIT LICENSE**
- **GitHub Pages workflow** — `.github/workflows/pages.yml` auto-publishes preview on push to main

### Changed
- **Apple light theme** (`apple.json`) — iOS HIG 2024 system colors: `background: #F2F2F7`, `surface2: #E5E5EA`, `border: #C6C6CB`, `textSecondary: #6D6D72`, `textMuted: #A2A2A7`. Radius corrected to HIG spec: `sm=6px`, `md=10px`, `lg=16px`. Spacing: `sm=10px`, `md=20px`, `lg=32px`. Multi-layer shadows. Font: `-apple-system, BlinkMacSystemFont`
- **Apple dark theme** (`apple.dark.json`) — shadows enabled (`sm: 0 2px 8px rgba(0,0,0,.5)`, `md: 0 8px 24px rgba(0,0,0,.6)`). Text fixed: `textSecondary: #98989D`, `textMuted: #7C7C82`
- **Animation** (`base.json`) — `motion.easeOut` → Apple Decelerate `cubic-bezier(0,0,0.2,1)`. `dur2: 200ms`, `dur3: 300ms`, `dur4: 400ms`
- **`package.json`** — removed `private: true`, added description, keywords, license. Name: `design-token-theme-engine`
- **`USAGE.md`** — language switcher added; removed `AI_CONTEXT.md` reference (internal file)
- **`GAS_GUIDE.md`** — language switcher added

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
