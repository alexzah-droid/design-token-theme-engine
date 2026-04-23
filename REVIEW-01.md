# Theme Engine — Architecture Review

Date: 2026-04-23  
Reviewer: Claude (claude-sonnet-4-6)

---

## Confirmed: What's done right

**3-layer token model** (primitive → semantic → theme) is an industry standard approach, aligned with DTCG, Tailwind Oxide, and Material Design 3. The choice is correct — do not invent an alternative.

**Build pipeline** is clean: `deepMerge` + `resolveToken` + `flattenTokens` → CSS. No external dependencies, readable, functional. `resolveObjectTokens` correctly handles nested structures.

**Scoped selectors** via `[data-theme="..."]` is the right mechanism. Allows themes to coexist without conflict.

**Having a validator** is a mature decision. Most early-stage design systems skip it entirely.

---

## Critical Issues — Must Fix

### 1. `components.css` — zombie from iterative AI sessions

The file contains **5–6 separate blocks** for the Apple theme that repeat and override each other:

- `[data-theme="apple"] body` — 3 times (lines 85, 116, 145)
- `[data-theme="apple"] .card` — 4 times (lines 73, 104, 127, 151)
- `[data-theme="apple"] .button` — 4 times (lines 70, 109, 132, 175)
- `[data-theme="apple"] .input` — 3 times (lines 78, 140, 155)

Each subsequent block partially cancels the previous one. The file cannot be read linearly — you have to hold the entire cascade in your head. **This is a direct maintainability hazard.**

**Fix:** Consolidate each Apple theme selector into a single block. Remove all duplicates.

---

### 2. Styles violate their own rules

`components.css` breaks the core rule "use only semantic tokens in styles":

```css
background: var(--color-background);   /* line 88 — base token in component styles */
background: var(--color-surface);      /* line 106 — base token in component styles */
calc(var(--spacing-lg) * 1.5)          /* line 100 — base token + hardcoded multiplier */
border-radius: var(--radius-lg);       /* line 129 — base token in component styles */
```

The rule exists. The code breaks it. The validator does not catch this.

**Fix:** Replace all base token references in `components.css` with semantic token references. Add a validator check for `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)` usage in styles.

---

### 3. Validator misses `rgba()` — and they're present

`checkNoHardcodedColors()` in `validate.js` only looks for `#HEX`. Meanwhile in `components.css`:

```css
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);    /* line 71 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);  /* line 74 */
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);   /* line 81 */
```

Shadows are hardcoded, the validator passes silently, the rule is violated invisibly.

**Fix:** Extend `checkNoHardcodedColors()` to also catch `rgb(`, `rgba(`, `hsl(`, `hsla(`. Add shadow tokens to `base.json` (`shadow.sm`, `shadow.md`).

---

### 4. Hover state does nothing

In `semantic.json`:
```json
"button": {
  "bg":      "{color.primary}",
  "hoverBg": "{color.primary}"
}
```

In `apple.css`:
```css
--button-bg: #007aff;
--button-hover-bg: #007aff;
```

The token exists, the CSS variable is generated, `.button:hover` rule applies — but there is no visual change. Hover is broken for all themes.

**Fix:** Either make `hoverBg` reference a distinct darker/lighter value (e.g., a new `color.primaryHover` base token), or document it as intentional and remove the rule.

---

### 5. Dead semantic tokens

Tokens that add no semantic value:

| Token | Value | Duplicates |
|---|---|---|
| `button.accent` | `{color.primary}` | `button.bg` |
| `text.primaryStrong` | `{color.textPrimary}` | `text.primary` |
| `surface.strong` | `{color.surface}` | direct base token |
| `background.neutral` | `{color.background}` | direct base token |

These are aliases without meaning. Either add a real distinction (e.g., `text.primaryStrong` maps to a bolder weight), or remove them.

---

### 6. Input border is invisible

In `corporate.css` and `apple.css`:
```css
--input-border: #FFFFFF;
```

`input.border → {color.surface}`, and `color.surface` in corporate is `#FFFFFF`. The border matches the background — the input has no visible edge. This is a token resolution defect, not an intentional design decision.

**Fix:** Add `color.border` as a dedicated primitive token in `base.json`. Map `input.border → {color.border}`.

---

## Systemic Gaps — For Next Stages

**No shadow tokens.** `box-shadow` is a visual value that changes per theme but is currently hardcoded. Needs `shadow.sm`, `shadow.md` in `base.json`.

**No border color primitive.** `base.json` has no `color.border`. `input.border` currently abuses `color.surface` — wrong semantics.

**No typographic scale.** Only `fontSizeBase` exists. No `fontSize.sm/lg`, `fontWeight`, `lineHeight`. Heading is computed via a hardcoded `* 1.5` multiplier.

**`mode = "global"` in `build-theme.js` is dead code.** Never called — not in the script, not in documentation. Remove or implement.

**No `package.json`.** No `scripts`, no module type declaration. Hard to onboard.

---

## Summary

| Aspect | Rating |
|---|---|
| Architectural model | Correct — confirmed |
| Build pipeline | Good |
| Adherence to own rules | Weak |
| CSS file state | Needs refactoring |
| Validator coverage | Incomplete |
| Overall maturity | Early prototype |

**Diagnosis:** The architecture is well-designed, but the implementation has accumulated debt from iterative changes — a typical pattern in AI-assisted development without enforced review. The system violates its own invariants in several places, and the validator misses half of the violations.

**First priority:** Rewrite `components.css` — remove duplicates, consolidate each Apple theme section into one block. This single change immediately and significantly improves readability and trust in the system.