

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

## 📌 Important

This file must be read BEFORE any code changes.

All new code must follow this architecture strictly.
