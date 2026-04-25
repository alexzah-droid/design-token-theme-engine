# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Design System Engine 2

## Назначение

Token-based theme engine for building consistent UI design systems. Generates scoped CSS custom properties from JSON design tokens. Supports multiple themes and light/dark modes with zero runtime dependencies — pure HTML/CSS/JS.

## Команды

Все команды запускаются из `theme-engine/`:

```bash
npm run build     # генерация dist/*.css + dist/*.bundle.css из tokens/ + themes/
npm run validate  # проверка архитектурных инвариантов
```

Предпросмотр: открыть `theme-engine/preview/index.html` в браузере.

## Архитектура

**3-слойная модель токенов:**

```
tokens/base.json          → примитивные значения (цвета, отступы, типографика)
tokens/semantic.json      → смысловые маппинги через {color.primary} синтаксис
themes/{name}.json        → переопределения ТОЛЬКО примитивных токенов
themes/{name}.dark.json   → dark-mode переопределения (отдельный файл)
```

**Пайплайн сборки** (`build/build-theme.js`):
1. `deepMerge(base, theme)` — слияние базовых токенов с переопределениями темы
2. `resolveToken()` — разрешение `{reference}` ссылок в семантических токенах
3. `flattenTokens()` — вложенный объект → CSS-переменные в kebab-case
4. Генерация в `dist/` с селекторами `[data-theme="name"]` / `[data-theme="name"][data-mode="dark"]`
5. `buildBundle()` — генерация `*.bundle.css` (токены темы + `components.css` в одном файле)

**Переключение тем:** атрибуты `data-theme` и `data-mode` на корневом элементе HTML.

**Текущие темы:** `corporate` (+ dark), `apple` (+ dark), `minimal`.

**Компоненты** (`styles/components.css`): используют исключительно семантические CSS-переменные — никаких прямых значений.

**GAS Embed** (`gas-example/`, `GAS_GUIDE.md`): интеграция с Google Apps Script HTML Service через bundle-файлы. Bundle = токены + компоненты в одном файле, готов к вставке в `Styles.html`. Подробности — `GAS_GUIDE.md`.

## Контракты

Инварианты, проверяемые `validate.js` (нарушать нельзя):

1. `styles/components.css` — запрещены любые HEX/rgb/rgba/hsl значения, только `var(--semantic-token)`
2. `styles/components.css` — запрещено использовать base-токены напрямую (`--color-primary`), только семантические (`--button-bg`)
3. Семантические токены ссылаются только на существующие группы base-токенов
4. Файлы тем переопределяют только base-токены (color/spacing/radius/typography/shadow)
5. Dark-темы не добавляют новых имён токенов — только переопределяют существующие base-значения

---

## Операционный режим

Ты — менеджер этого проекта. Работаешь автономно.

**На входе:** техническое задание от пользователя.

**Твои действия:**
1. Декомпозируй задачу на подзадачи
2. Определи, что делаешь сам (< 2 мин), что делегируешь субагентам
3. Запусти субагентов параллельно на независимые задачи
4. Координируй, отслеживай результаты, интегрируй
5. После каждого субагента: коммит + обновление SNAPSHOT.md
6. Отчитайся по результату

**Полная автономность** во всём, кроме production deploy — его всегда подтверждай с пользователем.

**Не дёргай пользователя.** Никогда не спрашивай подтверждения на технические действия. Пользователь даёт ТЗ и ждёт результат. Создание файлов, запуск тестов, коммиты, рефакторинг, выбор подхода, staging deploy — всё это твои решения.

## Подсистемы

| Слой | Путь | Назначение |
|------|------|-----------|
| Правила | `.claude/rules/` | Операционные правила, загружаются по контексту |
| Навыки | `.claude/skills/` | Модульные операции, вызываются по запросу |
| Агенты | `.claude/agents/` | Субагенты для делегирования |
| Хуки | `.claude/hooks/` | Автоматические guardrails (работают фоном) |
| Логи | `.claude/logs/` | Сессии, миграции, ошибки (gitignored) |
| Состояние | `.claude/SNAPSHOT.md` | Текущее состояние проекта |
| Метаданные | `manifest.md` | Имя проекта, режим коммитов (repo_access) |
| Скрипты режима | `scripts/` | Helper'ы для framework state и переключения repo_access |

### Фоновая автоматика (hooks)

Хуки — это **напоминания и подстраховка**, не enforcement. Они срабатывают автоматически в фоне:

- **PostToolUse** → checkpoint каждые 20 tool calls: если есть незакоммиченные файлы — напоминание коммитить
- **SubagentStop** → после каждого субагента: напоминание о цикле commit → SNAPSHOT → integrate (логика в delegation.md)
- **PreCompact** → перед compaction: автоматический commit tracked (не untracked!) изменений + обновление SNAPSHOT timestamp; в shared/public режиме сначала проверяет, что framework files уже не tracked
- **PostCompact** → после compaction: вывод содержимого SNAPSHOT + последних коммитов для восстановления контекста

### Стандартные навыки

- `/start` — инициализация сессии (загрузить состояние, доложить готовность)
- `/finish` — завершение сессии (тесты, коммит, обновление SNAPSHOT)
- `/testing` — запуск тестов (unit + integration)
- `/playwright` — E2E тесты UI (если применимо)
- `/db-migrate` — миграция схемы SQLite → облако
- `/housekeeping` — обслуживание проекта: README, CHANGELOG, версия, .gitignore, drift (вызывай перед push)

### Repo Access

- `repo_access=private-solo` → framework files можно хранить в git-истории
- `repo_access=public` / `private-shared` → framework files должны оставаться локальными
- Для переключения режима используй `scripts/switch-repo-access.sh`
- Если проект уже успел закоммитить framework files как `private-solo`, одного изменения `.gitignore` недостаточно

### Стандартные агенты

- `researcher` — исследование, поиск по коду и документации
- `implementer` — реализация кода > 50 строк, новые модули
- `reviewer` — code review, проверка качества

### Правила (всегда в контексте)

- `autonomy.md` — цикл deficit → blocker → unblock, anti-paralysis
- `delegation.md` — критерии делегирования, обязательный коммит после субагента
- `context-management.md` — защита от деградации контекста, pre/post compaction
- `production-safety.md` — production deploy только с подтверждением
- `local-first.md` — разработка на SQLite, миграция в облако после стабилизации
- `commit-policy.md` — что коммитить, что нет, три режима по типу проекта
- `logging.md` — локальное логирование сессий, миграций, ошибок
