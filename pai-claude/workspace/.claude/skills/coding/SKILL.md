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
