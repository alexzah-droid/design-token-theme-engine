[English](README.en.md) | Русский

# Design System Engine

Token-based CSS theme engine: меняешь JSON-файл с токенами — пересобираешь — весь интерфейс обновляется.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Validator](https://img.shields.io/badge/validator-7%2F7-brightgreen)]()
[![Zero deps](https://img.shields.io/badge/dependencies-zero-brightgreen)]()

## Что это

- Генерирует scoped CSS custom properties из JSON design tokens
- 3 темы (corporate, apple, minimal) с поддержкой тёмного режима
- 60+ готовых CSS-классов компонентов без зависимостей от фреймворков
- Встроенный валидатор проверяет 7 архитектурных инвариантов при каждой сборке

Подходит для: admin panels, internal tools, white-label продуктов, Google Apps Script приложений.

## Быстрый старт

**Шаг 1.** Скачайте готовый CSS из `theme-engine/dist/`:

```
corporate.bundle.css      — Corporate тема (токены + компоненты в одном файле)
apple.bundle.css          — Apple HIG-inspired тема
minimal.bundle.css        — Minimal тема
corporate.dark.bundle.css — Corporate, тёмный режим
```

**Шаг 2.** Подключите файл в HTML:

```html
<link rel="stylesheet" href="corporate.bundle.css">
```

**Шаг 3.** Установите атрибут темы на корневом элементе и используйте классы компонентов:

```html
<!DOCTYPE html>
<html data-theme="corporate">
<body>

  <button class="button">Сохранить</button>

  <div class="card">
    <p class="heading">Заголовок</p>
    <p class="text">Текст карточки</p>
    <span class="badge badge-success">Активен</span>
  </div>

  <table class="table">
    <thead><tr><th>Имя</th><th>Статус</th></tr></thead>
    <tbody><tr><td>Иван</td><td>Активен</td></tr></tbody>
  </table>

</body>
</html>
```

Для тёмного режима добавьте `data-mode="dark"`:

```html
<html data-theme="corporate" data-mode="dark">
```

## Архитектура

3-слойная модель токенов:

```
tokens/base.json          — примитивные значения: цвета, отступы, типографика, тени
tokens/semantic.json      — смысловые маппинги через {group.key} синтаксис ссылок
themes/{name}.json        — переопределения только примитивных токенов
themes/{name}.dark.json   — dark-mode переопределения (отдельный файл)
```

Как токен проходит путь от JSON до браузера:

```
base.json                    semantic.json                    CSS output
─────────────────────        ─────────────────────────────    ──────────────────────────
color.primary = "#1a73e8"    button.bg = "{color.primary}"    --button-bg: #1a73e8;
radius.md = "8px"        →   button.radius = "{radius.md}" →  --button-radius: 8px;
shadow.sm = "0 1px 3px…"     button.shadow = "{shadow.sm}"    --button-shadow: 0 1px…;
```

Тема переопределяет только `base.json`-значения — семантика и компоненты не меняются. Чтобы сделать новый бренд, достаточно одного JSON-файла с переопределениями нужных примитивов.

Переключение темы: атрибуты `data-theme` и `data-mode` на корневом HTML-элементе. Смена атрибута мгновенно применяет другой набор CSS custom properties — без перезагрузки страницы, без JavaScript.

`npm run build` генерирует `dist/` из `tokens/` и `themes/` через пайплайн: deepMerge → resolveToken → flattenTokens → emit CSS.

## Для кого подходит

**Подходит, если:**
- Строите plain HTML/CSS интерфейс без сборщика (admin panel, internal tool, dashboard)
- Используете Google Apps Script HTML Service — CDN и npm там недоступны в production
- Нужно несколько брендов/тем на одной кодовой базе компонентов (white-label)
- Хотите архитектурный контракт — валидатор не даст разработчику случайно захардкодить цвет в компонент

**Не подходит, если:**
- Уже используете React, Vue или другой компонентный фреймворк — там лучше работают CSS Modules, CSS-in-JS или утилитарные классы
- Нужна утилитарная (атомарная) CSS-модель — Tailwind CSS решит задачу эффективнее
- Проект требует SSR или сложного tree-shaking CSS

## Темы

| Тема | Описание | Тёмный режим |
|------|----------|:---:|
| `corporate` | Деловая, сдержанная | да |
| `apple` | Нейтральная, вдохновлена Apple HIG | да |
| `minimal` | Чистая, минималистичная | — |

## Компоненты

60+ классов: кнопки, карточки, формы, навигация, таблицы, badges, переключатели, вкладки, аккордеоны, дропдауны, прогресс-бары, KPI, чипы, графики (sparkline, area, bar, donut, heatmap, gantt) и утилиты типографики.

Все компоненты используют только семантические CSS custom properties — никаких hardcoded значений. Валидатор это гарантирует.

Полный список классов и примеры использования: [`theme-engine/README.md`](theme-engine/README.md)

## Google Apps Script

Bundle-файлы готовы к встраиванию в GAS HTML Service — без CDN и npm в production:

1. Скопируйте содержимое `dist/corporate.bundle.css` в файл `Styles.html` вашего GAS-проекта
2. Подключите через `<?!= include('Styles'); ?>` в HTML-шаблоне
3. Используйте CSS-классы компонентов в разметке как обычно

Полная инструкция с рабочим примером: [`theme-engine/GAS_GUIDE.md`](theme-engine/GAS_GUIDE.md)

## Разработка

Все команды запускаются из `theme-engine/`:

```bash
npm install       # установить зависимости сборщика (только dev)
npm run build     # сгенерировать dist/*.css и dist/*.bundle.css
npm run validate  # проверить 7 архитектурных инвариантов
```

Предпросмотр компонентов: открыть `theme-engine/preview/index.html` в браузере.

Что проверяет валидатор (7 проверок):

1. Нет hardcoded значений (HEX/rgb/hsl) в компонентах
2. Компоненты не используют base-токены напрямую — только семантические
3. Семантические токены ссылаются только на существующие base-группы
4. Файлы тем переопределяют только base-токены
5. Dark-файлы не добавляют новых имён токенов
6. Build output содержит требуемые CSS-переменные
7. Компоненты используют только семантические CSS custom properties

## Лицензия

MIT
