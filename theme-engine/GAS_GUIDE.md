# GAS Embed Guide

Как использовать Design System Engine 2 в Google Apps Script HTML Service.

## Шаг 1 — Сгенерировать bundle

```bash
cd theme-engine
npm run build
```

В `dist/` появятся bundle-файлы:

| Файл | Тема | Режим |
|------|------|-------|
| `corporate.bundle.css` | Corporate | Light |
| `corporate.dark.bundle.css` | Corporate | Dark |
| `apple.bundle.css` | Apple | Light |
| `apple.dark.bundle.css` | Apple | Dark |
| `minimal.bundle.css` | Minimal | Light |

## Шаг 2 — Создать проект в GAS

1. Открыть [script.google.com](https://script.google.com) и создать новый проект
2. Переименовать `Code.gs` — скопировать содержимое `gas-example/Code.gs`
3. Добавить файл `Page.html` — скопировать `gas-example/Page.html`
4. Добавить файл `Styles.html` — содержимое выбранного bundle внутри тегов `<style>`

## Шаг 3 — Вставить CSS

Открыть `dist/corporate.bundle.css` и скопировать всё содержимое.

В `Styles.html`:
```html
<style>
/* сюда вставить содержимое corporate.bundle.css */
</style>
```

## Шаг 4 — Деплой

**Deploy as Web App:**
- Execute as: Me
- Who has access: Anyone (или Anyone with Google Account)

**Как Sidebar (Add-on):**
```javascript
function openSidebar() {
  var html = HtmlService.createTemplateFromFile('Page').evaluate()
    .setTitle('Invoice Manager');
  SpreadsheetApp.getUi().showSidebar(html);
}
```

## Смена темы

Тема задаётся атрибутом `data-theme` на `<html>`:
- `corporate` — деловая, сдержанная
- `apple` — нейтральная, современная
- `minimal` — минималистичная (только light)

Для dark mode: добавить `data-mode="dark"` на `<html>` (через JS или сразу в разметке).

## Структура bundle

Bundle = токены темы + компонентные стили. Порядок важен:
1. `[data-theme="corporate"] { ... }` — CSS-переменные токенов
2. Component styles (`.button`, `.card`, `.input`, ...) — используют `var(--token)`

Не редактировать bundle вручную — он перезаписывается при `npm run build`.
