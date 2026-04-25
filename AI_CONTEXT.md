

# Theme Engine — AI Context (v2)

## 🎯 Purpose

This project is a Theme Engine.

It is NOT a UI component library.

It is used to:
- define design tokens (source of truth)
- define themes as overrides
- generate CSS variables
- support runtime theme switching
- be embedded into different projects (GAS, web, etc.)

---

## 🧩 Architecture

### 1. Base Tokens (primitive)
Location: /tokens/base.json

- raw design values
- colors, spacing, radius, typography

Example:
- color.primary
- spacing.md

---

### 2. Semantic Tokens
Location: /tokens/semantic.json

- define meaning
- reference base tokens ONLY

Example:
- button.bg → {color.primary}
- button.text → {color.onPrimary}

---

### 3. Themes
Location: /themes

- contain ONLY overrides
- override base tokens
- DO NOT contain semantic tokens

Example:
- apple.json
- corporate.json

---

### 4. Styles
Location: /styles/components.css

- define visual implementation
- use ONLY CSS variables (var(--...))
- contain:
  - base styles
  - theme overrides (small %)

---

### 5. Build System
Location: /build/build-theme.js

Responsibilities:
- merge base + theme (+ dark overrides when applicable)
- resolve semantic tokens
- generate CSS variables
- generate bundle files (tokens + components in one file, for GAS embed)

CSS selectors:
- light → [data-theme="name"]
- dark  → [data-theme="name"][data-mode="dark"]

Run via:
- npm run build
- npm run validate

**Bundle output** (`*.bundle.css`):
Each bundle = theme CSS variables + `styles/components.css` concatenated into a single self-contained file. Bundles are auto-generated — do not edit manually. Used for GAS HTML Service integration where external CSS links are not available.

---

### 6. Preview
Location: /preview/index.html

Component explorer with theme and mode switchers. Sections:
- **01 Foundations** — color token swatches (live, react to theme switch) + typography scale
- **02 Components** — all components with all variants and states catalogued in themed cards
- **03 Live Demo** — Invoice Manager application in a framed container

CSS loading: one theme file loaded at a time (dynamic injection), no multi-theme collisions.

### 7. GAS Embed
Location: /gas-example/, GAS_GUIDE.md

Integration with Google Apps Script HTML Service.
GAS cannot load external CSS via `<link>` — styles must be inlined or included via `include()` pattern.

Bundle files solve this: copy `dist/corporate.bundle.css` into `Styles.html` in your GAS project.

Files:
- `gas-example/Code.gs` — `doGet()` + `include()` helper
- `gas-example/Page.html` — Invoice Manager template using `<?!= include('Styles'); ?>`
- `gas-example/Styles.html` — placeholder, paste bundle contents here
- `GAS_GUIDE.md` — 4-step usage guide

---

## 🌗 Modes (Light / Dark)

Modes represent a second dimension of theming.

---

### Concept

Theme ≠ Mode

- Theme = brand/style (apple, corporate)
- Mode = lighting context (light, dark)

---

### Structure

Modes are per-theme. Each theme declares which modes it supports
by the presence of a corresponding file:

/themes
- apple.json           (light — default values)
- apple.dark.json      (dark overrides only)
- corporate.json
- corporate.dark.json
- minimal.json         (single mode — no dark file)

A theme with no .dark.json supports only one mode.
No manifest or metadata needed — file presence is the declaration.

---

### How it works

Final tokens are built as:

base → theme → mode

Mode is applied LAST and overrides base values.

---

### Rules

- Modes MUST override only base tokens
- Modes MUST NOT contain semantic tokens
- Modes MUST NOT introduce new token names
- Modes MUST use the same token structure as base.json

---

### Example

base:
{
  "color": {
    "background": "#ffffff",
    "textPrimary": "#1f1f1f"
  }
}

dark mode:
{
  "color": {
    "background": "#000000",
    "textPrimary": "#ffffff"
  }
}

---

### Key Principle

Modes change VALUES, not MEANING.

Semantic tokens remain unchanged.

---

### CSS Strategy

Theme and mode generate a combined CSS selector per variant:

```css
[data-theme="apple"]                   { ... }  /* light */
[data-theme="apple"][data-mode="dark"] { ... }  /* dark */
[data-theme="corporate"]                   { ... }
[data-theme="corporate"][data-mode="dark"] { ... }
[data-theme="minimal"]                     { ... }  /* single mode */
```

Applied via two attributes on the root element:

```html
<html data-theme="apple" data-mode="dark">
```

Dark variant overrides only mode-sensitive tokens:
background, surface, textPrimary, textSecondary.
Brand tokens (primary, radius, spacing, typography) are set by the theme.

---

### Implementation

buildTheme(themeName, modeName?)

If modeName is provided and theme.dark.json exists:

Merge order:
1. base
2. theme (themeName.json)
3. dark overrides (themeName.dark.json)

Output: themeName.dark.css
CSS selector: [data-theme="name"][data-mode="dark"] { ... }

If no modeName — builds light variant only:

Merge order:
1. base
2. theme (themeName.json)

Output: themeName.css
CSS selector: [data-theme="name"] { ... }

Dark variants are auto-detected: any *.dark.json file in /themes
triggers a dark build automatically.

Themes with dark mode:
- apple (apple.json + apple.dark.json)
- corporate (corporate.json + corporate.dark.json)

Themes without dark mode:
- minimal (single mode only)

---

### Important

Dark mode is NOT color inversion.

It requires proper surface hierarchy and contrast adjustments.

---

## 🔗 Data Flow

Light: base → theme → semantic resolve → CSS → styles → UI
Dark:  base → theme → dark overrides → semantic resolve → CSS → styles → UI

---

## 🎨 Token Model

We use 3 levels:

1. Primitive tokens (base)
2. Semantic tokens (meaning)
3. Theme overrides (values)

---

## ⚠️ Critical Rules

❌ DO NOT:
- hardcode colors in CSS
- bypass tokens
- duplicate base tokens in themes
- put logic into styles

✅ ALWAYS:
- use semantic tokens in styles
- use base tokens in themes
- keep themes minimal
- keep components style-agnostic

---

## ➕ How to Add a Component

Follow these steps exactly. All steps are required.

### 1. Define semantic tokens

Add a new group to `tokens/semantic.json`:

```json
"myComponent": {
  "bg": "{color.surface}",
  "text": "{color.textPrimary}",
  "border": "{color.border}"
}
```

Rules:
- Reference only existing base token groups: `color`, `spacing`, `radius`, `typography`, `shadow`
- Do not hardcode values
- Group name becomes CSS variable prefix: `myComponent.bg` → `--my-component-bg`

### 2. Add component CSS

Add to `styles/components.css`:

```css
.my-component {
  background: var(--my-component-bg);
  color: var(--my-component-text);
  border: 1px solid var(--my-component-border);
}
```

Rules:
- Only `var(--semantic-token)` — no hardcoded values, no HEX, no base tokens directly
- No theme-specific rules

### 3. Add to preview

In `preview/index.html`, Section 02 Components — add a new `.card` group:

```html
<div class="card">
  <p class="pv-group-label">My Component</p>
  <div class="pv-row">
    <!-- all variants and states here -->
  </div>
</div>
```

### 4. Run validate

```bash
cd theme-engine && npm run validate
```

All 7 checks must pass.

### 5. Update TOKEN_REFERENCE.md

Add new component section to `theme-engine/TOKEN_REFERENCE.md`.

### Definition of Done

- [ ] Semantic tokens added to `semantic.json`
- [ ] CSS added to `components.css` — only `var()`, no hardcoded values
- [ ] Component shown in preview Section 02 with all variants and states
- [ ] `npm run validate` passes 7/7
- [ ] `TOKEN_REFERENCE.md` updated

---

## 🎨 How to Add a Theme

### 1. Create theme file

Create `themes/{name}.json`. Override only base token groups:

```json
{
  "color": {
    "primary": "#...",
    "primaryHover": "#...",
    "onPrimary": "#ffffff",
    "background": "#...",
    "surface": "#...",
    "border": "#..."
  },
  "typography": {
    "fontFamily": "..."
  }
}
```

Rules:
- Only keys from `tokens/base.json` — no new keys
- Allowed groups: `color`, `spacing`, `radius`, `typography`, `shadow`
- You don't have to override everything — only what differs from base

### 2. Add dark mode (optional)

Create `themes/{name}.dark.json`:

```json
{
  "color": {
    "background": "#...",
    "surface": "#...",
    "textPrimary": "#...",
    "textSecondary": "#..."
  }
}
```

Rules:
- Must use same token names as base.json — no new keys
- Override only mode-sensitive tokens (backgrounds, surfaces, text colors)
- Brand tokens (primary color, radius, typography) are set by the theme, not the mode

### 3. Build

```bash
cd theme-engine && npm run build
```

New theme CSS is auto-generated in `dist/`. Dark variant is auto-detected if `.dark.json` exists.

### 4. Add to preview

In `preview/index.html`:
- Add theme button in the sticky header switcher
- Add theme to `themesWithDark` array in JS if it has a dark variant
- Update `applyTheme()` if needed

### 5. Run validate

```bash
npm run validate
```

All 7 checks must pass.

### Definition of Done

- [ ] `themes/{name}.json` created — only base token overrides
- [ ] `themes/{name}.dark.json` created (if dark supported)
- [ ] `npm run build` completes without errors
- [ ] `npm run validate` passes 7/7
- [ ] Preview header updated with new theme button

---

## 🎯 Contrast System

We use semantic contrast tokens:

- color.primary → background
- color.onPrimary → text on primary

Example:
button.bg → {color.primary}  
button.text → {color.onPrimary}

---

## 🧪 Current State

Implemented:

- base tokens
- semantic tokens
- corporate theme (real data)
- minimal theme
- apple theme (enhanced)
- theme switching (preview)
- theme overrides (styles)
- contrast system (onPrimary)
- dark mode: apple + corporate (per-theme .dark.json)
- mode switching in preview (light / dark toggle)
- Stage 1: label, select, table, badge (4 variants)
- Stage 2: nav, nav-brand, nav-actions, page-layout, page-sidebar, page-content, sidebar-link
- Stage 3: textarea, checkbox, radio, alert (4 variants), pagination
- Preview redesign: component explorer (Foundations / Components / Live Demo sections), dynamic CSS loading
- Stage 4 (GAS embed): bundle generation (`*.bundle.css`), gas-example/, GAS_GUIDE.md

---

## 🆕 Recent Changes

Latest updates (Stages 1–4):

- Added components: label, select, table, badge, nav, page-layout, sidebar, textarea, checkbox, radio, alert, pagination
- Preview redesigned from app demo into component explorer — sticky header, anchor nav, Foundations / Components / Live Demo sections, dynamic single-theme CSS loading
- `build-theme.js`: added `buildBundle()` — generates `*.bundle.css` (tokens + components in one file)
- GAS embed story: `gas-example/` (Code.gs, Page.html, Styles.html) + `GAS_GUIDE.md`
- Validator fixed: no longer crashes on `.DS_Store` files
- `.gitignore`: added `!theme-engine/build/` exclusion

---

## 🧪 Tests

Current checks and verification flow:

- Build themes:
  - `node theme-engine/build/build-theme.js`
- Validate architecture:
  - `node theme-engine/build/validate.js`

Validator currently checks:

- no hardcoded HEX/rgb/rgba/hsl colors in `styles/components.css`
- no direct base token vars (--color-*, --spacing-*) in `styles/components.css`
- semantic tokens reference only base token groups
- all semantic references resolve to existing base tokens
- themes contain only base overrides (allowlist: color, spacing, radius, typography, shadow)
- dark themes contain only base overrides and no new token names
- dist files contain required CSS variables

Manual preview checks:

- open `preview/index.html`
- switch between `corporate`, `minimal`, and `apple`
- verify button states:
  - default
  - disabled
  - simulated hover

Expected outputs:

- generated CSS files in `/dist`
- scoped theme selectors:
  - `[data-theme="corporate"]`
  - `[data-theme="minimal"]`
  - `[data-theme="apple"]`

---

## 🚧 Roadmap

### Goal

Build a kit of UI components that can be assembled into mature,
reliable GAS web applications with minimal effort.

Priority is ordered by business value — what makes a page
look and work like a real product — not by component complexity.

---

### Stage 1 — Minimum App Kit ✅ Done

Added: label, select, table, badge (4 variants). Preview rebuilt as Invoice Manager demo.

---

### Stage 2 — Page Structure ✅ Done

Added: nav, nav-brand, nav-actions, page-layout, page-sidebar, page-content, sidebar-link.

---

### Stage 3 — Form Completeness ✅ Done

Added: checkbox, radio, textarea, alert (4 variants), pagination.

---

### Stage 4 — Preview Redesign ✅ Done

Preview rebuilt as component explorer: sticky header with switchers, sections Foundations / Components / Live Demo, dynamic single-theme CSS loading.

---

### Stage 4b — GAS Embed Story ✅ Done

Bundle generation (`*.bundle.css`), `gas-example/` with working Code.gs + Page.html + Styles.html, `GAS_GUIDE.md`.

---

### Stage 5 — Validate on Invoice_mngmnt

Goal: proof of concept on a real product.

Connect theme engine to Invoice_mngmnt:
- invoice list (data table + status badges)
- filters panel (select + label + button)
- action toolbar

Validates that token system and components hold up under real product requirements.

---

### Stage 6a — Token System Expansion + A11y Foundation ✅ Done

Extended token system with patterns missing from original system (identified from Invoice_mngmnt/ztz-ui-kit-v4 reference):
- **Motion tokens** in `tokens/base.json`: `motion.dur1..4`, `motion.easeOut`, `motion.easeInOut`
- **Animation semantic tokens**: `animation.durationFast/Normal/Slow`, `animation.easeOut/easeInOut`
- **Surface hierarchy**: `color.surface2/3` in base + `surface.bg/bg2/bg3` semantic tokens
- **Text muted**: `color.textMuted` + `text.muted` semantic token
- **Status soft variants**: `color.successSoft/warnSoft/errorSoft/infoSoft` + `status.*Soft` semantic tokens
- **Chart palette**: `color.chart1..6`, `color.chartHeat` + `chart.*` semantic tokens (7 tokens)
- **Focus ring**: `color.focusRing` (theme-overridable via color group) + `focus.ring` semantic token
- All themes updated with brand-specific values for new tokens
- **components.css**: skip link (a11y), surface utilities, text-muted utility, transitions on interactive elements, `prefers-reduced-motion` support

---

### Stage 6b — New Components ✅ Done

Added: Switch/Toggle, Tabs, Accordion, Custom Dropdown, Progress bars (linear/circular/indeterminate).
Semantic tokens defined for all 5 components. CSS in `styles/components.css`. Preview cards with interactive demos (accordion toggle, dropdown select). TOKEN_REFERENCE.md updated.

---

### Stage 6c — Data Display Enhancements ✅ Done

Added: Typography scale classes (`.t-display`, `.t-h1..3`, `.t-lead`, `.t-small`, `.t-overline`, `.t-mono`), KPI cards (`.kpi`, `.kpi-value`, `.kpi-delta--up/down`), filter chips (`.chip`, `.chip--active`), sortable table headers (`aria-sort`, `.table-sort-icon`), table empty state (`.table-empty`).
New base tokens: `fontSizeDisplay/H1/H2/H3/Lead/KpiValue`. Semantic groups: `typeScale`, `chip`, `kpi`.

---

### Stage 7 — Charts Subsystem (planned)

To add: Area, Bar (stacked), Multi-line, Donut, Sparkline SVG charts; Heatmap; full Gantt diagram.
All chart components use `--chart-color1..6` and `--chart-heat` semantic tokens.
Validator update needed: allow `rgba(var(...))` pattern in components.css.

---

### Stage 8 — Developer UX in Preview (planned)

To add: Static component states (`.is-hover`, `.is-focus`, `.is-selected`, `.is-disabled`),
viewport simulator in preview, CSS grid layout utilities (`.row`, `.grid-2/3/4/6`).

---

## ⚠️ Expansion Rules

All new UI elements must follow:

1. No hardcoded values in CSS
2. Use semantic tokens only
3. No theme-specific component rules
4. Every new component added to the demo preview
5. Every new component passes validator
6. Every new component tested in all themes and both modes

---

## 📌 Definition of Done (per component)

Each component is complete only if:

- added to demo preview
- uses only CSS variables (semantic layer)
- works across all themes (corporate, minimal, apple)
- works in light and dark mode where applicable
- passes validator

---

## 🧠 Philosophy

Components ≠ Styles ≠ Theme

- Components = structure + logic
- Styles = implementation
- Theme = configuration

---

---

## 📂 Document Map

### Architectural files (read before coding)

| File | Purpose |
|------|---------|
| [`AI_CONTEXT.md`](../AI_CONTEXT.md) | **This file.** Architectural source of truth — token model, component contracts, stages, roadmap |
| [`CLAUDE.md`](../CLAUDE.md) | Agent operating instructions — autonomy rules, commands, subagent delegation |
| [`manifest.md`](../manifest.md) | Project metadata: `project_name`, `repo_access` |

### Design system docs

| File | Purpose |
|------|---------|
| [`theme-engine/README.md`](theme-engine/README.md) | Theme engine overview: architecture, build output (CSS + bundles), component class list, validator contracts |
| [`theme-engine/GAS_GUIDE.md`](theme-engine/GAS_GUIDE.md) | GAS HTML Service integration: 4-step guide, bundle usage, sidebar/web app deploy |
| [`theme-engine/USAGE.md`](theme-engine/USAGE.md) | ⚠️ Outdated general usage guide (pre-bundles, pre-dark-mode). Superseded by `README.md` and `GAS_GUIDE.md` |

### Review history

| File | Purpose |
|------|---------|
| [`REVIEW-01.md`](../REVIEW-01.md) | Architecture review session 1 — 6 critical issues found and fixed |
| [`REVIEW-02.md`](../REVIEW-02.md) | Architecture review session 2 — confirmed fixes, 7 medium/low issues logged |

### Agent operational memory

| File | Purpose |
|------|---------|
| [`.claude/SNAPSHOT.md`](.claude/SNAPSHOT.md) | Current project state: what's done, in progress, known issues, next steps |
| [`.claude/rules/`](.claude/rules/) | Operational rules loaded every session: autonomy, commit policy, delegation, logging |
| [`.claude/skills/`](.claude/skills/) | Skill definitions: `/start`, `/finish`, `/testing`, `/housekeeping` |
| [`.claude/agents/`](.claude/agents/) | Subagent role definitions: researcher, implementer, reviewer |

### Reference (not part of this design system)

| File | Purpose |
|------|---------|
| [`Invoice_mngmnt/README.md`](../Invoice_mngmnt/README.md) | ЗТЗ UI Kit — separate system, used as reference/inspiration for preview quality bar |
| [`README.md`](../README.md) | Claude Code Starter v5 framework documentation |

---

## 🗂️ Task → File Index

Which files to read for a given task:

| Task | Files to read |
|------|--------------|
| Add a new component | `AI_CONTEXT.md` (Expansion Rules, DoD) → `tokens/semantic.json` → `styles/components.css` → `preview/index.html` → run `validate` |
| Add a new theme | `AI_CONTEXT.md` (Architecture §3 Themes) → `tokens/base.json` → `themes/` existing files as reference |
| Add dark mode to a theme | `AI_CONTEXT.md` (Modes section) → existing `*.dark.json` as reference → `tokens/base.json` (which tokens to override) |
| GAS integration | `GAS_GUIDE.md` → `gas-example/` → run `npm run build` to get bundles |
| Understand token model | `AI_CONTEXT.md` → `tokens/base.json` → `tokens/semantic.json` → `dist/corporate.css` (resolved output) |
| Debug component styling | `AI_CONTEXT.md` (Critical Rules) → `styles/components.css` → `dist/{theme}.css` (check resolved vars) |
| Debug preview | `preview/index.html` → `styles/components.css` → `dist/` |
| Run build / validate | `theme-engine/README.md` (Commands section) |
| Understand project state | `.claude/SNAPSHOT.md` → `git log --oneline -10` |
| Code review | `AI_CONTEXT.md` (Contracts, Expansion Rules) → `REVIEW-01.md`, `REVIEW-02.md` (precedents) |
| Session start/finish | `CLAUDE.md` → `.claude/SNAPSHOT.md` |

---

---

## 🗺️ Development Backlog

Ordered by impact. Items below are gaps identified during documentation audit (2026-04-25).

### High priority

**DOC-1. Update `theme-engine/USAGE.md`** ✅ Done
File is outdated — describes multi-link CSS approach, no dark mode, no bundles, no components. AI agents reading it will make wrong decisions.
Action: replace content with redirect to `README.md` and `GAS_GUIDE.md`, or delete.

**DOC-2. Token reference table** ✅ Done
No document lists all semantic tokens with: token name → component → resolved value (corporate default).
Currently an agent must cross-read `components.css` + `dist/corporate.css` to understand what `--alert-info-border` does.
Action: generate `theme-engine/TOKEN_REFERENCE.md` — table of all semantic tokens.

**DEV-1. "How to add a component" guide** ✅ Done
Process (add tokens to `semantic.json` → CSS to `components.css` → preview in `index.html` → run validator) is nowhere documented. Agents guess by analogy.
Action: add concise step-by-step section to `AI_CONTEXT.md` or separate `CONTRIBUTING.md`.

**DEV-2. "How to add a theme" guide** ✅ Done
Which keys are required in `themes/name.json`, what must be in `.dark.json`, how to verify a new theme.
Action: add section to `AI_CONTEXT.md`.

### Medium priority

**DOC-3. Design system CHANGELOG**
`CHANGELOG.md` in root is the Claude Code Starter framework log, not this design system.
Token changes, new components, design decisions — none of this is tracked in a dedicated file.
Action: create `theme-engine/CHANGELOG.md`.

**DOC-4. Archive or convert REVIEW-01.md / REVIEW-02.md**
Review files sit in root but are disconnected from any current process.
Action: move to `archive/` or consolidate known issues into `KNOWN_ISSUES.md`.

**DEV-3. Stage 5 definition of done**
Roadmap says "Validate on Invoice_mngmnt" but does not define what success looks like.
Action: write concrete acceptance criteria before starting Stage 5.

### Lower priority

**DEV-4. A11y baseline document**
No documented expectations: contrast ratio (WCAG AA?), `aria-*` requirements, focus ring behavior.
Agents adding new components don't know the bar.
Action: add "Accessibility baseline" section to `AI_CONTEXT.md`.

**DEV-5. GAS bundle size limits**
Bundles grow as tokens and components are added. GAS HTML Service has output size limits.
No monitoring in place.
Action: add bundle size check to `validate.js` or document the GAS limit as a constraint.

**DEV-6. Static hover/focus states in preview**
Preview tells users "hover to see hover state" — states can't be inspected statically.
Action: add CSS utility class `.is-hover` / `.is-focus` to demonstrate states without interaction.

**DEV-7. Charts validator exception**
`rgba(var(--chart-heat), var(--v))` is a valid CSS pattern (variable as RGB channel) but currently fails `checkNoHardcodedColors()` in `validate.js`.
Action: update validator regex to allow `rgba(var(...))` pattern before implementing chart components (Stage 7).

---

## 📌 Important

This file must be read BEFORE any code changes.

All new code must follow this architecture strictly.
