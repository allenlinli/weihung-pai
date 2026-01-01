---
name: daily
description: Daily task management. Use when user mentions todo, remind, schedule, plan, task, track.
---

# Daily Skill

Daily task management and planning.

## Workflow Routing

- Daily planning → [workflows/daily-plan.md](workflows/daily-plan.md)
- Weekly review → [workflows/weekly-review.md](workflows/weekly-review.md)

## Task Priority

- **P0**: Must complete today
- **P1**: Complete this week
- **P2**: When available
- **P3**: Ideas/inspiration (may not do)

## Task Categories

- 🔴 Work
- 🟢 Personal
- 🔵 Learning
- 🟡 Health
- ⚪ Other

## Daily Flow

### Morning
1. Review today's tasks
2. Confirm priorities
3. Estimate time

### Evening
1. Review completion
2. Move incomplete to tomorrow or re-evaluate
3. Record blockers and insights

## Todo Format

```markdown
## [Date]

### P0 - Must Do Today
- [ ] Task 1 (est. 30min)
- [ ] Task 2 (est. 1h)

### P1 - This Week
- [ ] Task 3

### Completed
- [x] Finished task
```

## Data Storage

All daily records saved in `~/merlin-workspace/daily/`.
