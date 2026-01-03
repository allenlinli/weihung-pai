# Weekly Workflow

每週回顧流程。

## 觸發

- 「週報」「weekly」「這週回顧」
- 每週日晚間主動提醒

## 執行流程

### 1. 健康週報

```
→ 過去 7 天 garmin_summary
→ 平均睡眠時間
→ 平均步數
→ 運動次數
→ 壓力趨勢
```

### 2. 任務回顧

```
→ 本週完成的任務
→ 未完成的任務
→ 新增的任務
```

### 3. 追蹤項目更新

```
→ memory_search "investment"
→ memory_search "watchlist"
→ 本週有什麼變化
```

### 4. 記憶回顧

```
→ memory_list (limit: 20)
→ 本週保存了什麼重要記憶
```

## 輸出格式

```markdown
## 本週回顧 (W1 2024)

### 健康
- 平均睡眠: X.Xh
- 平均步數: X,XXX
- 運動: X 次
- 壓力趨勢: 穩定 / 上升 / 下降

### 完成
- ✅ 重要事項 1
- ✅ 重要事項 2

### 進行中
- 🔄 Project A (進度 XX%)
- 🔄 Project B

### 追蹤更新
- 📈 AAPL: 持倉成本 $180
- 🔍 X 項目: 有新進展

### 下週重點
1. ...
2. ...
```

## 記憶保存

週報時保存週級別的觀察：

```
→ 本週完成了重要里程碑
→ memory_save category: "event" importance: 4

→ 發現長期模式
→ memory_save category: "preference"
```
