# Morning Workflow

早間規劃流程，整合健康、行程、任務。

## 觸發

- 「早安」「早」「morning」
- 「今天有什麼」「今日規劃」

## 執行流程

### 1. 健康狀態

```
→ garmin_summary
→ 檢查睡眠品質、Body Battery
→ 如果異常（睡眠 < 6h 或 Body Battery < 30）→ 提醒
```

### 2. 今日行程

```
→ google_calendar_events (今天)
→ 整理成時間軸
→ 標註重要會議
```

### 3. 待辦事項

```
→ google_tasks_list
→ 按優先級排序
→ 標註 P0 任務
```

### 4. 追蹤項目

```
→ memory_search "watchlist"
→ memory_search "investment"
→ 列出需要關注的項目
```

## 輸出格式

```markdown
## 早安！今日概覽

### 健康
😴 睡眠: X.Xh (品質)
🔋 Body Battery: XX
❤️ 靜息心率: XX

### 行程
09:00 - 會議 A
14:00 - 會議 B

### 待辦
**P0 必做**
- [ ] Task 1
- [ ] Task 2

**P1 重要**
- [ ] Task 3

### 追蹤
- 📈 [投資] AAPL 持倉成本 $180
- 🔍 [觀察] X 項目進度
```

## 主動建議

根據數據給出建議：

- 睡眠不足 → 建議今天減少負荷
- 行程密集 → 建議先處理 P0
- Body Battery 低 → 建議安排休息時間

## 記憶保存

如果發現特別的 pattern：
- 連續幾天睡眠不佳
- 某類任務反覆出現

→ memory_save 記錄觀察
