# Scripts 工具說明

此目錄包含用於開發和維護 Espanso AI Pack 的腳本工具。

## 核心腳本

### `validate.ts` - 提示詞驗證

驗證 `prompts/` 目錄中的所有 YAML 檔案格式是否正確。

```bash
bun run validate
```

檢查項目：
- 必要欄位（trigger, label, description, prompt）
- Trigger 格式（必須以 `:` 開頭，不可含空格）
- Prompt 內容長度
- 變數格式

### `build.ts` - 建置套件

生成 `dist/package.yml` 並同步 manifest 元資料。

```bash
bun run build
```

### `bump.ts` - 版本管理

升級套件版本號（同時更新 `package.json` 和 `_manifest.yml`）。

```bash
bun run bump:patch   # 0.3.8 → 0.3.9
bun run bump:minor   # 0.3.8 → 0.4.0
bun run bump:major   # 0.3.8 → 1.0.0
```

### `test-version.ts` - 版本一致性測試

驗證 `_manifest.yml` 和 `package.json` 的版本號是否一致。

```bash
bun run test:version
```

## Multiline 自動偵測工具

### `detect-multiline-vars.ts` - 核心偵測模組

提供自動偵測變數是否應設為 multiline 的功能。

**規則**：變數單獨存在一整行時，設定為 `multiline: true`

主要函數：
- `detectMultilineVariables(prompt)` - 偵測需要 multiline 的變數
- `generateFormFields(variables)` - 生成 form_fields YAML 區塊
- `generateYamlWithFormFields(config)` - 生成完整 YAML（含 form_fields）

### `test-multiline-detection.ts` - Multiline 偵測測試

測試核心偵測邏輯的各種情境。

```bash
bun run test:multiline
```

測試案例：
- 變數單獨成行（應為 multiline）
- 變數在行內（不應為 multiline）
- 混合情況
- 變數前後有空白

### `test-issue-to-yaml.ts` - Issue 整合測試

測試從 Issue 內容生成完整 YAML（含自動偵測的 form_fields）。

```bash
bun run test:issue-yaml
```

## 開發工作流程

### 1. 新增提示詞

透過 GitHub Issue 提交（自動流程）或手動建立：

```bash
# 手動建立檔案後驗證
bun run validate
```

### 2. 修改提示詞

```bash
# 編輯 prompts/*.yml
vim prompts/example.yml

# 驗證格式
bun run validate

# 建置套件
bun run build
```

### 3. 發布新版本

```bash
# 升級版本並建置
bun run bump:patch

# Git commit 和 push
git push
```

### 4. 測試 Multiline 偵測

```bash
# 測試核心邏輯
bun run test:multiline

# 測試 Issue 整合
bun run test:issue-yaml
```

## 在程式碼中使用

### 匯入驗證功能

```typescript
import { 
  parseIssueContent, 
  validatePromptConfig,
  generateYamlFromIssue 
} from "./scripts/validate.ts";

// 解析 Issue
const config = parseIssueContent(issueBody);

// 驗證格式
const result = validatePromptConfig(config);

// 生成完整 YAML（含 form_fields）
const yaml = generateYamlFromIssue(
  issueBody, 
  issueNumber, 
  contributor
);
```

### 匯入 Multiline 偵測

```typescript
import { 
  detectMultilineVariables,
  generateFormFields,
  generateYamlWithFormFields 
} from "./scripts/detect-multiline-vars.ts";

// 偵測變數
const vars = detectMultilineVariables(prompt);

// 生成 form_fields
const formFields = generateFormFields(vars);

// 生成完整 YAML
const yaml = generateYamlWithFormFields({
  trigger: ":example",
  label: "範例",
  description: "範例描述",
  prompt: "...",
});
```

## 相關文件

- [Multiline 自動偵測說明](../docs/multiline-auto-detection.md)
- [Process Issue Workflow](../docs/process-issue-workflow.md)
- [版本管理](../docs/version-management.md)

## 依賴套件

- **Bun**: JavaScript/TypeScript 執行環境
- **yaml**: YAML 解析和序列化

```bash
bun install
```
