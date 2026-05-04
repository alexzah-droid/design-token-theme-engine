[English](USAGE.en.md) | Русский

# Theme Engine — Usage Guide

> For architecture details see [`README.md`](../README.md).
> For GAS integration see [`GAS_GUIDE.md`](GAS_GUIDE.md).
> For component reference see [`README.md`](README.md).

## Quick start — web project

### 1. Build

```bash
cd theme-engine
npm run build
```

Generates in `dist/`:
- `{theme}.css` — theme token variables
- `{theme}.dark.css` — dark mode token overrides
- `{theme}.bundle.css` — tokens + components in one file (for single-file embed)

### 2. Connect — standard (multi-file)

```html
<link rel="stylesheet" href="dist/corporate.css">
<link rel="stylesheet" href="styles/components.css">
```

Set theme on root element:

```html
<html data-theme="corporate">
```

For dark mode:

```html
<html data-theme="corporate" data-mode="dark">
```

### 3. Connect — single-file bundle

Copy `dist/corporate.bundle.css` to your project and include it:

```html
<link rel="stylesheet" href="corporate.bundle.css">
```

```html
<html data-theme="corporate">
```

Bundle includes both token variables and component styles.

### 4. Switch themes at runtime

```js
document.documentElement.setAttribute('data-theme', 'apple');
```

### 5. Toggle dark mode

```js
document.documentElement.setAttribute('data-mode', 'dark');
// to revert:
document.documentElement.removeAttribute('data-mode');
```

## Available themes

| Theme | Light | Dark |
|-------|-------|------|
| `corporate` | yes | yes |
| `apple` | yes | yes |
| `minimal` | yes | yes |

## Available components

Use CSS classes directly. All components require a theme to be active.

See `README.md` for the full list of component classes.

## Google Apps Script

Cannot use `<link>` for external CSS. Use bundle files via `include()` pattern.

See `GAS_GUIDE.md` for step-by-step instructions and `gas-example/` for a working example.

## Validate

```bash
npm run validate
```

Runs 7 architectural invariant checks. Must pass before committing.
