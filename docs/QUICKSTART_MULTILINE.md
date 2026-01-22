# 快速開始：Multiline 自動偵測

## 一句話總結

**變數單獨成行 = `multiline: true`**

## 快速測試

```bash
# 測試核心邏輯
bun run test:multiline

# 測試 Issue 轉 YAML
bun run test:issue-yaml

# 驗證所有檔案
bun run validate
```

## 在程式中使用

```typescript
import { generateYamlFromIssue } from "./scripts/validate.ts";

const yaml = generateYamlFromIssue(
  issueBody,
  issueNumber,
  "@contributor"
);
```

## 範例

### 輸入
```
請審查程式碼：

{{code}}

語言：{{lang|TypeScript}}
```

### 自動判定
- `{{code}}` - 單獨成行 → ✅ multiline
- `{{lang}}` - 行內變數 → ❌ 不設定

### 輸出
```yaml
form_fields:
  code:
    multiline: true
```

## 詳細文件

- [完整說明](./multiline-auto-detection.md)
- [GitHub Actions 整合](./github-actions-integration.md)
- [實作摘要](./MULTILINE_IMPLEMENTATION_SUMMARY.md)
