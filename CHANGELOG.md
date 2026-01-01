# Changelog

## v0.1.0 (2025-01-01)

### Features

- add task interruption with /stop command
- save file download messages to conversation history
- add telegram file attachment handler
- replace nginx with caddy for automatic HTTPS
- add scheduler with MCP tools and auto migration
- register bot commands with Telegram
- add clean-logs playbook
- add Google MCP server and ufw firewall setup
- add nginx static site deployment with vault-managed domain
- add telegram notification hooks for claude code events
- add Google Calendar integration with OAuth flow
- add Python 3.14 installation via deadsnakes PPA
- add GitHub Actions auto-deploy workflow
- add streaming response and MarkdownV2 support for Telegram bot
- integrate Fabric patterns for content processing
- add PreToolUse security hook and fix script paths
- enhance session stop hook with template
- add agents, history structure and enhanced session hook
- add Claude Code project configuration
- initial PAI infrastructure setup

### Fixes

- correct setup wizard command hints and SSH key regeneration logic
- add .env.example symlink in pai-bot for local dev
- use ~/.claude as default project dir on VPS
- correct fabric role to deploy to user home directory
- correct setup-vps.yml path references in init playbooks
- use null char placeholders for markdown code blocks
- add conditional deployment based on changed directories
- add bun-types for pai-claude scripts
- ansible playbook improvements
- correct vault password file path and SSH key env var
- use cwd for MCP server path

### Performance

- skip bun install when no changes detected

### Refactor

- migrate to uv and replace shell scripts with Python CLI
- move local SSH key path to vault config
- update download path and fix deploy script
- restructure pai-claude with workspace/.claude hierarchy
- unify workspace and add mutagen sync
- adjust Merlin prompt system for VPS environment
- replace deprecated db.exec with db.run
- remove emojis from bot responses and identity
- use typing indicator instead of placeholder message
- use system Python 3.12 instead of installing 3.14
- update project structure for personal assistant focus
- reorganize ansible playbooks and add VPS deployment scripts
- remove permission request and add ansible scripts
- move server IP to vault variable
- add fs imports and path config for future tools
- extract Merlin identity and principles to context/

### Chores

- add vault.yml to git and update pipeline for uv
- ignore AI generated content and fix site permissions on reload
- remove unused nginx playbook
- ignore python venv in sync
- remove vault.yml from git tracking
- exclude dev directories from bot deployment
- add server IP to vault
- track encrypted vault.yml

### Docs

- update structure to reflect workspace/.claude reorganization
- add fabric and update nginx to caddy in README
- clarify VPS provider is not limited to Vultr
- update README and CLAUDE.md with new features
- update deployment instructions and playbooks list
- update project structure in README and CLAUDE.md
- add Law 9 for ansible wrapper requirement
- add TODO files
- move pai.md to docs/
- add README
