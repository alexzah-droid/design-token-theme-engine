# Project Snapshot

## Текущее состояние

**Статус:** рабочий прототип, готов к развитию
**Последнее обновление:** 2026-04-24

## Что сделано

- CLAUDE.md инициализирован с реальным контентом (цель, команды, архитектура, контракты)
- manifest.md: project_name заполнен
- theme-engine: 3 темы (corporate + dark, apple + dark, minimal), build pipeline, validator
- REVIEW-01: 6 критических проблем выявлено и исправлено
- REVIEW-02: подтверждено исправление, выявлено 7 дополнительных проблем (medium/low)
- **Stage 1 завершён:** добавлены компоненты label, select, table, badge (4 варианта); preview пересобран как Invoice Manager demo page; все 7 validator checks прошли
- **Stage 2 завершён:** компоненты nav, nav-brand, nav-actions, page-layout, page-sidebar, page-content, sidebar-link; preview обновлён до SPA-лейаута; исправлен crash validator на .DS_Store; .gitignore: добавлено исключение !theme-engine/build/
- **Stage 3 завершён:** компоненты textarea, checkbox/checkbox-label, radio/radio-label, alert (4 варианта), pagination/pagination-item (active/disabled); preview расширен алертами, форм-карточкой, пагинацией

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

**Preview redesign (приоритет 1):**

Цель: из «app demo» → полноценный component explorer уровня отраслевого стандарта.
Референс: структура и интерактивность ztz-ui-kit-v2.html, адаптированная под наши классы/токены.

Принципы:
- Одна тема одновременно: грузить только активный CSS динамически (script-тег), не хардкодить все 5 файлов
- Никакого `<select>` для переключения — компактные кнопки-иконки в sticky хедере
- Структура нумерованными секциями с якорной навигацией

Структура нового preview/index.html:

**01 Foundations**
- Color tokens: semantic swatches (button-bg, card-bg, badge-success-bg и т.д.) с именем переменной
- Typography: шкала (heading → label → text → text-secondary) с font-size, weight, letter-spacing

**02 Components** (каждая группа — карточка с заголовком, все варианты и состояния рядом)
- Buttons: normal / hover-demo / disabled
- Badges: success / warning / error / neutral
- Alerts: success / warning / error / info
- Inputs: input / select / textarea (normal + placeholder + disabled)
- Checkboxes & Radios: checked / unchecked / группы
- Table: с данными, header-highlight, row-hover
- Pagination: все состояния (active / disabled / normal)
- Nav: nav + nav-brand + nav-actions
- Layout: page-layout / sidebar / content схема

**03 Live demo**
- Полноценный Invoice Manager (текущий контент, очищенный)
- Всё работает в контексте реального приложения

JS-логика:
- При смене темы: удалить текущий `<link>` с CSS, добавить новый для выбранной темы
- При смене mode (light/dark): добавлять/убирать `data-mode="dark"` на `<html>`
- Показывать note если dark не поддерживается (minimal)
- Sticky хедер с logo + theme switcher + mode toggle + anchor nav

**Stage 4 (после preview):**
- GAS embed story: single-file bundle CSS на тему + пример HTML Service integration

**Технический долг:**
- Corporate тема: radius.lg несоответствие
