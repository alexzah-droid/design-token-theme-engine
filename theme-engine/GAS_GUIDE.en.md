English | [Русский](GAS_GUIDE.md)

# GAS Embed Guide

How to use Design System Engine 2 in Google Apps Script HTML Service.

## Step 1 — Generate the bundle

```bash
cd theme-engine
npm run build
```

The following bundle files will be generated in `dist/`:

| File | Theme | Mode |
|------|-------|------|
| `corporate.bundle.css` | Corporate | Light |
| `corporate.dark.bundle.css` | Corporate | Dark |
| `apple.bundle.css` | Apple | Light |
| `apple.dark.bundle.css` | Apple | Dark |
| `minimal.bundle.css` | Minimal | Light |

## Step 2 — Create a GAS project

1. Open [script.google.com](https://script.google.com) and create a new project
2. Rename `Code.gs` — copy the contents of `gas-example/Code.gs`
3. Add a `Page.html` file — copy from `gas-example/Page.html`
4. Add a `Styles.html` file — paste the contents of your chosen bundle inside `<style>` tags

## Step 3 — Insert the CSS

Open `dist/corporate.bundle.css` and copy all its contents.

In `Styles.html`:
```html
<style>
/* paste the contents of corporate.bundle.css here */
</style>
```

## Step 4 — Deploy

**Deploy as Web App:**
- Execute as: Me
- Who has access: Anyone (or Anyone with Google Account)

**As a Sidebar (Add-on):**
```javascript
function openSidebar() {
  var html = HtmlService.createTemplateFromFile('Page').evaluate()
    .setTitle('Invoice Manager');
  SpreadsheetApp.getUi().showSidebar(html);
}
```

## Switching themes

The theme is set via the `data-theme` attribute on `<html>`:
- `corporate` — formal, restrained
- `apple` — neutral, modern
- `minimal` — minimalist (light only)

For dark mode: add `data-mode="dark"` to `<html>` (via JS or directly in markup).

## Bundle structure

Bundle = theme tokens + component styles. Order matters:
1. `[data-theme="corporate"] { ... }` — CSS custom property tokens
2. Component styles (`.button`, `.card`, `.input`, ...) — consume `var(--token)`

Do not edit the bundle manually — it is overwritten on every `npm run build`.
