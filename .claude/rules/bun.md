---
paths: "**/*.ts"
---

# Bun 使用規範

## Runtime

- 使用 `bun <file>` 而非 `node <file>` 或 `ts-node <file>`
- 使用 `bun run <script>` 而非 `npm run <script>`
- 使用 `bun install` 而非 `npm install`
- 使用 `bun test` 而非 `jest` 或 `vitest`

## APIs

- `Bun.serve()` 取代 `express`
- `bun:sqlite` 取代 `better-sqlite3`
- `Bun.file()` 取代 `node:fs` 的 readFile/writeFile
- `Bun.$\`cmd\`` 取代 `execa`
- Bun 自動載入 `.env`，不需要 `dotenv`

## Testing

```ts
import { test, expect } from "bun:test";

test("example", () => {
  expect(1).toBe(1);
});
```
