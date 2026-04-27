[English](GAS_GUIDE.en.md) | Русский

# GAS Embed Guide

Как использовать Design System Engine 2 в Google Apps Script HTML Service.

---

## Подготовка: получить файлы

Перед запуском промпта нужно передать агенту bundle-файлы. Есть два способа:

**A. Скачать ZIP**

1. Открыть [github.com/alexzah-droid/design-token-theme-engine](https://github.com/alexzah-droid/design-token-theme-engine)
2. Нажать **Code → Download ZIP** → распаковать
3. Папку `theme-engine/dist/` скопировать в рабочую директорию другого проекта

**B. Клонировать репозиторий**

```bash
git clone https://github.com/alexzah-droid/design-token-theme-engine.git
```

Папка `theme-engine/dist/` будет доступна локально.

**Что нужно агенту из dist/:**

| Задача | Файлы |
|--------|-------|
| Одна тема | `[название].bundle.css` (например `corporate.bundle.css`) |
| Все темы с переключателем | `corporate.bundle.css`, `apple.bundle.css`, `minimal.bundle.css` |

Агент найдёт эти файлы сам, если они лежат в проекте или в соседней папке `design-token-theme-engine/`.

---

## Промпты для AI-агента

Скопируй нужный промпт и передай AI-агенту другого проекта — он выполнит интеграцию самостоятельно.

---

### Промпт 1 — Одна тема

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

### Промпт 2 — Все темы с переключателем

```
Интегрируй Design System Engine 2 в этот GAS-проект со всеми темами и переключателем.

## Что такое Design System Engine 2

Token-based CSS theme engine. Темы — scoped CSS-блоки на основе атрибута data-theme.
Переключение темы = смена атрибута на <html>. Без перезагрузки. Без npm.

## Файлы для встраивания

В папке design-token-theme-engine/theme-engine/dist/:

- corporate.bundle.css      — корпоративная тема (light + dark в одном файле)
- apple.bundle.css          — Apple HIG-inspired (light + dark в одном файле)
- minimal.bundle.css        — минималистичная (только light)

Каждый bundle = токены темы + компонентные стили.

## Структура GAS-проекта

Создать файлы:

Code.gs               — серверный код
Page.html             — основная страница
StylesCorporate.html  — содержимое corporate.bundle.css внутри <style>...</style>
StylesApple.html      — содержимое apple.bundle.css внутри <style>...</style>
StylesMinimal.html    — содержимое minimal.bundle.css внутри <style>...</style>

## Code.gs

function doGet() {
  return HtmlService.createTemplateFromFile('Page')
    .evaluate()
    .setTitle('Название приложения');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

## Page.html — полная структура

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
    <span class="nav-brand">Название приложения</span>
    <div class="nav-actions">
      <select class="select" id="themeSelect" onchange="setTheme(this.value)" style="width:auto">
        <option value="corporate">Corporate</option>
        <option value="apple">Apple</option>
        <option value="minimal">Minimal</option>
      </select>
      <button class="button" onclick="toggleDark()" id="darkBtn">Dark</button>
    </div>
  </nav>

  [существующий контент страницы]

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

## Применить классы к существующей разметке

Кнопки:        class="button"
Карточки:      class="card"
Поля ввода:    class="input"
Выпадающие:    class="select"
Текст. поля:   class="textarea"
Таблицы:       class="table"
Бейджи:        class="badge badge-success" / badge-warning / badge-error / badge-neutral
Алерты:        class="alert alert-success" / alert-warning / alert-error / alert-info
Навигация:     class="nav" > class="nav-brand" + class="nav-actions"
Заголовки:     class="heading"
Текст:         class="text" / class="text-secondary"

## Правила

- НЕ писать inline-стили с цветами — только классы системы
- НЕ переопределять CSS custom properties вручную
- localStorage сохраняет выбор темы между сессиями
- minimal не поддерживает dark mode — кнопку скрыть

## Preview всех компонентов

https://alexzah-droid.github.io/design-token-theme-engine/theme-engine/preview/
```

---

## Ручная интеграция

### Шаг 1 — Получить файлы

Есть три способа — выбрать один:

**A. Скачать ZIP с GitHub (рекомендуется)**

1. Открыть [github.com/alexzah-droid/design-token-theme-engine](https://github.com/alexzah-droid/design-token-theme-engine)
2. Нажать **Code → Download ZIP**
3. Распаковать — нужна папка `theme-engine/dist/`

**B. Скачать только нужный CSS-файл**

Прямая ссылка на готовый bundle (правой кнопкой → «Сохранить как»):

| Тема | Файл |
|------|------|
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

### Шаг 2 — Структура GAS-проекта

Минимальная структура файлов в [script.google.com](https://script.google.com):

```
Code.gs       — серверный код (doGet, include, функции данных)
Page.html     — основной шаблон страницы
Styles.html   — только CSS (bundle вставляется сюда)
```

---

### Шаг 3 — Вставить CSS

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

### Шаг 4 — Смена темы

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

### Шаг 5 — Деплой

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

### Все темы с переключателем — вручную

Если нужно встроить все темы без AI-агента:

**Структура проекта:**

```
Code.gs               — серверный код
Page.html             — шаблон с переключателем
StylesCorporate.html  — corporate.bundle.css
StylesApple.html      — apple.bundle.css
StylesMinimal.html    — minimal.bundle.css
```

Тёмные варианты (`corporate.dark.bundle.css`, `apple.dark.bundle.css`) уже включены в светлые bundle-файлы — отдельные файлы не нужны.

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

> **Почему `<?!= include(...); ?>` три раза?**
> GAS HTML Service требует отдельный файл для каждого CSS. Все три подключаются в `<head>` — браузер применяет только тот блок, чей `data-theme` совпадает с текущим атрибутом.

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
