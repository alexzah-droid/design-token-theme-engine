# Theme Engine — Architecture Review #2

Date: 2026-04-24  
Reviewer: Claude (claude-sonnet-4-6)  
Based on: REVIEW-01.md

---

## What Changed Since REVIEW-01

All 6 critical issues are resolved. Validator passes cleanly. Overall maturity moved from **Early prototype** to **Solid prototype**.

---

## Resolved — Full Credit

### ✅ 1. CSS duplicate blocks eliminated

`components.css` went from ~179 lines with 5–6 overlapping Apple theme blocks to 62 lines, clean, no theme-specific overrides. The file is now readable linearly. This was the most important fix.

### ✅ 2. Styles use only semantic tokens

All `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)` references removed from `components.css`. Every property now uses a semantic variable (`--button-*`, `--card-*`, `--page-*`). A new validator check (`checkNoBaseVariablesInStyles`) enforces this going forward.

### ✅ 3. Hover state works correctly

`color.primaryHover` added to `base.json`. Each theme overrides it independently:
- Corporate: `#10231A` (darker than primary `#17311F`) — correct
- Minimal: `#333333` (lighter than black) — correct
- Apple: `#0a84ff` — see remaining issues

### ✅ 4. Dead semantic tokens removed

`button.accent`, `text.primaryStrong`, `surface.strong`, `background.neutral` are gone. Semantic layer is now lean and meaningful.

### ✅ 5. Input border fixed

`color.border` added as a dedicated primitive. Each theme defines its own border color. `input.border → {color.border}` — semantically correct. Input borders are now visible in all themes.

### ✅ 6. Shadow tokens added and tokenized

`shadow.sm` / `shadow.md` in `base.json` (default: `"none"`). Apple overrides with real values in `apple.json`. No hardcoded `rgba()` in CSS. Validator now catches `rgb()`, `rgba()`, `hsl()`, `hsla()` in styles.

### ✅ 7. Typography scale expanded

`headingFontSize`, `headingFontWeight`, `headingLetterSpacing`, `buttonFontWeight` — all added to base and semantic. Heading no longer computed via a hardcoded `* 1.5` multiplier. Apple overrides `headingLetterSpacing: "-0.3px"` and `buttonFontWeight: "500"` cleanly through the theme file.

### ✅ 8. Page-level semantic tokens added

`page.bg → {color.background}` and `page.sectionGap → {spacing.lg}` properly abstract body background and section layout. `body` and `section` in CSS now use these semantic vars.

---

## Remaining Issues

### 1. Corporate `radius.lg` is inconsistent — design bug

`corporate.json` overrides `radius.sm: 2px` and `radius.md: 4px` but does NOT override `radius.lg`. Since `card.radius → {radius.lg}`, the corporate card gets `border-radius: 16px`:

```css
/* from corporate.css */
--radius-lg: 16px;       /* inherited from base, not overridden */
--card-radius: 16px;     /* a "strict corporate" card with 16px rounding */
```

A corporate style with `2px` buttons and `16px` cards is internally inconsistent. Should be `radius.lg: 6px` or similar.

**Fix:** Add `"lg": "6px"` to the `radius` block in `corporate.json`.

---

### 2. Apple `primaryHover` is lighter than primary — questionable

```json
"primary":      "#007aff",
"primaryHover": "#0a84ff"   ← lighter blue
```

On desktop web, hover conventionally means "focus/approach" and is usually darker. A lighter hover state signals the opposite direction. Apple HIG targets touch (where hover doesn't exist), so this may be intentional, but for web consumers of this engine it will feel wrong.

**Options:** Use a darker variant (`#0066d6`) or document explicitly that Apple hover is intentionally lighter (HIG-aligned).

---

### 3. Validator crashes on `.DS_Store`

`checkThemes()` reads all files in `THEMES_DIR` with `fs.readdirSync`, which on macOS returns `.DS_Store`. Then `readJson(".DS_Store")` throws a JSON parse error — the validator crashes before completing.

```js
// current
const files = fs.readdirSync(THEMES_DIR);

// fix
const files = fs.readdirSync(THEMES_DIR).filter(f => f.endsWith(".json"));
```

This is a silent reliability hazard — the validator appears to work in clean environments but fails on any developer's Mac with Finder opened.

---

### 4. `checkBuildOutput()` will break when dark mode lands

The check looks for `--button-bg`, `--button-text` etc. in every `.css` file in `dist/`. When dark mode files are added (`apple.dark.css`), they will only contain surface/background token overrides — not button tokens. The check will fail on them.

**Fix:** Scope the check to light-mode files only, or maintain separate `requiredVars` lists per file type.

---

### 5. `checkSemantic()` is partially redundant

`checkSemantic()` verifies that reference paths start with a known prefix (`color`, `spacing`, etc.). `checkTokenReferences()` already fully resolves each reference and confirms it exists in `base.json`. The prefix check adds little — it would catch a reference like `{button.bg}` but `checkTokenReferences()` would also catch it (it doesn't exist in base). Consider merging them.

---

### 6. Dead code: `mode = "global"` in `build-theme.js`

The `buildTheme(themeName, mode)` signature exists, the `mode === "global"` branch is implemented, but the function is only ever called without `mode`:

```js
buildTheme("corporate");
buildTheme("minimal");
buildTheme("apple");
```

With dark mode implementation coming, this parameter will be repurposed or replaced. The current dead branch adds noise. Remove or implement.

---

### 7. No `package.json`

Still missing. No `scripts` block means contributors run build and validate by memorizing raw node commands. Minimum viable addition:

```json
{
  "scripts": {
    "build": "node build/build-theme.js",
    "validate": "node build/validate.js"
  }
}
```

---

## Summary

| Issue from REVIEW-01 | Status |
|---|---|
| CSS duplicate blocks | ✅ Fixed |
| Styles using base tokens directly | ✅ Fixed |
| Validator misses rgba() | ✅ Fixed |
| Hover state does nothing | ✅ Fixed |
| Dead semantic tokens | ✅ Fixed |
| Input border invisible | ✅ Fixed |

| New / Remaining Issue | Severity |
|---|---|
| Corporate `radius.lg` inconsistency | Medium — design bug |
| Apple hover is lighter than primary | Low — debatable |
| Validator crashes on `.DS_Store` | Medium — reliability |
| `checkBuildOutput()` fragile for dark mode | Low — future |
| `checkSemantic()` redundant | Low — cleanup |
| Dead `mode = "global"` code | Low — noise |
| No `package.json` | Low — onboarding |

**Overall maturity: Solid prototype.**  
The token model is coherent, the CSS is clean, the validator enforces the architectural rules it's supposed to enforce. The system is ready for dark mode implementation. Fix the `.DS_Store` crash before onboarding anyone else.
