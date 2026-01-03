# Evening Workflow

晚間回顧流程，總結今日、規劃明日。

## 觸發

- 「晚安」「good night」
- 「今天回顧」「今日總結」

## 執行流程

### 1. 健康總結

```
→ garmin_summary
→ 今日步數達成率
→ 活動紀錄
→ 壓力趨勢
```

### 2. 任務完成度

```
→ google_tasks_list (showCompleted: true)
→ 完成了什麼
→ 還有什麼未完成
```

### 3. 今日記憶

```
→ memory_search "today event"
→ 有什麼重要的事發生
```

## 輸出格式

```markdown
## 今日回顧

### 健康
🚶 步數: X / Goal (X%)
😴 睡眠: 昨晚 X.Xh
😰 壓力: 平均 XX
🏃 活動: [列出今日運動]

### 完成
✅ Task 1
✅ Task 2

### 未完成
⏳ Task 3 → 移到明天 / 調整優先級

### 明日重點
1. ...
2. ...

晚安！休息好，明天繼續加油。
```

## 記憶保存

回顧時保存重要發現：

```
→ 今天完成了重要里程碑
→ memory_save category: "event"

→ 發現任務模式（如：總是拖延某類任務）
→ memory_save category: "preference"

→ 健康異常
→ memory_save category: "health"
```

## 明日建議

根據今日數據：

- 未完成 P0 → 明天優先處理
- 睡眠不足 → 建議早點休息
- 壓力過高 → 建議減少明日負荷
