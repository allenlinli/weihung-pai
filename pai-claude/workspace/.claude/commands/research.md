---
name: research
description: 執行深度研究流程
arguments:
  - name: topic
    description: 研究主題
    required: true
---

# Deep Research

執行 research skill 的深度研究流程。

## Process

1. 載入 `research` skill
2. 以 `$ARGUMENTS` 作為研究主題
3. 執行 `workflows/deep-research.md` 流程
4. 輸出結構化研究報告

## Reference

參考 `.claude/skills/research/workflows/deep-research.md` 執行完整流程。
