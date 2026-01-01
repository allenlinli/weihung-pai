# Notify Code Examples

## Python

```python
import time
import requests

def notify(message: str, level: str = "info"):
    """Send notification to PAI Bot"""
    try:
        response = requests.post(
            "http://127.0.0.1:3000/api/notify",
            json={"message": message, "level": level},
            timeout=5
        )
        return response.status_code == 200
    except:
        return False

# Usage
notify("🚀 Task started: AI model training\nEstimated: 30 min", "info")
notify("✅ Task complete: AI model training\nAccuracy: 95.3%", "success")
```

## TypeScript/Bun

```typescript
async function notify(
  message: string,
  level: "info" | "warning" | "error" | "success" = "info"
) {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, level })
    })
    return response.ok
  } catch {
    return false
  }
}

// Usage
await notify("🚀 Task started: Website deployment", "info")
await notify("✅ Task complete: Website deployment\n✨ Site is live", "success")
```

## Full Task Example (Python)

```python
import time
import requests

def notify(message, level="info"):
    requests.post("http://127.0.0.1:3000/api/notify",
                  json={"message": message, "level": level})

# Task start
notify("🚀 Task started: Large task\nEstimated: 10 min", "info")

try:
    start_time = time.time()

    # Execute task
    for i in range(100):
        # ... processing ...

        # Progress update every 20%
        if (i + 1) % 20 == 0:
            notify(f"⏳ Large task\nCompleted {i+1}/100", "info")

    # Calculate duration
    elapsed = time.time() - start_time
    duration = f"{int(elapsed // 60)}m{int(elapsed % 60)}s"

    # Completion notification
    notify(f"✅ Task complete: Large task\n✅ Processed 100 items\n⏱️ Duration: {duration}", "success")

except Exception as e:
    notify(f"❌ Task failed: Large task\nError: {str(e)}", "error")
```

## Template Patterns

### Data Processing
```python
# Start
notify(f"🚀 Task started: {task_name}\nProcessing {total} items", "info")

# Progress (every N items)
notify(f"⏳ {task_name}\nProcessed {processed}/{total}", "info")

# Complete
notify(f"✅ Task complete: {task_name}\n✅ Success: {success}\n❌ Failed: {failed}\n⏱️ Duration: {duration}", "success")
```

### Optimization/Training
```python
# Start
notify(f"🚀 Task started: {task_name}\n{trials} trials", "info")

# Progress (every N trials)
notify(f"⏳ {task_name}\nCompleted {completed}/{trials}\nBest so far: {best_score}", "info")

# Complete
notify(f"✅ Task complete: {task_name}\n🏆 Best result: {best_result}\n⏱️ Duration: {duration}", "success")
```

### Website Deployment
```bash
# Start
curl -X POST http://127.0.0.1:3000/api/notify \
  -d '{"message": "🚀 Task started: Website deployment\nTarget: production", "level": "info"}'

# Complete
curl -X POST http://127.0.0.1:3000/api/notify \
  -d '{"message": "✅ Website deployment complete\n✨ Site is live\n🔗 https://example.com", "level": "success"}'
```
