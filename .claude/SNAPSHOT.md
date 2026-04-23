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

## Что в процессе

_(нет активных задач)_

## Известные проблемы

**Medium:**
- Validator падает на `.DS_Store` файлах (macOS)
- Corporate тема: `radius.lg` = 6px, но компоненты используют 2px/4px (несоответствие)

**Low:**
- Apple hover светлее primary (спорно)
- `checkBuildOutput()` в validate.js хрупкий для dark-mode файлов
- Избыточная функция `checkSemantic()` в validate.js
- Мёртвый код `mode="global"` в build-theme.js
- Нет `package.json` в корне проекта

## Следующие шаги

**Stage 2:**
- header / navbar
- page layout (content area, sidebar option)

**Технический долг:**
- Инициализировать git-репозиторий
- Исправить crash validator на .DS_Store
