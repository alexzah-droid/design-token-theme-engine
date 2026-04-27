English | [Русский](GAS_GUIDE.md)

# GAS Embed Guide

How to use Design System Engine 2 in Google Apps Script HTML Service.

---

## Preparation: get the files

Before running a prompt, make the bundle files available to the agent. Two options:

**A. Download ZIP**

1. Go to [github.com/alexzah-droid/design-token-theme-engine](https://github.com/alexzah-droid/design-token-theme-engine)
2. Click **Code → Download ZIP** → unzip
3. Copy the `theme-engine/dist/` folder into the working directory of your other project

**B. Clone the repository**

```bash
git clone https://github.com/alexzah-droid/design-token-theme-engine.git
```

The `theme-engine/dist/` folder will be available locally.

**What the agent needs from dist/:**

| Task | Files |
|------|-------|
| Single theme | `[name].bundle.css` (e.g. `corporate.bundle.css`) |
| All themes with switcher | `corporate.bundle.css`, `apple.bundle.css`, `minimal.bundle.css` |

The agent will find these files on its own if they are in the project or in the adjacent `design-token-theme-engine/` folder.

---

## AI agent prompts

Copy the prompt you need and give it to the AI agent in your other project — it will handle the integration on its own.

---

### Prompt 1 — Single theme

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

### Prompt 2 — All themes with a switcher

```
Integrate Design System Engine 2 into this GAS project with all themes and a theme switcher.

## What is Design System Engine 2

Token-based CSS theme engine. Themes are scoped CSS blocks keyed on the data-theme attribute.
Switching themes = changing that attribute on <html>. No reload. No npm.

## Files to embed

From design-token-theme-engine/theme-engine/dist/:

- corporate.bundle.css  — corporate theme (light + dark in one file)
- apple.bundle.css      — Apple HIG-inspired (light + dark in one file)
- minimal.bundle.css    — minimalist (light only)

Each bundle = theme tokens + component styles.

## GAS project structure

Create these files:

Code.gs               — server-side code
Page.html             — main page
StylesCorporate.html  — contents of corporate.bundle.css inside <style>...</style>
StylesApple.html      — contents of apple.bundle.css inside <style>...</style>
StylesMinimal.html    — contents of minimal.bundle.css inside <style>...</style>

## Code.gs

function doGet() {
  return HtmlService.createTemplateFromFile('Page')
    .evaluate()
    .setTitle('App name');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

## Page.html — full structure

<!DOCTYPE html>
<html data-theme="corporate">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?!= include('StylesCorporate'); ?>
  <?!= include('StylesApple'); ?>
  <?!= include('StylesMinimal'); ?>
</head>
<body>

  <nav class="nav">
    <span class="nav-brand">App name</span>
    <div class="nav-actions">
      <select class="select" id="themeSelect" onchange="setTheme(this.value)" style="width:auto">
        <option value="corporate">Corporate</option>
        <option value="apple">Apple</option>
        <option value="minimal">Minimal</option>
      </select>
      <button class="button" onclick="toggleDark()" id="darkBtn">Dark</button>
    </div>
  </nav>

  [existing page content]

  <script>
    (function init() {
      var theme = localStorage.getItem('theme') || 'corporate';
      var mode  = localStorage.getItem('mode')  || '';
      if (theme === 'minimal') mode = '';
      applyTheme(theme, mode);
      document.getElementById('themeSelect').value = theme;
    })();

    function setTheme(theme) {
      var mode = document.documentElement.getAttribute('data-mode') || '';
      if (theme === 'minimal') mode = '';
      applyTheme(theme, mode);
    }

    function toggleDark() {
      var theme = document.documentElement.getAttribute('data-theme') || 'corporate';
      if (theme === 'minimal') return;
      var mode = document.documentElement.getAttribute('data-mode') === 'dark' ? '' : 'dark';
      applyTheme(theme, mode);
    }

    function applyTheme(theme, mode) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-mode', mode);
      localStorage.setItem('theme', theme);
      localStorage.setItem('mode', mode);
      document.getElementById('darkBtn').textContent = mode === 'dark' ? 'Light' : 'Dark';
      document.getElementById('darkBtn').style.display = theme === 'minimal' ? 'none' : '';
    }
  </script>

</body>
</html>

## Apply component classes to existing markup

Buttons:       class="button"
Cards:         class="card"
Text inputs:   class="input"
Dropdowns:     class="select"
Textareas:     class="textarea"
Tables:        class="table"
Badges:        class="badge badge-success" / badge-warning / badge-error / badge-neutral
Alerts:        class="alert alert-success" / alert-warning / alert-error / alert-info
Navigation:    class="nav" > class="nav-brand" + class="nav-actions"
Headings:      class="heading"
Body text:     class="text" / class="text-secondary"

## Rules

- Do NOT write inline styles with color values — use system classes only
- Do NOT override CSS custom properties manually
- localStorage persists the user's theme choice between sessions
- minimal does not support dark mode — hide the dark button for it

## Live preview of all components

https://alexzah-droid.github.io/design-token-theme-engine/theme-engine/preview/
```

---

## Manual integration

### Step 1 — Get the files

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

### Step 2 — GAS project structure

Minimum file structure in [script.google.com](https://script.google.com):

```
Code.gs       — server-side code (doGet, include, data functions)
Page.html     — main page template
Styles.html   — CSS only (bundle goes here)
```

---

### Step 3 — Insert the CSS

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

### Step 4 — Switch themes

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

### Step 5 — Deploy

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

### All themes with a switcher — manually

To embed all themes without an AI agent:

**Project structure:**

```
Code.gs               — server-side code
Page.html             — page template with switcher
StylesCorporate.html  — corporate.bundle.css
StylesApple.html      — apple.bundle.css
StylesMinimal.html    — minimal.bundle.css
```

Dark variants (`corporate.dark.bundle.css`, `apple.dark.bundle.css`) are already included inside the light bundle files — no extra files needed.

`Page.html`:
```html
<!DOCTYPE html>
<html data-theme="corporate">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?!= include('StylesCorporate'); ?>
  <?!= include('StylesApple'); ?>
  <?!= include('StylesMinimal'); ?>
</head>
<body>

  <nav class="nav">
    <span class="nav-brand">My App</span>
    <div class="nav-actions">
      <select class="select" id="themeSelect" onchange="setTheme(this.value)" style="width:auto">
        <option value="corporate">Corporate</option>
        <option value="apple">Apple</option>
        <option value="minimal">Minimal</option>
      </select>
      <button class="button" onclick="toggleDark()" id="darkBtn">Dark</button>
    </div>
  </nav>

  <script>
    (function init() {
      var theme = localStorage.getItem('theme') || 'corporate';
      var mode  = localStorage.getItem('mode')  || '';
      if (theme === 'minimal') mode = '';
      applyTheme(theme, mode);
      document.getElementById('themeSelect').value = theme;
    })();

    function setTheme(theme) {
      var mode = document.documentElement.getAttribute('data-mode') || '';
      if (theme === 'minimal') mode = '';
      applyTheme(theme, mode);
    }

    function toggleDark() {
      var theme = document.documentElement.getAttribute('data-theme') || 'corporate';
      if (theme === 'minimal') return;
      var mode = document.documentElement.getAttribute('data-mode') === 'dark' ? '' : 'dark';
      applyTheme(theme, mode);
    }

    function applyTheme(theme, mode) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-mode', mode);
      localStorage.setItem('theme', theme);
      localStorage.setItem('mode', mode);
      document.getElementById('darkBtn').textContent = mode === 'dark' ? 'Light' : 'Dark';
      document.getElementById('darkBtn').style.display = theme === 'minimal' ? 'none' : '';
    }
  </script>

</body>
</html>
```

> **Why three `<?!= include(...); ?>` calls?**
> GAS HTML Service requires a separate file per CSS block. All three are loaded into `<head>` — the browser activates only the block whose `data-theme` matches the current attribute.

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
