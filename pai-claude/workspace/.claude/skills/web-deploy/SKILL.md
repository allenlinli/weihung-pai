---
name: web-deploy
description: Website deployment to Caddy. Use when user mentions deploy website, create page, update site, publish, reload caddy.
---

# Web Deploy Skill

Deploy websites to Caddy static server.

## Deployment Checklist

**⚠️ Critical workflow (every time):**

### 1. File Location
```bash
/home/pai/merlin/workspace/site/
```

### 2. Create/Edit Files
Use `Write` or `Edit` tool.

### 3. Permission Check (Required)

**Before reloading Caddy, MUST execute:**

```bash
# Set file permissions to 644 (readable)
chmod 644 /home/pai/merlin/workspace/site/<filename>

# Verify permissions
ls -lah /home/pai/merlin/workspace/site/<filename>
```

**Expected output**: `-rw-r--r--` (must start with this)

**For directories**:
```bash
chmod 755 /home/pai/merlin/workspace/site/<dirname>
```

### 4. Reload Caddy
Use MCP tool: `system_reload_caddy`

### 5. Report URL
```
https://merlin-pai.wayneh.tw/<filename>
```

## Common Mistakes

❌ **Wrong**:
1. Create file
2. Reload Caddy ← ⚠️ Forgot permissions!
3. User can't access

✅ **Correct**:
1. Create file
2. **chmod 644** ← Required!
3. **ls -lah verify** ← Required!
4. Reload Caddy
5. Report URL

## Reminders

- ⚠️ **chmod every new file**
- ⚠️ **chmod + verify before reload**
- Site root: `/home/pai/merlin/workspace/site/`
- Domain: https://merlin-pai.wayneh.tw
- Caddy serves directory directly, no build needed
