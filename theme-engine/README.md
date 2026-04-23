
# Theme Engine

A lightweight Theme Engine based on design tokens.

---

## 🎯 What is this?

This project is NOT a UI library.

It is a system to:
- define design tokens
- build themes
- generate CSS variables
- apply themes dynamically

---

## 🧩 Architecture

/tokens  
- base.json (primitive tokens)  
- semantic.json (meaning layer)

/themes  
- theme overrides (corporate, minimal, apple)

/styles  
- shared component styles

/build  
- generates CSS variables

/preview  
- visual testing environment

---

## 🔗 How it works

tokens → semantic → theme → build → CSS → styles → UI

---

## 🎨 Themes

Current themes:

- Corporate (real-world extracted)
- Minimal
- Apple (HIG-inspired)

---

## ⚙️ Build

Run:

node build/build-theme.js

Output:

/dist  
- corporate.css  
- minimal.css  
- apple.css  

---

## 🎛️ Theme Switching

Themes are applied via:

[data-theme="themeName"]

Example:

<html data-theme="apple">

---

## 📐 Design Principles

- No hardcoded values
- Tokens are the single source of truth :contentReference[oaicite:1]{index=1}
- Semantic layer defines meaning
- Themes only override values
- Styles never depend on specific themes

---

## 🚧 Roadmap

- Auto contrast system
- More semantic tokens
- Export adapters (GAS, web)
- Theme packaging

---

## 🧠 Key Idea

Theme = configuration  
Styles = implementation  
Components = structure

---

## 📌 Usage

This engine can be embedded into:

- Web apps
- Google Apps Script (GAS)
- Internal tools

---

## ⚠️ Important

Before modifying the project, read:

AI_CONTEXT.md