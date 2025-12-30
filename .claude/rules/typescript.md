---
paths: "**/*.ts"
---

# TypeScript 規範

## 型別安全

- 善用 TypeScript 型別系統
- 避免 `any`，優先使用 `unknown`
- 使用 `strict` 模式

## 錯誤處理

- 使用 Result 模式處理可預期錯誤

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

## 風格

- 優先使用 `const`
- 函式保持在 50 行以內
- 使用描述性變數名稱
- 優先使用 async/await
