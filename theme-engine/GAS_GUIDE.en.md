English | [Русский](GAS_GUIDE.md)

# GAS Embed Guide

How to use Design System Engine 2 in Google Apps Script HTML Service.

---

## Step 1 — Get the files

Choose one of three options:

**A. Download ZIP from GitHub (recommended)**

1. Go to [github.com/alexzah-droid/design-token-theme-engine](https://github.com/alexzah-droid/design-token-theme-engine)
2. Click **Code → Download ZIP**
3. Unzip — you need the `theme-engine/dist/` folder

**B. Download only the CSS file you need**

Direct links to pre-built bundles (right-click → Save as):

| Theme | File |
|-------|------|
| Corporate light | `theme-engine/dist/corporate.bundle.css` |
| Corporate dark  | `theme-engine/dist/corporate.dark.bundle.css` |
| Apple light     | `theme-engine/dist/apple.bundle.css` |
| Apple dark      | `theme-engine/dist/apple.dark.bundle.css` |
| Minimal         | `theme-engine/dist/minimal.bundle.css` |

On GitHub: navigate to the file → click **Raw** → save the page.

**C. Clone the repository**

```bash
git clone https://github.com/alexzah-droid/design-token-theme-engine.git
```

Pre-built CSS is already in `theme-engine/dist/` — no need to run `npm run build`.

---

## Step 2 — GAS project structure

Minimum file structure in [script.google.com](https://script.google.com):

```
Code.gs       — server-side code (doGet, include, data functions)
Page.html     — main page template
Styles.html   — CSS only (bundle goes here)
```

---

## Step 3 — Insert the CSS

Open `dist/corporate.bundle.css` and copy its full contents.

`Styles.html`:
```html
<style>
/* paste the full contents of corporate.bundle.css here */
</style>
```

`Page.html` — include styles and set the theme:
```html
<!DOCTYPE html>
<html data-theme="corporate">
<head>
  <meta charset="UTF-8">
  <?!= include('Styles'); ?>
</head>
<body>
  <!-- components use classes: .button .card .input .table .badge ... -->
</body>
</html>
```

`Code.gs` — the include function is required:
```javascript
function doGet() {
  return HtmlService.createTemplateFromFile('Page')
    .evaluate()
    .setTitle('My App');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

---

## Step 4 — Switch themes

The theme is set via the `data-theme` attribute on `<html>`:

| Value | Theme |
|-------|-------|
| `corporate` | Formal, restrained (dark mode available) |
| `apple` | Neutral, modern (dark mode available) |
| `minimal` | Minimalist (light only) |

Dark mode — add `data-mode="dark"`:

```html
<!-- light -->
<html data-theme="corporate">

<!-- dark -->
<html data-theme="corporate" data-mode="dark">
```

Toggle via JS:
```javascript
function toggleDark() {
  var html = document.documentElement;
  html.setAttribute('data-mode',
    html.getAttribute('data-mode') === 'dark' ? '' : 'dark');
}
```

---

## Step 5 — Deploy

**Web App:**
- Deploy → New deployment → Web app
- Execute as: Me
- Who has access: Anyone with Google Account

**Sidebar / Add-on:**
```javascript
function openSidebar() {
  var html = HtmlService.createTemplateFromFile('Page').evaluate()
    .setTitle('My App');
  SpreadsheetApp.getUi().showSidebar(html);
}
```

---

## Available components

Full class list with live examples:
**[→ Preview online](https://alexzah-droid.github.io/design-token-theme-engine/theme-engine/preview/)**

Key classes:

| Class | Element |
|-------|---------|
| `.button` | Button |
| `.card` | Card |
| `.input`, `.select`, `.textarea` | Form fields |
| `.label` | Field label |
| `.table` | Table |
| `.badge-success/warning/error/neutral` | Status badges |
| `.alert-success/warning/error/info` | Alerts |
| `.nav`, `.nav-brand` | Navigation |
| `.heading`, `.text`, `.text-secondary` | Typography |
| `.pagination`, `.pagination-item` | Pagination |
| `.tabs`, `.tab`, `.tab--active` | Tabs |
| `.switch`, `.switch-track`, `.switch-thumb` | Toggle switch |
| `.chip`, `.chip--active` | Filter chips |

---

## Bundle structure

Bundle = theme tokens + component styles in one file:

```
[data-theme="corporate"] { --button-bg: #17311F; ... }   ← CSS custom property tokens
.button { background: var(--button-bg); ... }              ← components consume var()
```

Do not edit the bundle manually — it is overwritten on every `npm run build`.

---

## AI agent prompt for another project

If your project uses an AI agent (Claude Code or another), copy this prompt — it contains everything the agent needs to integrate the design system independently:

---

```
Integrate Design System Engine 2 into this GAS project.

## What is Design System Engine 2

A token-based CSS theme engine. Themes are pre-built CSS bundle files containing
CSS custom properties (tokens) + ready-to-use component classes. No runtime npm
dependencies — pure CSS only.

## Files to find

In the project or in design-token-theme-engine/theme-engine/dist/ you will find bundle files:

- corporate.bundle.css      — corporate theme, light
- corporate.dark.bundle.css — corporate theme, dark
- apple.bundle.css          — Apple HIG-inspired, light
- apple.dark.bundle.css     — Apple HIG-inspired, dark
- minimal.bundle.css        — minimalist, light only

Pick [THEME_NAME].bundle.css — this is the file to integrate.

## What to do

### 1. Create / update Styles.html

Paste the full contents of the bundle file inside <style> tags:

<style>
[full contents of the bundle file]
</style>

### 2. Update Code.gs

Make sure the include() function exists:

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

Main function (doGet or sidebar):

function doGet() {
  return HtmlService.createTemplateFromFile('Page')
    .evaluate()
    .setTitle('App name');
}

### 3. Update Page.html

Structure:

<!DOCTYPE html>
<html data-theme="[THEME_NAME]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?!= include('Styles'); ?>
</head>
<body>
  [existing page content]
</body>
</html>

### 4. Apply component classes to existing markup

Replace existing styles with system classes:

Buttons:       class="button"
Cards:         class="card"
Text inputs:   class="input"
Dropdowns:     class="select"
Textareas:     class="textarea"
Labels:        class="label"
Tables:        class="table"
Badges:        class="badge badge-success" / badge-warning / badge-error / badge-neutral
Alerts:        class="alert alert-success" / alert-warning / alert-error / alert-info
Navigation:    class="nav" > class="nav-brand" + class="nav-actions"
Headings:      class="heading"
Body text:     class="text" / class="text-secondary"
Pagination:    class="pagination" > class="pagination-item" / pagination-item--active
Tabs:          class="tabs" > class="tab" / tab--active
Toggle:        class="switch" > class="switch-track" > class="switch-thumb"
Chips:         class="chips" > class="chip" / chip--active

### 5. Dark mode (optional)

Toggle via JS:

function toggleDark() {
  var html = document.documentElement;
  html.setAttribute('data-mode',
    html.getAttribute('data-mode') === 'dark' ? '' : 'dark');
}

### Rules

- Do NOT write inline styles with color values — use system classes only
- Do NOT override CSS custom properties manually
- If a component is not in the list — use semantic CSS variables:
  var(--text-primary), var(--card-bg), var(--button-bg), etc.
- Live preview of all components:
  https://alexzah-droid.github.io/design-token-theme-engine/theme-engine/preview/

### Working example

See gas-example/ in the design-token-theme-engine repository:
- gas-example/Code.gs     — server-side code
- gas-example/Page.html   — markup
- gas-example/Styles.html — how to embed the CSS
```

---

*The prompt is self-contained — the agent can complete the integration without access to the full documentation.*
