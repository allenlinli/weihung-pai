# Investment Domain

投資追蹤與管理。

## 觸發

- 「股票」「投資」「持倉」「買」「賣」
- 「AAPL」「TSM」等股票代號
- 「watchlist」「觀察」「追蹤」

## 數據來源

### Memory (category: investment)

投資紀錄：
- 買入紀錄（日期、價格、數量）
- 賣出紀錄
- 觀察清單
- 投資筆記

### Memory (category: watchlist)

持續追蹤：
- 觀望中的股票
- 關注的價位
- 投資想法

## 使用流程

### 「我買了 XXX 在 $YYY」

```
1. 解析股票代號和價格
2. memory_save:
   content: "YYYY-MM-DD 買入 XXX @ $YYY"
   category: "investment"
   importance: 4
3. 確認已記錄
```

### 「我賣了 XXX」

```
1. memory_search 找到原始買入紀錄
2. 計算損益
3. memory_save:
   content: "YYYY-MM-DD 賣出 XXX @ $YYY (損益: +X%)"
   category: "investment"
   importance: 4
```

### 「我的持倉」

```
1. memory_search "買入 investment"
2. 過濾掉已賣出的
3. 列出目前持倉
```

### 「XXX 現在多少」

```
1. memory_search "XXX"
2. 找到相關紀錄（買入價、觀察價位）
3. 如需查詢現價 → 提示用戶或用 web search
4. 比對買入成本
```

### 「幫我追蹤 XXX 到 $YYY」

```
1. memory_save:
   content: "觀察 XXX - 目標價 $YYY"
   category: "watchlist"
   importance: 4
2. Morning workflow 會提醒
```

## 記憶格式

### 買入紀錄

```
content: "2024-01-15 買入 AAPL 10股 @ $180"
category: "investment"
importance: 4
```

### 賣出紀錄

```
content: "2024-02-01 賣出 AAPL 10股 @ $195 (損益: +8.3%)"
category: "investment"
importance: 4
```

### 觀察清單

```
content: "觀察 TSM - 目標買入價 $150 以下"
category: "watchlist"
importance: 3
```

### 投資筆記

```
content: "看好 AI 領域長期發展，持續關注 NVDA, AMD"
category: "investment"
importance: 3
```

## 輸出格式

### 持倉報告

```markdown
### 投資持倉

**目前持有**
| 股票 | 買入價 | 數量 | 買入日期 |
|------|--------|------|----------|
| AAPL | $180 | 10 | 2024-01-15 |
| TSM | $145 | 20 | 2024-01-20 |

**觀察清單**
- NVDA: 目標價 $800 以下
- AMD: 持續關注

**近期交易**
- 2024-01-15 買入 AAPL @ $180
```

### 單一股票查詢

```markdown
### AAPL

**持倉**
- 買入: $180 x 10股 (2024-01-15)
- 成本: $1,800

**相關記憶**
- 看好 Apple Vision Pro 發展
- 長期持有計畫
```

## 主動行為

### Morning Workflow

```
→ memory_search "investment watchlist"
→ 列出追蹤中的股票
→ 提醒觀察價位
```

### 到達目標價

如果用戶提到某股票價格：
```
→ memory_search 該股票
→ 如果有設定目標價
→ 比對是否到達
→ 主動提醒
```

## 注意事項

- 不提供投資建議
- 只負責記錄和追蹤
- 用戶自行決定買賣
- 可查詢但不會自動交易
