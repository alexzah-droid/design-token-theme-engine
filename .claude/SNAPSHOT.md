# Project Snapshot

## Текущее состояние

**Статус:** рабочий прототип, готов к развитию
**Последнее обновление:** 2026-04-25

## Что сделано

- CLAUDE.md инициализирован с реальным контентом (цель, команды, архитектура, контракты)
- manifest.md: project_name заполнен
- theme-engine: 3 темы (corporate + dark, apple + dark, minimal), build pipeline, validator
- REVIEW-01: 6 критических проблем выявлено и исправлено
- REVIEW-02: подтверждено исправление, выявлено 7 дополнительных проблем (medium/low)
- **Stage 1 завершён:** добавлены компоненты label, select, table, badge (4 варианта); preview пересобран как Invoice Manager demo page; все 7 validator checks прошли
- **Stage 2 завершён:** компоненты nav, nav-brand, nav-actions, page-layout, page-sidebar, page-content, sidebar-link; preview обновлён до SPA-лейаута; исправлен crash validator на .DS_Store; .gitignore: добавлено исключение !theme-engine/build/
- **Stage 3 завершён:** компоненты textarea, checkbox/checkbox-label, radio/radio-label, alert (4 варианта), pagination/pagination-item (active/disabled); preview расширен алертами, форм-карточкой, пагинацией
- **Preview redesign завершён:** из app demo → component explorer; sticky хедер с переключателями тем/режимов, секции 01 Foundations / 02 Components / 03 Live Demo, динамическая загрузка CSS одной темы
- **Stage 5 завершён:** bundle-генерация (5 файлов *.bundle.css = токены + components), gas-example/ (Code.gs, Page.html, Styles.html), GAS_GUIDE.md
- **Документация приведена в порядок:** AI_CONTEXT.md обновлён (статусы стадий, GAS embed, Preview), добавлены Document Map и Task→File Index, Development Backlog (10 задач), ссылка на AI_CONTEXT в CLAUDE.md, переписан theme-engine/README.md

## Что в процессе

_(нет активных задач)_


## Известные проблемы

**Medium:**
- ~~Validator падает на `.DS_Store` файлах (macOS)~~ — исправлено
- Corporate тема: `radius.lg` = 6px, но компоненты используют 2px/4px (несоответствие)

**Low:**
- Apple hover светлее primary (спорно)
- `checkBuildOutput()` в validate.js хрупкий для dark-mode файлов
- Избыточная функция `checkSemantic()` в validate.js
- Мёртвый код `mode="global"` в build-theme.js
- Нет `package.json` в корне проекта

## Следующие шаги

**Следующие задачи (из Backlog в AI_CONTEXT.md):**
- DOC-1: обновить/удалить устаревший `theme-engine/USAGE.md`
- DOC-2: сгенерировать `TOKEN_REFERENCE.md` — таблица всех семантических токенов
- DEV-1: гайд "How to add a component" в AI_CONTEXT.md
- DEV-2: гайд "How to add a theme" в AI_CONTEXT.md
- Stage 5: Validate on Invoice_mngmnt (сначала написать DoD)

**Технический долг:**
- corporate тема: radius.lg несоответствие (низкий приоритет)

**Технический долг:**
- Corporate тема: radius.lg несоответствие
