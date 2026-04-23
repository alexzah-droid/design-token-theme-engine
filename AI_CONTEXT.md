

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

CSS selectors:
- light → [data-theme="name"]
- dark  → [data-theme="name"][data-mode="dark"]

Run via:
- npm run build
- npm run validate

---

### 6. Preview
Location: /preview

- visual testing environment
- contains primitives:
  - button
  - card
  - input
  - text

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

---

## 🆕 Recent Changes

Latest updates:

- base color tokens were normalized
- `color.text` was renamed to `color.textPrimary`
- deprecated color tokens were removed from `base.json`
- semantic references were aligned with normalized base tokens
- `corporate.json` and `apple.json` were updated to use `textPrimary`
- Apple-specific style overrides were converted from hardcoded HEX to CSS variables
- button state tokens were added:
  - `button.hoverBg`
  - `button.disabledBg`
  - `button.disabledText`
- preview now includes:
  - theme switcher
  - button states
  - corporate, minimal, and apple themes
- build diagnostics were removed after verification

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

### Stage 1 — Minimum App Kit (CURRENT PRIORITY)

Goal: enough to assemble a real-looking business page

Add:

- label
- select (native)
- table (thead, tbody, th, td, tr)
- badge (status variants: success / warning / error / neutral)

Also:

- Rebuild preview as a realistic demo page (not a component gallery)
- Demo must look like an actual application screen

Rules:

- use existing tokens only
- no hardcoded values
- no theme-specific CSS
- every component tested in all themes + light/dark

---

### Stage 2 — Page Structure

Goal: make a page feel like a complete product, not a set of fragments

Add:

- header / navbar
- page layout (content area, sidebar option)

---

### Stage 3 — Form Completeness

Goal: support all common form patterns

Add:

- checkbox
- radio
- textarea
- alert / notification

Also:

- pagination

---

### Stage 4 — Embed Story (GAS integration)

Goal: connect theme engine to a real GAS project with minimal steps

Deliverables:

- usage guide: what HTML to write, where to put CSS
- GAS HTML Service integration example
- single-file embed (one CSS per theme)

---

### Stage 5 — Validate on Invoice_mngmnt

Goal: proof of concept on a real product

Connect theme engine to Invoice_mngmnt:

- invoice list (data table + status badges)
- filters panel (select + label + button)
- action toolbar

This stage validates that the token system and components
hold up under real product requirements.

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
