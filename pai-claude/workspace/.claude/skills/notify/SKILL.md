---
name: notify
description: PAI Bot notification system. Use when long-running tasks, background jobs, reminders, task completion, progress updates needed.
---

# Notify Skill

Send notifications to user via PAI Bot API.

## When to Use

**Required**:
- Long-running tasks (> 1 minute)
- Background jobs
- Batch processing
- Data collection / crawlers
- Model training
- Large file processing

**Optional**:
- Task start with estimated time
- Progress updates
- Warnings or errors
- Key step completion

## API

**Endpoint**: `POST http://127.0.0.1:3000/api/notify`

```json
{
  "message": "Message content",
  "level": "info|warning|error|success"
}
```

## Message Levels

| Level | Use | Icon |
|-------|-----|------|
| `info` | General info, progress | ℹ️ ⏳ |
| `warning` | Warnings, attention needed | ⚠️ |
| `error` | Errors, failures | ❌ |
| `success` | Completed successfully | ✅ |

## Notification Frequency

| Duration | Notifications |
|----------|---------------|
| < 1 min | None needed |
| 1-5 min | Start + Complete |
| 5-30 min | Start + Complete + Errors |
| 30-60 min | Start + 2-3 progress + Complete |
| > 60 min | Start + Every 15 min + Complete |

## Usage Examples

```bash
# Task start
curl -X POST http://127.0.0.1:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "🚀 Task started: Data backup\nEstimated: 5 min", "level": "info"}'

# Progress update
curl -X POST http://127.0.0.1:3000/api/notify \
  -d '{"message": "⏳ Data backup\nCompleted 50/100 files", "level": "info"}'

# Task complete
curl -X POST http://127.0.0.1:3000/api/notify \
  -d '{"message": "✅ Task complete: Data backup\n100 files backed up\n⏱️ Duration: 4m32s", "level": "success"}'

# Error
curl -X POST http://127.0.0.1:3000/api/notify \
  -d '{"message": "❌ Task failed: Data backup\nError: Disk space full", "level": "error"}'
```

## Message Templates

### Start
```
🚀 Task started: [Name]
[Estimated time or scope]
```

### Progress
```
⏳ [Name]
Completed X/Y
[Current item]
```

### Complete
```
✅ Task complete: [Name]
[Key results]
⏱️ Duration: [time]
```

### Error
```
❌ Task failed: [Name]
Error: [message]
[Suggested action]
```

For code examples, see [references/code-examples.md](references/code-examples.md).
