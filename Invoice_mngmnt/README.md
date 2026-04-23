# ЗТЗ · UI Kit & Frontend Guide

Готовый набор визуальных токенов, компонентов и паттернов для интерфейсов проектов ООО «Завод Турбинных Запчастей». Всё построено на чистом HTML/CSS/JS без зависимостей — подключается одной строкой и работает в любом фреймворке.

## Что в комплекте

```
.
├── ztz-ui-kit-v2.html         ← витрина (открыть в браузере)
├── assets/
│   ├── tokens.css             ← CSS-переменные (цвета, типы, spacing)
│   ├── themes.css             ← light / dark / auto
│   ├── components.css         ← кнопки, формы, dropdown, accordion и т.д.
│   ├── charts.css             ← графики, heatmap, диаграмма Ганта
│   ├── page.css               ← стили демо-страницы (не обязательны)
│   └── ui.js                  ← поведение: темы, dropdown, accordion, tabs
└── README.md                  ← этот файл
```

`page.css` нужен только для витрины. В боевой проект достаточно `tokens.css` → `themes.css` → `components.css` → `charts.css` → `ui.js`.

## Установка в проект VS Code

1. Скачайте / скопируйте папку `assets/` в свой проект.
2. Подключите в `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..600&family=PT+Sans:wght@400;700&family=PT+Serif:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<link rel="stylesheet" href="assets/tokens.css">
<link rel="stylesheet" href="assets/themes.css">
<link rel="stylesheet" href="assets/components.css">
<link rel="stylesheet" href="assets/charts.css">
<script src="assets/ui.js" defer></script>
```

3. На `<html>` поставьте начальную тему:

```html
<html lang="ru" data-theme="light">
```

Поддерживаются значения `light` / `dark` / `auto`. Выбор пользователя сохраняется в `localStorage['ztz-theme']`.

## Переключатель тем

Разметка:

```html
<div class="theme-toggle" role="radiogroup" aria-label="Тема">
  <button data-theme-set="light" role="radio" aria-checked="true">☀</button>
  <button data-theme-set="dark"  role="radio" aria-checked="false">☾</button>
  <button data-theme-set="auto"  role="radio" aria-checked="false">◐</button>
</div>
```

`ui.js` сам вешает обработчики, применяет тему и хранит её между сессиями.

## Токены

В `tokens.css` — бренд-константы (зелёная и латунная шкала, шрифты, spacing, скорости анимаций).
В `themes.css` — семантические переменные, которые меняются между темами:

| Токен | Назначение |
|-------|-----------|
| `--bg`, `--surface-1…3` | фоны |
| `--ink`, `--ink-60`, `--ink-40` | цвета текста |
| `--line`, `--line-strong` | линии и границы |
| `--primary`, `--accent` | основные и акцентные цвета |
| `--ok`, `--warn`, `--danger`, `--info` | семантические |
| `--chart-1…6`, `--chart-grid`, `--chart-axis` | графики |
| `--sh-1…3`, `--sh-pop` | тени |

Используйте всегда семантические токены — тогда dark/light работает автоматически.

## Компоненты

| Компонент | Классы |
|-----------|--------|
| Кнопки | `.btn .btn-primary/.btn-gold/.btn-outline/.btn-ghost` + `.btn-sm/.btn-lg` |
| Поля | `.field`, `.input`, `.textarea`, `.select` |
| Checkbox / radio / switch | `.check`, `.radio`, `.switch` |
| Кастомный select | `.dropdown[data-dropdown]` — плавное раскрытие, клавиатура |
| Badges | `.badge .badge-gold/.badge-ok/.badge-warn/.badge-danger/.badge-info/.badge-outline` |
| Tabs | `[role="tablist"] > .tab` |
| Accordion | `.acc > .acc-item[data-acc]` — плавная анимация высоты |
| Alerts | `.alert .is-ok/.is-warn/.is-danger/.is-info` + `.x` для закрытия |
| Progress | `.progress` (+ `.progress-gold/-ok/-danger/-indet`), `.circ[style="--p:72"]`, `.segmented` |
| Таблица | `table.tbl` + `.num`, `.mono` |
| KPI | `.kpi` + `.spark` (SVG sparkline) |

## Графики

В `charts.css` все графики — чистый инлайн SVG, стилизуется через `var(--chart-N)`.
Поддерживаются:

- **Area** — заливка + линия (gradient `id="areaGrad"`).
- **Bar / Stacked bar** — `<rect>` по группам.
- **Line / Multi-line** (план vs факт) — `<polyline>`, dash для плана.
- **Donut** — составленный из `<circle stroke-dasharray>` (обход по кругу).
- **Sparkline** — мелкая `<polyline>` в KPI-карточке.
- **Heatmap** — `.heat > .heat-row > i[style="--v:.7"]`, цвет через `rgba(var(--chart-heat), var(--v))`.

Все палитры переключаются вместе с темой.

## Диаграмма Ганта

Разметка (сокращённо):

```html
<div class="gantt">
  <div class="gantt-head">
    <div class="gantt-tasks-h">Работа</div>
    <div class="gantt-scale">
      <div class="gantt-months">...</div>
      <div class="gantt-weeks">... 16 колонок ...</div>
    </div>
  </div>
  <div class="gantt-body">
    <div class="gantt-grid">...16 span...</div>

    <div class="gantt-row">
      <div class="gantt-task">...название / ответственный...</div>
      <div class="gantt-track">
        <!-- s = start (номер недели 0..16), d = duration -->
        <div class="gantt-bar active" style="--s:3.5; --d:4">
          <div class="gantt-fill" style="width:62%"></div>
          <span>Обработка · 62%</span>
        </div>
        <div class="gantt-milestone" style="--s:4.5"></div>
      </div>
    </div>

    <div class="gantt-today" style="--s:4.8"></div>
  </div>

  <div class="gantt-legend">...</div>
</div>
```

Состояния бара: `.done`, `.active`, `.plan`, `.risk`. Все цвета через темные токены — dark mode работает сразу.

## Анимации

Скорости: `--dur-1: 120ms`, `--dur-2: 180ms`, `--dur-3: 260ms`, `--dur-4: 380ms`.
Easing: `--ease-out: cubic-bezier(.2,.8,.2,1)`.
Респект `prefers-reduced-motion: reduce` встроен — пользователи с настройкой «уменьшить движение» получают статичный UI.

## Доступность

- Контраст ≥ WCAG AA для обеих тем.
- `:focus-visible` всегда с золотой обводкой `var(--focus-ring)`.
- Все кастомные контролы имеют `role`/`aria-*`.
- Dropdown поддерживает `↑ ↓ Enter Esc`.
- Hit-area кнопок ≥ 44×44 px.

## Лицензия / использование

Внутренний инструмент ООО «ЗТЗ». При использовании в сторонних проектах согласовать с отделом маркетинга.

`marketing@ztz.spb.ru`
