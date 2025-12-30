---
name: deploy-bot
description: 部署 PAI Bot 到 VPS
arguments:
  - name: target
    description: 部署目標 (預設 pai-server)
    required: false
---

# 部署 PAI Bot

執行 Ansible playbook 將 Bot 部署到 VPS。

## 流程

### 1. 檢查狀態

確認本地變更已 commit：

```bash
git status
```

### 2. 執行部署

```bash
cd ansible && ansible-playbook playbooks/deploy-bot.yml
```

### 3. 驗證

部署完成後檢查 Bot 狀態：

```bash
cd ansible && ansible pai-server -m shell -a "pm2 status"
```

## 範例

```
/deploy-bot
/deploy-bot pai-server
```
