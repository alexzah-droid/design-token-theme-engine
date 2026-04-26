# Project Snapshot

## Текущее состояние

**Статус:** рабочий прототип, активное развитие
**Последнее обновление:** 2026-04-27

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
- **Stage 4b завершён:** bundle-генерация (5 файлов *.bundle.css = токены + components), gas-example/ (Code.gs, Page.html, Styles.html), GAS_GUIDE.md
- **Документация приведена в порядок:** AI_CONTEXT.md — Document Map, Task→File Index, Development Backlog (10 задач), гайды "How to add a component/theme", USAGE.md обновлён, TOKEN_REFERENCE.md создан, ссылка на AI_CONTEXT в CLAUDE.md, переписан theme-engine/README.md
- **Designer brief:** Invoice_mngmnt/DESIGNER_BRIEF.md — анализ v4 vs архитектура, инструкции для дизайнера на v5
- **Stage 6c завершён:** Typography scale (t-display/h1-h3/lead/small/overline/mono), KPI cards (value + delta up/down), filter chips, sortable table headers (aria-sort), table empty state — токены, CSS, preview, TOKEN_REFERENCE обновлены
- **Stage 6b завершён:** Switch/Toggle, Tabs, Accordion, Dropdown, Progress (linear/circular/indeterminate) — semantic tokens, CSS, preview cards с интерактивными демо, TOKEN_REFERENCE.md обновлён
- **Stage 6a завершён:** расширена токен-система (motion, surface2/3, textMuted, soft-статусы, chart-палитра 1–6 + heat, focusRing); components.css — transitions, focus-visible ring, skip-link, prefers-reduced-motion, surface-2/3 utilities, text-muted; все темы обновлены brand-значениями; preview — 13 новых swatches, Motion-карточка с live-демо, A11y & Utilities карточка; TOKEN_REFERENCE.md — 7 новых секций; AI_CONTEXT.md — roadmap Stage 6a–8, DEV-7 в backlog
- **Stage 7 завершён:** Charts subsystem — Sparkline, Area, Bar, Stacked Bar, Donut, Heatmap (color-mix), Gantt; новые токены chart.heatColor/grid/axis/padding/gap/radius; DEV-7 resolved через Variant B (color-mix); validator 7/7 ✅; preview секция 04 Charts добавлена
- **Integrity audit завершён:** исправлен undefined `--on-primary` в .gantt-bar → `--button-text`; TOKEN_REFERENCE базовая таблица дополнена; CHANGELOG v0.3.0 добавлен; package.json 0.2.0→0.3.0
- **Stage 8 завершён:** static state classes (.is-hover/focus/disabled/selected) на button/input/tab/chip/dropdown; viewport simulator (Desktop/Tablet/Mobile) в demo section; CSS grid utilities (.row, .grid-2/3/4/6); preview секция 05 Dev UX; DEV-6 resolved; validator 7/7 ✅

## Что в процессе

_(нет активных задач)_

## Следующие шаги

- **Stage 9** — (не запланирован, TBD)

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
- ~~DEV-7: rgba(var()) в validator~~ — resolved (Stage 7)
