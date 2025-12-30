---
name: google
description: Google 服務整合。USE WHEN 使用者提到 日曆, calendar, 行程, 會議, 雲端硬碟, drive, 檔案, gmail, 郵件, email, 寄信, 聯絡人, contacts, 通訊錄。
---

# Google Skill

存取 Wei-Hung 的 Google 服務：日曆、雲端硬碟、Gmail、聯絡人。

## API 存取

所有 Google 操作透過本機 API（`http://127.0.0.1:3000/api/google/*`）執行。

### 檢查狀態

```bash
curl -s http://127.0.0.1:3000/api/google/status
```

## 日曆 (Calendar)

### 查看行程

```bash
# 查看今天的行程
curl -s "http://127.0.0.1:3000/api/google/calendar/events?maxResults=10"

# 查看特定時間範圍
curl -s "http://127.0.0.1:3000/api/google/calendar/events?timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-31T23:59:59Z"

# 搜尋行程
curl -s "http://127.0.0.1:3000/api/google/calendar/events?q=會議"
```

### 建立行程

```bash
curl -s -X POST http://127.0.0.1:3000/api/google/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "summary": "會議標題",
      "description": "會議描述",
      "start": {"dateTime": "2024-01-15T10:00:00+08:00"},
      "end": {"dateTime": "2024-01-15T11:00:00+08:00"},
      "location": "地點"
    }
  }'
```

## 雲端硬碟 (Drive)

### 列出檔案

```bash
# 列出最近的檔案
curl -s "http://127.0.0.1:3000/api/google/drive/files"

# 列出特定資料夾的檔案
curl -s "http://127.0.0.1:3000/api/google/drive/files?folderId=FOLDER_ID"
```

### 搜尋檔案

```bash
curl -s "http://127.0.0.1:3000/api/google/drive/search?query=報告"
```

### 讀取檔案內容

```bash
# 取得檔案資訊
curl -s "http://127.0.0.1:3000/api/google/drive/file/FILE_ID"

# 取得檔案內容（純文字檔案）
curl -s "http://127.0.0.1:3000/api/google/drive/file/FILE_ID?content=true"
```

## Gmail

### 查看郵件

```bash
# 列出最近郵件
curl -s "http://127.0.0.1:3000/api/google/gmail/messages"

# 搜尋郵件
curl -s "http://127.0.0.1:3000/api/google/gmail/messages?q=from:someone@example.com"

# 讀取郵件內容
curl -s "http://127.0.0.1:3000/api/google/gmail/message/MESSAGE_ID"
```

### 寄送郵件

```bash
curl -s -X POST http://127.0.0.1:3000/api/google/gmail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "郵件主旨",
    "body": "郵件內容"
  }'
```

## 聯絡人 (Contacts)

### 查看聯絡人

```bash
# 列出聯絡人
curl -s "http://127.0.0.1:3000/api/google/contacts"

# 搜尋聯絡人
curl -s "http://127.0.0.1:3000/api/google/contacts/search?query=John"
```

## 注意事項

1. 所有 API 只能從本機存取（127.0.0.1）
2. 寄送郵件前請確認收件人和內容
3. 刪除操作不可逆，謹慎使用
4. 時間格式使用 ISO 8601（如 `2024-01-15T10:00:00+08:00`）
