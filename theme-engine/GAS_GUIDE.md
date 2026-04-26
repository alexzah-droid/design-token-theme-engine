[English](GAS_GUIDE.en.md) | Русский

# GAS Embed Guide

Как использовать Design System Engine 2 в Google Apps Script HTML Service.

---

## Шаг 1 — Получить файлы

Есть три способа — выбрать один:

**A. Скачать ZIP с GitHub (рекомендуется)**

1. Открыть [github.com/alexzah-droid/design-token-theme-engine](https://github.com/alexzah-droid/design-token-theme-engine)
2. Нажать **Code → Download ZIP**
3. Распаковать — нужна папка `theme-engine/dist/`

**B. Скачать только нужный CSS-файл**

Прямая ссылка на готовый bundle (правой кнопкой → «Сохранить как»):

| Тема | Ссылка |
|------|--------|
| Corporate light | `theme-engine/dist/corporate.bundle.css` |
| Corporate dark  | `theme-engine/dist/corporate.dark.bundle.css` |
| Apple light     | `theme-engine/dist/apple.bundle.css` |
| Apple dark      | `theme-engine/dist/apple.dark.bundle.css` |
| Minimal         | `theme-engine/dist/minimal.bundle.css` |

На GitHub: перейти в файл → нажать **Raw** → сохранить страницу.

**C. Клонировать репозиторий**

```bash
git clone https://github.com/alexzah-droid/design-token-theme-engine.git
```

Готовые CSS уже в `theme-engine/dist/` — `npm run build` запускать не нужно.

---

## Шаг 2 — Структура GAS-проекта

Минимальная структура файлов в [script.google.com](https://script.google.com):

```
Code.gs       — серверный код (doGet, include, функции данных)
Page.html     — основной шаблон страницы
Styles.html   — только CSS (bundle вставляется сюда)
```

---

## Шаг 3 — Вставить CSS

Открыть `dist/corporate.bundle.css` и скопировать всё содержимое.

`Styles.html`:
```html
<style>
/* вставить полное содержимое corporate.bundle.css */
</style>
```

`Page.html` — подключить стили и задать тему:
```html
<!DOCTYPE html>
<html data-theme="corporate">
<head>
  <meta charset="UTF-8">
  <?!= include('Styles'); ?>
</head>
<body>
  <!-- компоненты используют классы: .button .card .input .table .badge ... -->
</body>
</html>
```

`Code.gs` — функция include обязательна:
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

## Шаг 4 — Смена темы

Тема задаётся атрибутом `data-theme` на `<html>`:

| Значение | Тема |
|----------|------|
| `corporate` | Деловая, сдержанная (есть dark) |
| `apple` | Нейтральная, современная (есть dark) |
| `minimal` | Минималистичная (только light) |

Dark mode — добавить `data-mode="dark"`:

```html
<!-- светлая -->
<html data-theme="corporate">

<!-- тёмная -->
<html data-theme="corporate" data-mode="dark">
```

Переключение через JS:
```javascript
function toggleDark() {
  var html = document.documentElement;
  html.setAttribute('data-mode',
    html.getAttribute('data-mode') === 'dark' ? '' : 'dark');
}
```

---

## Шаг 5 — Деплой

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

## Доступные компоненты

Полный список классов с живыми примерами:
**[→ Preview онлайн](https://alexzah-droid.github.io/design-token-theme-engine/theme-engine/preview/)**

Основные классы:

| Класс | Элемент |
|-------|---------|
| `.button` | Кнопка |
| `.card` | Карточка |
| `.input`, `.select`, `.textarea` | Поля формы |
| `.label` | Подпись поля |
| `.table` | Таблица |
| `.badge-success/warning/error/neutral` | Статусные бейджи |
| `.alert-success/warning/error/info` | Алерты |
| `.nav`, `.nav-brand` | Навигация |
| `.heading`, `.text`, `.text-secondary` | Типографика |
| `.pagination`, `.pagination-item` | Пагинация |
| `.tabs`, `.tab`, `.tab--active` | Вкладки |
| `.switch`, `.switch-track`, `.switch-thumb` | Переключатель |
| `.chip`, `.chip--active` | Фильтр-чипы |

---

## Структура bundle

Bundle = токены темы + компонентные стили в одном файле:

```
[data-theme="corporate"] { --button-bg: #17311F; ... }   ← CSS-переменные токенов
.button { background: var(--button-bg); ... }              ← компоненты используют var()
```

Не редактировать bundle вручную — он перезаписывается при `npm run build`.

---

## Промпт для AI-агента в другом проекте

Если в проекте работает AI-агент (Claude Code или другой), скопируй этот промпт — он содержит всё необходимое для самостоятельной интеграции:

---

```
Интегрируй Design System Engine 2 в этот GAS-проект.

## Что такое Design System Engine 2

Token-based CSS theme engine. Темы — это готовые bundle-файлы CSS, которые содержат
CSS custom properties (токены) + готовые классы компонентов. Никаких npm-зависимостей
в runtime — только CSS.

## Файлы, которые нужно найти

В проекте или в папке design-token-theme-engine/theme-engine/dist/ находятся bundle-файлы:

- corporate.bundle.css     — корпоративная тема, светлая
- corporate.dark.bundle.css — корпоративная тема, тёмная
- apple.bundle.css         — Apple HIG-inspired, светлая
- apple.dark.bundle.css    — Apple HIG-inspired, тёмная
- minimal.bundle.css       — минималистичная, только светлая

Выбери [НАЗВАНИЕ_ТЕМЫ].bundle.css — это основной файл для интеграции.

## Что нужно сделать

### 1. Создать/обновить Styles.html

Содержимое bundle-файла вставить внутрь тегов <style>:

<style>
[полное содержимое bundle-файла]
</style>

### 2. Обновить Code.gs

Убедиться, что есть функция include():

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

Основная функция (doGet или sidebar):

function doGet() {
  return HtmlService.createTemplateFromFile('Page')
    .evaluate()
    .setTitle('Название приложения');
}

### 3. Обновить Page.html

Структура:

<!DOCTYPE html>
<html data-theme="[НАЗВАНИЕ_ТЕМЫ]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?!= include('Styles'); ?>
</head>
<body>
  [существующий контент страницы]
</body>
</html>

### 4. Применить классы компонентов к существующей разметке

Заменить существующие стили на классы системы:

Кнопки:        class="button"
Карточки:      class="card"
Поля ввода:    class="input"
Выпадающие:    class="select"
Текст. поля:   class="textarea"
Подписи:       class="label"
Таблицы:       class="table"
Бейджи:        class="badge badge-success" / badge-warning / badge-error / badge-neutral
Алерты:        class="alert alert-success" / alert-warning / alert-error / alert-info
Навигация:     class="nav" > class="nav-brand" + class="nav-actions"
Заголовки:     class="heading"
Текст:         class="text" / class="text-secondary"
Пагинация:     class="pagination" > class="pagination-item" / pagination-item--active
Вкладки:       class="tabs" > class="tab" / tab--active
Переключатель: class="switch" > class="switch-track" > class="switch-thumb"
Чипы:          class="chips" > class="chip" / chip--active

### 5. Dark mode (опционально)

Переключение темы через JS:

function toggleDark() {
  var html = document.documentElement;
  html.setAttribute('data-mode',
    html.getAttribute('data-mode') === 'dark' ? '' : 'dark');
}

### Правила

- НЕ писать inline-стили с цветами — только классы из системы
- НЕ переопределять CSS custom properties вручную
- Если компонента нет в списке — использовать семантические CSS переменные:
  var(--text-primary), var(--card-bg), var(--button-bg) и т.д.
- Preview с живыми примерами всех компонентов:
  https://alexzah-droid.github.io/design-token-theme-engine/theme-engine/preview/

### Рабочий пример

Смотри gas-example/ в репозитории design-token-theme-engine:
- gas-example/Code.gs     — серверная часть
- gas-example/Page.html   — разметка
- gas-example/Styles.html — как вставить CSS
```

---

*Промпт самодостаточен — агент справится без доступа к документации.*
