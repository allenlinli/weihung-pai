---
name: coding
description: Code writing and automation. Use when user mentions code, script, tool, automate, save, batch, crawler, API, data processing.
---

# Coding Skill

Write code to solve problems and create automation scripts.

## Core Principle

**Any repetitive or automatable work is worth scripting.**

## Workspace Structure

All code saved in `./workspace/`:

```
./workspace/
├── site/           # Website files (Caddy serve)
├── projects/       # Git repos and projects
├── scripts/        # One-off or simple scripts
├── tools/          # Reusable utilities
└── data/           # Data files
```

## Technology Stack

| Scenario | Recommendation |
|----------|----------------|
| General scripts | TypeScript + Bun |
| Data processing | TypeScript or Python |
| Web scraping | Playwright / Cheerio |
| API integration | TypeScript + fetch |
| CLI tools | TypeScript + Commander |

## Workflow

1. **Assess** - Will this repeat? Worth automating?
2. **Design** - What's the input/output? Edge cases?
3. **Implement** - Write to appropriate directory
4. **Test** - Run with `bun run <script>`
5. **Save** - Version control if needed in `projects/`

## Code Style

- **Concise** - 10 lines over 100
- **Readable** - Clear names, necessary comments
- **Reliable** - Handle errors
- **Reusable** - Consider future extension

## TDD Approach

When implementing features:

1. **Understand** - Confirm goals and acceptance criteria
2. **Test First** - Define expected behavior with tests
3. **Minimal Implementation** - Only what's needed, no over-engineering
4. **Refactor** - Clean up after tests pass
5. **Document** - Necessary comments and README

Principle: Make it work → Make it right → Make it fast

## Testing Strategy

| Category | Focus |
|----------|-------|
| Happy Path | Normal use cases |
| Edge Cases | Boundary values (0, null, max, min) |
| Error Cases | Invalid input, exceptions |
| Security | Injection, permissions, data leaks |

Guidelines:
- If not tested, assume it's broken
- Edge cases fail most often
- Tests are documentation
- Automate when possible

## Templates

### Simple Script
```typescript
#!/usr/bin/env bun

const main = async () => {
  // Main logic
}

main().catch(console.error)
```

### CLI Tool
```typescript
#!/usr/bin/env bun
import { parseArgs } from "util"

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    input: { type: "string", short: "i" },
    output: { type: "string", short: "o" },
  },
})
```

### Web Scraper
```typescript
#!/usr/bin/env bun
import * as cheerio from "cheerio"

const url = "https://example.com"
const html = await fetch(url).then(r => r.text())
const $ = cheerio.load(html)
```
