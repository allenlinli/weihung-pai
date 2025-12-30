# PAI 實施待辦清單

基於 `pai.md` 規格書，追蹤剩餘實施項目。

---

## 階段一：基礎建設（補完）

### 1.1 Context 系統
- [ ] 建立 `pai-claude/context/Identity.md`
- [ ] 建立 `pai-claude/context/Principles.md`
- [ ] 建立 `pai-claude/context/Contacts.md`（可選）

#### Identity.md 規格
```markdown
---
name: Identity
description: Merlin 的核心身份定義
---

## 基本資訊
- 名稱：Merlin
- 角色：Wei-Hung 的專屬數位魔法師
- 主人：Wei-Hung (WayDoSoft)

## 專業領域
- 全端工程（TypeScript, Vue, React）
- 基礎設施（Nomad, Consul, Caddy）
- ERP/MES/APS 系統

## 溝通風格
- 語言：繁體中文優先
- 風格：睿智、幽默、適度魔法比喻
```

#### Principles.md 規格
```markdown
---
name: Principles
description: 核心行為原則
---

## 決策階層
1. Goal → 先釐清目標
2. Code → 能寫腳本解決嗎？
3. CLI → 有現成工具嗎？
4. Prompts → 需要 AI 嗎？
5. Agents → 需要專業 AI 嗎？

## 核心原則
1. Clear Thinking > Prompting
2. Scaffolding > Model
3. As Deterministic as Possible
4. Code Before Prompts
5. Spec / Test First
6. UNIX Philosophy
```

---

## 階段二：Skills 開發（補完）

### 2.1 ERP-Domain Skill
- [ ] 建立 `pai-claude/skills/erp-domain/SKILL.md`
- [ ] 建立 `pai-claude/skills/erp-domain/workflows/work-order.md`
- [ ] 建立 `pai-claude/skills/erp-domain/workflows/scheduling.md`
- [ ] 建立 `pai-claude/skills/erp-domain/workflows/inventory.md`

#### SKILL.md 規格
```markdown
---
name: ERP-Domain
description: ERP/MES/APS 領域知識。
  USE WHEN 使用者提到 erp, mes, aps, 工單, 排程, 物料,
  生產, 製造, 庫存, bom, mrp, 產能。
---

## Workflow Routing
- 工單管理 → workflows/work-order.md
- 排程規劃 → workflows/scheduling.md
- 庫存物料 → workflows/inventory.md

## Domain Knowledge

### 工單管理 (Work Order)
- 工單狀態流程：草稿 → 已發放 → 進行中 → 完工 → 結案
- 工單類型：標準工單、返工單、重工單
- 關聯：BOM、製程、產線、機台

### 排程 (APS)
- 有限產能排程 vs 無限產能排程
- 排程邏輯：前推、後推、瓶頸優先
- 考量因素：機台產能、人力、物料齊備

### 物料管理 (MRP)
- BOM 展開邏輯
- 安全庫存計算
- 採購建議生成
```

### 2.2 Database Skill（可選）
- [ ] 建立 `pai-claude/skills/database/SKILL.md`
- [ ] 建立 `pai-claude/skills/database/workflows/schema-design.md`
- [ ] 建立 `pai-claude/skills/database/workflows/query-optimization.md`

---

## 階段三：自動化整合

### 3.1 History 系統 (UOCS)
- [ ] 建立 `pai-claude/history/` 目錄結構
- [ ] 實作 Session 記錄機制
- [ ] 實作 Learnings 記錄機制

#### 目錄結構
```
pai-claude/history/
├── sessions/          # 會話紀錄 (YYYY-MM-DD-HHMM-topic/)
├── learnings/         # 學習成果
├── research/          # 研究發現
└── decisions/         # 決策紀錄
```

#### Session 記錄格式
```markdown
# Session: {topic}
Date: {YYYY-MM-DD HH:MM}
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

### 3.2 Hook 系統完善
- [ ] 完善 `scripts/on-session-start.ts`
- [ ] 完善 `scripts/on-stop.ts`
- [ ] 建立 `scripts/pre-tool-use.ts`（安全驗證）

#### on-session-start.ts 規格
```typescript
// 功能：
// 1. 載入 Context（Identity, Principles）
// 2. 檢查未完成任務
// 3. 初始化 Session 記錄
```

#### on-stop.ts 規格
```typescript
// 功能：
// 1. 生成 Session 摘要
// 2. 保存到 history/sessions/
// 3. 提取 Learnings 保存
```

#### pre-tool-use.ts 規格
```typescript
// 功能：
// 1. Prompt Injection 檢測
// 2. Command Injection 檢測
// 3. Path Traversal 檢測
// 4. 可疑內容警告
```

### 3.3 安全層
- [ ] 實作基本注入攻擊檢測
- [ ] 建立安全白名單機制

---

## 階段四：Agent 系統

### 4.1 預定義 Agent
- [ ] 建立 `pai-claude/agents/Engineer.md`
- [ ] 建立 `pai-claude/agents/Architect.md`
- [ ] 建立 `pai-claude/agents/Researcher.md`
- [ ] 建立 `pai-claude/agents/QATester.md`

#### Agent 模板
```markdown
---
name: {AgentName}
expertise: {專長領域}
personality:
  - {特質 1}
  - {特質 2}
skills:
  - {Skill 1}
  - {Skill 2}
---

## Approach
當收到任務時，你會：
1. {步驟 1}
2. {步驟 2}

## Response Style
- {風格描述}
```

#### Engineer.md 規格
```markdown
---
name: Engineer
expertise: 技術實作、TDD、TypeScript
personality:
  - 精確
  - 系統化
  - 測試優先
skills:
  - development
  - database
---

## Approach
1. 先寫測試（TDD）
2. 實作最小可行方案
3. 重構優化
4. 補充文件

## Response Style
- 直接、技術性
- 提供程式碼範例
- 解釋設計決策
```

#### Architect.md 規格
```markdown
---
name: Architect
expertise: 系統設計、策略規劃、技術選型
personality:
  - 策略性
  - 批判性
  - 長遠思考
skills:
  - infrastructure
  - research
---

## Approach
1. 理解需求與限制
2. 評估多種方案
3. 權衡取捨
4. 提出建議架構

## Response Style
- 結構化分析
- 提供多種選項
- 說明權衡考量
```

### 4.2 MCP Server 擴展
- [ ] 新增 `get_history` tool（讀取歷史記錄）
- [ ] 新增 `save_learning` tool（保存學習成果）
- [ ] 整合 Nomad/Consul API（可選）

---

## 優先順序建議

### Phase A（立即）
1. Context 系統（Identity.md, Principles.md）
2. ERP-Domain Skill

### Phase B（短期）
3. History 目錄結構
4. Agent 定義（Engineer, Architect）

### Phase C（中期）
5. Hook 系統完善
6. 安全層基礎實作

### Phase D（長期）
7. 完整 UOCS 實作
8. MCP Server 擴展
9. 其餘 Agent（Researcher, QATester）

---

## 完成標記

完成項目後，將 `[ ]` 改為 `[x]`。

Last Updated: 2024-12-30
