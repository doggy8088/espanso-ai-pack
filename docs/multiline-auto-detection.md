# Multiline 變數自動偵測

## 概述

此功能會自動偵測 prompt 中的變數是否應該設定為 `multiline: true`，並在生成 YAML 檔案時自動加入 `form_fields` 設定。

## 偵測規則

**核心規則**：只要變數單獨存在一整行，就應該設定為 `multiline: true`

### 判定為 Multiline 的情況

變數獨佔一行（前後只有空白）：

```yaml
prompt: |
  請翻譯以下內容：
  {{content}}
  
  額外說明：
  {{notes}}
```

→ `content` 和 `notes` 都會被設定為 `multiline: true`

### 不判定為 Multiline 的情況

變數在行內（同一行還有其他文字）：

```yaml
prompt: |
  請翻譯 {{text}} 成 {{language|英文}}
```

→ 不會生成 `form_fields`

### 混合情況

```yaml
prompt: |
  請根據以下需求生成程式碼：
  
  需求描述：
  {{requirements}}
  
  使用語言：{{language|TypeScript}}
  
  額外說明：
  {{notes}}
```

→ 只有 `requirements` 和 `notes` 會被設定為 `multiline: true`

生成的 YAML：

```yaml
form_fields:
  requirements:
    multiline: true
  notes:
    multiline: true
```

## 實作模組

### `scripts/detect-multiline-vars.ts`

提供三個主要函數：

#### 1. `detectMultilineVariables(prompt: string)`

偵測哪些變數應該設定為 multiline。

```typescript
const vars = detectMultilineVariables(prompt);
// 回傳: [{ name: "content", defaultValue: undefined }, ...]
```

#### 2. `generateFormFields(variables: MultilineVariable[])`

生成 `form_fields` YAML 區塊。

```typescript
const formFields = generateFormFields(vars);
// 回傳:
// form_fields:
//   content:
//     multiline: true
```

#### 3. `generateYamlWithFormFields(config: PromptConfig)`

生成完整的 YAML 檔案（自動包含 form_fields）。

```typescript
const yaml = generateYamlWithFormFields({
  trigger: ":example",
  label: "範例",
  description: "範例描述",
  prompt: "...",
  issueNumber: 123,
  contributor: "@username",
});
```

## 整合到驗證流程

### `scripts/validate.ts`

新增 `generateYamlFromIssue()` 函數，用於從 Issue 內容直接生成包含 form_fields 的完整 YAML：

```typescript
import { generateYamlFromIssue } from "./validate.ts";

const yaml = generateYamlFromIssue(issueContent, issueNumber, contributor);
```

## 在 GitHub Actions 中使用

在 `.github/workflows/process-issue.yml` 的 `validate-on-create` 和 `re-validate` job 中：

```yaml
- name: Generate YAML preview
  id: generate-yaml
  run: |
    # 使用 generateYamlFromIssue 而不是手動組合
    node -e "
    import('./scripts/validate.ts').then(m => {
      const yaml = m.generateYamlFromIssue(
        process.env.ISSUE_BODY,
        ${{ github.event.issue.number }},
        '@${{ github.event.issue.user.login }}'
      );
      console.log(yaml);
    });
    "
```

這樣生成的 YAML 預覽會自動包含正確的 `form_fields` 設定。

## 測試

執行測試腳本驗證功能：

```bash
# 測試核心偵測邏輯
bun run scripts/test-multiline-detection.ts

# 測試 Issue 整合
bun run scripts/test-issue-to-yaml.ts
```

## 範例輸出

### 輸入 (Issue 內容)

```markdown
### Trigger
:nbp

### Label
資訊圖表

### Description
生成資訊圖表

### Prompt
```
內容：
{{content}}
```
```

### 輸出 (YAML 檔案)

```yaml
# 提示詞由 Issue #3 貢獻
# 貢獻者: @doggy8088

trigger: ":nbp"
label: "資訊圖表"
description: "生成資訊圖表"

prompt: |
  內容：
  {{content}}

form_fields:
  content:
    multiline: true
```

## 優點

1. **自動化**：不需要手動判斷和添加 `form_fields`
2. **一致性**：所有 prompt 使用相同的規則
3. **減少錯誤**：避免漏掉應該設為 multiline 的變數
4. **提升 UX**：使用者輸入大段文字時會自動展開多行編輯框

## 維護注意事項

- 規則很簡單：**變數單獨成行 = multiline**
- 如果未來需要更複雜的判定邏輯，修改 `detectMultilineVariables()` 即可
- 所有使用 `generateYamlWithFormFields()` 的地方都會自動套用新規則
