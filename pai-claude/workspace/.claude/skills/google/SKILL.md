---
name: google
description: Google services integration. Use when user mentions calendar, schedule, meeting, drive, files, gmail, email, contacts, tasks, todo, task list.
---

# Google Skill

Access Wei-Hung's Google services: Calendar, Drive, Gmail, Contacts, Tasks.

## Usage

Automatically invoked via MCP (Model Context Protocol). No manual commands needed.

## Available Tools

### Calendar

| Tool | Description |
|------|-------------|
| `google_calendar_list` | List all calendars |
| `google_calendar_events` | List events (with time range, search) |
| `google_calendar_create_event` | Create new event |

### Drive

| Tool | Description |
|------|-------------|
| `google_drive_list` | List files |
| `google_drive_search` | Search files |
| `google_drive_get_file` | Get file info or content |

### Gmail

| Tool | Description |
|------|-------------|
| `google_gmail_list` | List emails |
| `google_gmail_get` | Read email content |
| `google_gmail_send` | Send email |

### Contacts

| Tool | Description |
|------|-------------|
| `google_contacts_list` | List contacts |
| `google_contacts_search` | Search contacts |

### Tasks

| Tool | Description |
|------|-------------|
| `google_tasks_list_tasklists` | List all task lists |
| `google_tasks_list` | List tasks in a task list |
| `google_tasks_create` | Create new task |
| `google_tasks_complete` | Mark task as completed |
| `google_tasks_delete` | Delete task |

**Task parameters**:
- `taskListId`: Task list ID (default: `@default`)
- `due`: Due date in RFC 3339 format (e.g., `2024-01-15T00:00:00Z`)
- `showCompleted`: Whether to show completed tasks

## Notes

1. Confirm recipient and content before sending emails
2. Use ISO 8601 format for calendar times (e.g., `2024-01-15T10:00:00+08:00`)
3. Use RFC 3339 format for task due dates (e.g., `2024-01-15T00:00:00Z`)
4. Gmail search supports Gmail syntax (e.g., `from:someone@example.com`)
