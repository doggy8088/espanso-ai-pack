# Multiline 變數自動偵測功能 - 實作摘要

## 完成時間
2026-01-22

## 功能說明

建立一套自動偵測邏輯，在 `/approved` 產生 `prompts/*.yml` 檔案時，自動判斷變數是否應該設定 `multiline: true`。

### 核心規則
**只要變數單獨存在一整行，就應該設定為 `multiline: true`**

## 實作檔案

### 1. 核心模組
- **`scripts/detect-multiline-vars.ts`** (新增)
  - `detectMultilineVariables()` - 偵測需要 multiline 的變數
  - `generateFormFields()` - 生成 form_fields YAML 區塊
  - `generateYamlWithFormFields()` - 生成完整 YAML（含 form_fields）

### 2. 整合到驗證模組
- **`scripts/validate.ts`** (修改)
  - 匯入 `generateYamlWithFormFields`
  - 新增 `generateYamlFromIssue()` 函數，用於從 Issue 內容直接生成完整 YAML

### 3. 測試腳本
- **`scripts/test-multiline-detection.ts`** (新增)
  - 測試核心偵測邏輯的各種情境
  
- **`scripts/test-issue-to-yaml.ts`** (新增)
  - 測試從 Issue 生成完整 YAML 的整合流程

### 4. 文件
- **`docs/multiline-auto-detection.md`** (新增)
  - 詳細說明偵測規則、使用方式、範例
  
- **`docs/github-actions-integration.md`** (新增)
  - 說明如何在 GitHub Actions 中整合此功能
  
- **`scripts/README.md`** (新增)
  - Scripts 工具使用說明

### 5. 設定檔
- **`package.json`** (修改)
  - 新增測試指令：
    - `test:multiline` - 測試 multiline 偵測邏輯
    - `test:issue-yaml` - 測試 Issue 到 YAML 轉換

## 使用範例

### 基本使用

```typescript
import { generateYamlFromIssue } from "./scripts/validate.ts";

const yaml = generateYamlFromIssue(
  issueContent,    // Issue body
  123,             // Issue number
  "@contributor"   // GitHub username
);

console.log(yaml);
```

### 輸入範例 (Issue Content)

```markdown
### Trigger
:codereview

### Label
程式碼審查

### Description
審查程式碼並提供建議

### Prompt
```
請審查以下程式碼：

{{code}}

重點關注：{{focus|安全性和效能}}

額外說明：
{{notes}}
```
```

### 輸出範例 (YAML)

```yaml
# 提示詞由 Issue #123 貢獻
# 貢獻者: @contributor

trigger: ":codereview"
label: "程式碼審查"
description: "審查程式碼並提供建議"

prompt: |
  請審查以下程式碼：

  {{code}}

  重點關注：{{focus|安全性和效能}}

  額外說明：
  {{notes}}

form_fields:
  code:
    multiline: true
  notes:
    multiline: true
```

**自動偵測結果**：
- ✅ `code` - 單獨成行 → multiline: true
- ❌ `focus` - 行內變數 → 不設定 multiline
- ✅ `notes` - 單獨成行 → multiline: true

## 測試結果

所有測試通過：

```bash
$ bun run test:multiline
✅ 測試案例 1: 變數單獨成行 - 通過
✅ 測試案例 2: 變數在行內 - 通過
✅ 測試案例 3: 混合情況 - 通過
✅ 測試案例 4: 完整 YAML 生成 - 通過
✅ 測試案例 5: 變數前後有空白 - 通過

$ bun run test:issue-yaml
✅ Issue 解析和 YAML 生成 - 通過
✅ 多變數混合情況 - 通過

$ bun run validate
✅ 所有 12 個 prompt 檔案驗證通過
```

## 如何使用

### 本地開發

```bash
# 安裝依賴
bun install

# 測試 multiline 偵測
bun run test:multiline

# 測試 Issue 到 YAML 轉換
bun run test:issue-yaml

# 驗證所有檔案
bun run validate
```

### 在程式中使用

```typescript
// 從 Issue 生成完整 YAML
import { generateYamlFromIssue } from "./scripts/validate.ts";
const yaml = generateYamlFromIssue(issueBody, issueNumber, contributor);

// 或直接使用核心函數
import { generateYamlWithFormFields } from "./scripts/detect-multiline-vars.ts";
const yaml = generateYamlWithFormFields({
  trigger: ":example",
  label: "範例",
  description: "範例描述",
  prompt: "...",
});
```

### 在 GitHub Actions 中使用

參考 `docs/github-actions-integration.md` 了解如何在 workflow 中整合。

主要步驟：
1. Setup Bun
2. Install dependencies
3. Import and use `generateYamlFromIssue()`

## 優點

1. ✅ **自動化** - 不需要手動判斷和設定 form_fields
2. ✅ **一致性** - 所有 prompt 使用相同規則
3. ✅ **可測試** - 有完整的測試腳本驗證
4. ✅ **易維護** - 規則集中在一個模組
5. ✅ **提升 UX** - 使用者輸入大段文字時自動展開多行編輯框

## 下一步（可選）

- [ ] 更新 `.github/workflows/process-issue.yml` 使用新的 `generateYamlFromIssue()` 函數
- [ ] 在 CI 中新增 multiline 偵測測試
- [ ] 更新貢獻指南，說明 multiline 自動偵測功能

## 相關文件

- [Multiline 自動偵測說明](./docs/multiline-auto-detection.md)
- [GitHub Actions 整合指南](./docs/github-actions-integration.md)
- [Scripts 工具說明](./scripts/README.md)
- [Process Issue Workflow](./docs/process-issue-workflow.md)

## 技術細節

### 偵測邏輯

```typescript
// 檢查變數是否單獨成行
const lines = prompt.split("\n");
for (const line of lines) {
  const trimmedLine = line.trim();
  const matches = [...trimmedLine.matchAll(/\{\{(\w+)(?:\|([^}]*))?\}\}/g)];
  
  // 只有一個變數 且 移除變數後只剩空白
  if (matches.length === 1) {
    const withoutVar = trimmedLine.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, "").trim();
    if (withoutVar === "") {
      // 此變數應設為 multiline
    }
  }
}
```

### 檔案結構

```
espanso-ai-pack/
├── scripts/
│   ├── detect-multiline-vars.ts      (新增) 核心偵測模組
│   ├── validate.ts                   (修改) 整合 multiline 偵測
│   ├── test-multiline-detection.ts   (新增) 測試腳本
│   ├── test-issue-to-yaml.ts         (新增) 整合測試
│   └── README.md                     (新增) 工具說明
├── docs/
│   ├── multiline-auto-detection.md   (新增) 功能說明
│   └── github-actions-integration.md (新增) CI 整合指南
└── package.json                      (修改) 新增測試指令
```
