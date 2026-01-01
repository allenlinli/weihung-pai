---
name: fabric
description: Fabric patterns content processing. Use when user mentions summarize, extract, analyze, pattern, fabric, wisdom, key points.
---

# Fabric Skill

Content processing using Fabric AI patterns.

## Setup

```bash
fabric-ai -S  # Configure with Anthropic API key
```

## Workflow Routing

- Extract wisdom → [workflows/extract-wisdom.md](workflows/extract-wisdom.md)
- Summarize → [workflows/summarize.md](workflows/summarize.md)
- Analyze → [workflows/analyze.md](workflows/analyze.md)
- List patterns → `fabric-ai -l`

## Common Patterns

| Pattern | Purpose | Command |
|---------|---------|---------|
| `extract_wisdom` | Extract insights and key points | `fabric-ai -p extract_wisdom` |
| `summarize` | Summarize any content | `fabric-ai -p summarize` |
| `analyze_claims` | Analyze argument validity | `fabric-ai -p analyze_claims` |
| `explain_code` | Explain code | `fabric-ai -p explain_code` |
| `improve_writing` | Improve writing | `fabric-ai -p improve_writing` |
| `create_keynote` | Generate presentation outline | `fabric-ai -p create_keynote` |
| `rate_content` | Rate if content is worth reading | `fabric-ai -p rate_content` |

## Usage

### From text
```bash
echo "content..." | fabric-ai -p extract_wisdom
```

### From file
```bash
cat article.md | fabric-ai -p summarize
```

### From YouTube
```bash
fabric-ai -y "https://youtube.com/watch?v=..." -p extract_wisdom
```

### From clipboard
```bash
pbpaste | fabric-ai -p summarize
```

## Output Options

- `-o` Output to file
- `-s` or `--stream` Stream output
- `-c` Copy to clipboard
