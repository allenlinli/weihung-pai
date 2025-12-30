# History System (UOCS)

Universal Output Capture System - 自動記錄所有工作內容。

## 目錄結構

```
history/
├── sessions/      # 會話紀錄
├── learnings/     # 學習成果
├── research/      # 研究發現
└── decisions/     # 決策紀錄
```

## Sessions

每次會話結束時自動記錄。

**檔案格式**：`YYYY-MM-DD-HHMM-{topic}.md`

```markdown
# Session: {topic}
Date: YYYY-MM-DD HH:MM
Duration: {minutes}

## Summary
{1-3 句摘要}

## Key Actions
- {action 1}
- {action 2}

## Learnings
- {learning 1}

## Follow-ups
- [ ] {todo 1}
```

## Learnings

從會話中提取的可複用知識。

**目錄結構**：按類別分類
- `learnings/typescript/`
- `learnings/infrastructure/`
- `learnings/debugging/`

## Research

調查研究的結果。

**檔案格式**：`{topic}/README.md` + 相關資料

## Decisions

重要決策及其理由。

**檔案格式**：`YYYY-MM-DD-{decision}.md`

```markdown
# Decision: {title}
Date: YYYY-MM-DD

## Context
{為什麼需要做這個決策}

## Options Considered
1. {option 1} - {pros/cons}
2. {option 2} - {pros/cons}

## Decision
{選擇的方案}

## Rationale
{為什麼選這個}
```
