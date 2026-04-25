# Designer Brief — Alignment with Design System Engine 2

**For:** UI Designer (ЗТЗ)
**Version:** v4 reviewed → v5 requirements
**Date:** 2026-04-25

---

## Что сделано хорошо в v4

Прежде чем перейти к изменениям — что работает правильно и должно остаться:

- Нет захардкоженных значений в компонентах. Все компоненты используют `var()` — это ключевой контракт.
- Motion-система (`--dur-*`, `--ease-*`) оформлена правильно и богато.
- Accessibility: focus ring, aria-атрибуты, keyboard navigation в dropdown — всё на месте.
- Адаптивность: responsive layout, viewport simulator — хорошая практика.
- Богатый компонентный набор: switch, dropdown с анимацией, accordion, progress bars, Gantt, charts.

---

## Архитектура, которую мы используем

### 3 слоя токенов

```
tokens/base.json        ← примитивные значения (цвета, отступы, радиусы, типографика)
tokens/semantic.json    ← смысловые маппинги: button.bg → {color.primary}
themes/{name}.json      ← переопределения ТОЛЬКО примитивных токенов
themes/{name}.dark.json ← dark-mode переопределения базовых токенов
```

Сборка (`npm run build`) читает JSON и генерирует CSS-файлы в `dist/`:

```
dist/corporate.css           ← [data-theme="corporate"] { --button-bg: #17311F; ... }
dist/corporate.dark.css      ← [data-theme="corporate"][data-mode="dark"] { ... }
dist/apple.css               ← [data-theme="apple"] { --button-bg: #007aff; ... }
dist/corporate.bundle.css    ← всё вместе (токены + компоненты) для GAS/embed
```

Дизайнер не пишет CSS токены вручную — только JSON. CSS генерируется.

### Переключение темы

```html
<!-- Тема + светлый режим -->
<html data-theme="corporate">

<!-- Тема + тёмный режим -->
<html data-theme="corporate" data-mode="dark">
```

Тема и режим — два независимых атрибута. `data-theme` = бренд/стиль. `data-mode` = свет/тьма.

### Контракты компонентов

Компоненты (в `styles/components.css`) используют только **семантические** CSS-переменные — не примитивы, не brand-токены напрямую:

```css
/* ✅ Правильно */
.button { background: var(--button-bg); color: var(--button-text); }

/* ❌ Неправильно — прямое использование примитива */
.button { background: var(--color-primary); }

/* ❌ Неправильно — захардкоженное значение */
.button { background: #17311F; }
```

---

## Расхождения v4 с нашей архитектурой

### 1. Механизм тем

| v4 (текущий) | v5 (нужно) |
|---|---|
| `data-theme="light"` / `data-theme="dark"` | `data-theme="corporate"` + опционально `data-mode="dark"` |
| light/dark — это названия тем | light/dark — это режим, тема называется по бренду |

**Что изменить:** переименовать темы. Вместо `[data-theme="light"]` использовать `[data-theme="corporate"]` (или `apple`, `minimal`). Dark mode вынести в отдельный атрибут `data-mode`.

Сейчас в `themes.css`:
```css
:root, [data-theme="light"] { --primary: var(--ztz-green-800); }
[data-theme="dark"] { --primary: var(--ztz-gold-500); }
```

Должно стать (генерируется build системой):
```css
[data-theme="corporate"] { --button-bg: #17311F; ... }
[data-theme="corporate"][data-mode="dark"] { --button-bg: #B08A3E; ... }
```

### 2. Структура CSS-переменных

| v4 (текущий) | v5 (нужно) |
|---|---|
| `--primary`, `--bg`, `--surface-1`, `--ink` | `--button-bg`, `--card-bg`, `--text-primary` |
| Shared semantic variables | Component-scoped semantic variables |

В нашей системе семантические токены **привязаны к компоненту**, а не глобальны. Это позволяет каждому компоненту иметь независимую семантику.

**Что изменить:** вместо `--primary` в `.btn` использовать `--button-bg`. Вместо `--ink` в body — `--text-primary`. Это изменение регистрируется в `tokens/semantic.json`.

Пример маппинга, который нужно создать в `tokens/semantic.json`:
```json
{
  "button": {
    "bg": "{color.primary}",
    "text": "{color.onPrimary}",
    "hoverBg": "{color.primaryHover}"
  }
}
```

### 3. Ручной CSS vs сгенерированный

| v4 (текущий) | v5 (нужно) |
|---|---|
| `tokens.css` написан вручную | `tokens/base.json` → генерирует `dist/*.css` |
| `themes.css` написан вручную | `themes/*.json` → генерирует override-блоки |

**Что изменить:** значения бренд-токенов ЗТЗ (цвета зелени, латуни, spacing) нужно перенести в `themes/ztz.json` и `themes/ztz.dark.json`. Build система сгенерирует CSS из них автоматически.

### 4. Именование классов компонентов

| v4 (текущий) | v5 (нужно) |
|---|---|
| `.btn`, `.btn-primary`, `.btn-gold` | `.button` |
| `.check` | `.checkbox-label` |
| `.radio` | `.radio-label` |
| `.badge-ok`, `.badge-danger` | `.badge-success`, `.badge-error` |
| `.alert.is-ok`, `.alert.is-danger` | `.alert-success`, `.alert-error` |

Это изменение затрагивает HTML-разметку. Классы в нашей системе более описательные и без аббревиатур.

### 5. Файл `page-v3.css` содержит прямые ссылки на примитивы

Найдено в `page-v3.css`:
```css
[data-theme="dark"] .top { background: var(--surface-1) }
.brand-mark { border: 1px solid var(--ztz-gold-500); }
```

Прямое использование `--ztz-gold-500` (примитив) — нарушение контракта. Нужно создать семантический токен, например `--brand-accent-border`, и ссылаться на него.

---

## Что оставить как есть (не менять)

- **Motion система** (`--dur-*`, `--ease-*`, `--ease-in-out`) — богаче нашей базовой. Добавить в `tokens/base.json`.
- **Focus ring** (`--focus-ring`) — хорошая практика. Добавить в semantic.json как `--focus-ring`.
- **Компоненты accordion, switch, tabs, dropdown, charts, Gantt** — богаче нашего набора. Подключить к семантическим токенам и добавить в `styles/components.css`.
- **A11y паттерны** (aria-*, keyboard nav) — оставить полностью.
- **Адаптивность** — оставить как есть.

---

## Что дизайнеру нужно подготовить для v5

### JSON-файлы (новый формат)

`themes/ztz.json` — светлая тема ЗТЗ:
```json
{
  "color": {
    "primary": "#17311F",
    "primaryHover": "#1F3D2E",
    "onPrimary": "#EFE9D9",
    "background": "#F6F2EA",
    "surface": "#FFFFFF",
    "border": "rgba(27,28,25,.12)"
  },
  "typography": {
    "fontFamily": "\"PT Sans\", \"Helvetica Neue\", Arial, sans-serif"
  }
}
```

`themes/ztz.dark.json` — тёмная тема ЗТЗ:
```json
{
  "color": {
    "primary": "#B08A3E",
    "primaryHover": "#C9A35A",
    "onPrimary": "#10231A",
    "background": "#0E1A13",
    "surface": "#152921",
    "border": "rgba(239,233,217,.12)"
  }
}
```

### Новые семантические токены

Дизайнер должен передать список компонентов, которые нужно добавить в `tokens/semantic.json`:
- `switch` (toggle) — какие токены нужны
- `tabs` — фон активного таба, цвет индикатора
- `accordion` — border, фон
- `progress` — цвет трека, fill
- `dropdown` — фон списка, hover строки

Формат запроса на каждый компонент:
```
Компонент: switch
Токены:
  - track.bg (неактивный)
  - track.activeBg
  - thumb.bg
```

### HTML-разметка

В следующей версии витрины использовать атрибут темы по новой схеме:

```html
<html data-theme="ztz">
<!-- или -->
<html data-theme="ztz" data-mode="dark">
```

Кнопки-переключатели:
```html
<button onclick="setTheme('ztz')">Light</button>
<button onclick="setMode('dark')">Dark</button>
```

---

## Как добавить новый компонент (процесс)

1. Написать список токенов компонента → передать в `tokens/semantic.json`
2. Написать CSS класс, используя только `var(--component-token-name)`
3. Добавить компонент в `preview/index.html`, секция 02 Components
4. Запустить `npm run validate` — должно пройти 7/7

Подробнее: `AI_CONTEXT.md` → раздел "How to Add a Component".

---

## Файлы для изучения

| Файл | Что там |
|------|---------|
| `AI_CONTEXT.md` | Архитектура, правила, процессы |
| `theme-engine/TOKEN_REFERENCE.md` | Все семантические CSS-переменные с маппингом |
| `theme-engine/README.md` | Как устроена сборка, список компонентов |
| `theme-engine/GAS_GUIDE.md` | Как подключить в GAS |
| `theme-engine/preview/index.html` | Живой пример всех компонентов |

---

## Итог: чеклист для v5

- [ ] Переименовать тему: `light` → `ztz`, `dark` → режим (`data-mode="dark"`)
- [ ] Создать `themes/ztz.json` + `themes/ztz.dark.json` с brand-значениями ЗТЗ
- [ ] Заменить `--primary` / `--ink` / `--bg` в компонентах на `--button-bg` / `--text-primary` / `--page-bg`
- [ ] Убрать прямые ссылки на примитивы (`--ztz-gold-500`) из компонентных CSS
- [ ] Переименовать классы: `.btn` → `.button`, `.check` → `.checkbox-label`, `.badge-ok` → `.badge-success`
- [ ] Добавить motion-токены (`--dur-*`, `--ease-*`) в `tokens/base.json`
- [ ] Передать список компонент-токенов для switch, tabs, accordion, progress, dropdown
- [ ] Обновить HTML-витрину: `<html data-theme="ztz">`
