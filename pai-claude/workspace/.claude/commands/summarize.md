---
name: summarize
description: 摘要內容
arguments:
  - name: content
    description: 要摘要的內容或 URL
    required: true
---

# Summarize

執行 fabric skill 的摘要功能。

## Process

1. 載入 `fabric` skill
2. 以 `$ARGUMENTS` 作為輸入
3. 執行 `workflows/summarize.md` 流程
4. 輸出結構化摘要

## Reference

參考 `.claude/skills/fabric/workflows/summarize.md` 執行完整流程。
