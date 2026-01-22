# Process Issue Workflow 文件

## 概述

`process-issue.yml` 是一個自動化 GitHub Actions 工作流程，用於處理社群貢獻的提示詞（prompt）。此工作流程實現了從 Issue 提交到自動合併的完整流程，包含格式驗證、權限檢查、重複檢測等功能。

## 觸發條件

此工作流程在以下情況下觸發：

- **issue_comment.created**: 當 Issue 收到新評論時
- **issues.opened**: 當新 Issue 被建立時

## 工作流程架構

### Job 1: `re-validate` - 重新驗證提示詞

**執行條件**: 
- 事件類型為 `issue_comment.created`
- Issue 帶有 `prompt-contribution` 標籤

**權限需求**:
- `contents: read` - 用於檢查重複 Trigger
- `issues: write` - 用於留言回覆

#### 步驟流程

##### 1. Check if re-validation requested
檢查評論者是否為專案維護者，並驗證是否輸入 `/check` 指令。

**驗證邏輯**:
- 檢查評論內容是否以 `/check` 開頭
- 驗證評論者是否具有 `admin` 或 `write` 權限
- 若權限不足，會回覆錯誤訊息並終止流程

##### 2. Checkout
若權限驗證通過，checkout 程式碼倉庫以便檢查重複 Trigger。

##### 3. Re-validate issue content
執行完整的驗證流程，與 `validate-on-create` 邏輯相同：

**驗證項目**:
1. 解析所有欄位（Trigger, Label, Description, Prompt）
2. 格式驗證（Trigger 規則、內容長度）
3. 重複檢測（使用 grep 搜尋 prompts/）
4. 生成 YAML 內容預覽
5. 發送驗證結果（所有訊息前綴 🔄 **重新驗證結果**）

**使用情境**:
- 貢獻者編輯 Issue 後，維護者想確認問題是否已修正
- 需要重新生成 YAML 預覽
- 檢查最新的 Issue 內容是否符合格式

---

### Job 2: `process-approval` - 處理提示詞審核

**執行條件**: Issue 必須帶有 `prompt-contribution` 標籤，且收到評論

**權限需求**:
- `contents: write` - 用於提交程式碼
- `issues: write` - 用於更新 Issue 狀態
- `pull-requests: write` - 用於 PR 操作

#### 步驟流程

##### 1. Check if approved by owner
檢查評論者是否為專案維護者，並驗證是否輸入 `/approved` 指令。

**驗證邏輯**:
- 檢查評論內容是否以 `/approved` 開頭
- 驗證評論者是否具有 `admin` 或 `write` 權限
- 若權限不足，會回覆錯誤訊息並終止流程

**輸出**:
```json
{
  "approved": true,
  "issueNumber": 123,
  "issueBody": "...",
  "issueTitle": "..."
}
```

##### 2. Checkout & Setup
若核准通過，執行以下步驟：
- Checkout 程式碼倉庫
- 安裝 Bun 執行環境（latest 版本）
- 執行 `bun install` 安裝相依套件

##### 3. Parse and validate prompt
解析並驗證 Issue 內容中的提示詞資訊。

**解析欄位**:
- **Trigger**: 觸發關鍵字（必須以 `:` 開頭，不可含空格）
- **Label**: 顯示標籤
- **Description**: 提示詞描述
- **Prompt**: 提示詞內容（支援程式碼區塊格式）

**驗證規則**:
1. Trigger 必須以冒號 `:` 開頭
2. Trigger 不可包含空格
3. Trigger 長度至少 2 個字元
4. Prompt 內容長度至少 10 個字元

**檔案命名規則**:
- 移除 Trigger 開頭的冒號
- 將非英數字及連字號的字元替換為 `-`
- 加上 `.yml` 副檔名
- 例如：`:code-review` → `code-review.yml`

##### 4. Check for duplicate trigger
檢查 `prompts/` 目錄中是否已存在相同的 Trigger。

**檢查方式**:
- 使用 `grep` 搜尋 `prompts/` 目錄
- 同時檢查引號包覆及無引號兩種格式
- 若發現重複，設定 `duplicate=true`

##### 5. Report duplicate
若發現重複的 Trigger，在 Issue 中留言通知並終止流程。

##### 6. Create prompt file
若所有驗證通過且無重複，建立新的提示詞檔案。

**檔案格式**:
```yaml
# 提示詞由 Issue #123 貢獻
# 貢獻者: @username

trigger: ":example"
label: "範例標籤"
description: "範例描述"

prompt: |
  提示詞內容
  （每行自動縮排兩個空格）
```

##### 7. Commit and push
提交變更並推送至主分支。

**Commit 訊息格式**:
```
feat: add prompt :example from #123
```

**Git 設定**:
- 使用者: `github-actions[bot]`
- Email: `github-actions[bot]@users.noreply.github.com`

##### 8. Close issue with success message
成功加入提示詞後：
- 在 Issue 中留言確認成功
- 關閉 Issue
- 加上 `approved` 標籤

**成功訊息範例**:
```
✅ 提示詞已成功加入！

**詳細資訊：**
- Trigger: `:example`
- 檔案: `prompts/example.yml`

感謝您的貢獻！🎉
```

---

### Job 3: `validate-on-create` - 驗證新建 Issue

**執行條件**: 
- 事件類型為 `issues.opened`
- Issue 帶有 `prompt-contribution` 標籤

**權限需求**:
- `issues: write` - 用於留言回覆
- `contents: read` - 用於檢查重複 Trigger

#### 步驟流程

##### 1. Checkout
Checkout 程式碼倉庫，以便檢查現有的 Trigger。

##### 2. Parse and validate issue
完整解析並驗證 Issue 內容，並生成最終的 YAML 檔案預覽。

**解析流程**:

1. **解析所有欄位**: Trigger, Label, Description, Prompt
2. **格式驗證**:
   - Trigger 必須以 `:` 開頭
   - Trigger 不可包含空格
   - Trigger 長度至少 2 個字元
   - Prompt 內容至少 10 個字元
3. **重複檢測**: 使用 `grep` 搜尋 `prompts/` 目錄檢查 Trigger 是否重複
4. **生成 YAML 內容**: 建立完整的檔案預覽，包含正確的縮排格式
5. **發送回饋**: 在 Issue 中留言，顯示完整的 YAML 內容供管理者審核

**回饋行為**:

**情況 1: 解析失敗**
```markdown
❌ **無法解析提示詞內容，請確保格式正確。**

**解析結果：**
❌ 無法解析 Trigger
❌ 無法解析 Label
✅ Description 解析成功
✅ Prompt 解析成功

請參考 Issue 模板確保格式正確後重新編輯。
```

**情況 2: 格式驗證失敗**
```markdown
❌ **提示詞格式驗證失敗**

⚠️ Trigger 必須以冒號 `:` 開頭
⚠️ Trigger 不可包含空格
⚠️ Trigger 長度至少需要 2 個字元

請編輯 Issue 修正這些問題後，系統會自動重新驗證。
```

**情況 3: Trigger 重複**
```markdown
❌ **Trigger 重複**

這個 Trigger `:example` 已經存在於專案中，請使用不同的 Trigger。

您可以搜尋 [prompts/ 目錄](https://github.com/owner/repo/tree/main/prompts) 查看現有的 Trigger。
```

**情況 4: 驗證成功（包含完整 YAML 預覽）**
```markdown
✅ **提示詞驗證成功！**

感謝您的貢獻！以下是即將建立的檔案內容：

**檔案名稱：** `prompts/example.yml`

```yaml
# 提示詞由 Issue #123 貢獻
# 貢獻者: @username

trigger: ":example"
label: "範例標籤"
description: "範例描述"

prompt: |
  提示詞內容
  第二行內容
```

---

**驗證結果：**
- ✅ Trigger 格式正確
- ✅ 所有必要欄位完整
- ✅ 無重複 Trigger
- ✅ 內容長度符合要求

**下一步：**
維護者可以輸入 `/approved` 來核准此提示詞，系統將自動建立上述檔案並合併至專案。
```

## 完整流程圖

```
Issue 建立（帶有 prompt-contribution 標籤）
    ↓
[validate-on-create] Checkout 程式碼倉庫
    ↓
解析 Issue 內容（Trigger, Label, Description, Prompt）
    ├─ 解析失敗 → 留言告知缺少哪些欄位 → 等待編輯
    └─ 解析成功
        ↓
    格式驗證（Trigger 規則、內容長度）
        ├─ 驗證失敗 → 留言告知格式問題 → 等待編輯
        └─ 驗證成功
            ↓
        檢查 Trigger 重複（grep prompts/）
            ├─ 發現重複 → 留言告知並提供連結 → 等待編輯
            └─ 無重複
                ↓
            生成完整 YAML 內容（含正確縮排）
                ↓
            留言顯示完整 YAML 預覽
                ↓
            ✅ 等待維護者審核

───────────────────────────────────────────────────────
如果貢獻者編輯了 Issue：

維護者輸入 /check 指令
    ↓
[re-validate] 權限檢查
    ↓ 通過
    ↓
Checkout 程式碼倉庫
    ↓
重新執行完整驗證流程（與 validate-on-create 相同）
    ↓
留言顯示驗證結果（前綴 🔄 重新驗證結果）

───────────────────────────────────────────────────────
維護者輸入 /approved 指令
    ↓
[process-approval] 權限檢查
    ↓ 通過
    ↓
重新解析並驗證 Issue 內容
    ↓ 通過
    ↓
再次檢查 Trigger 重複
    ↓ 未重複
    ↓
建立 YAML 檔案（prompts/xxx.yml）
    ↓
Git commit & push
    ↓
關閉 Issue 並標記為 approved
```

## 使用範例

### 提交提示詞（貢獻者）

1. 使用 `prompt-contribution` Issue 模板建立新 Issue
2. 填寫以下欄位：
   ```markdown
   ### Trigger
   :mycommand

   ### Label
   我的指令

   ### Description
   這是一個範例指令

   ### Prompt
   請幫我執行以下任務...
   ```
3. 提交 Issue 後，系統會自動：
   - 解析並驗證所有欄位
   - 檢查 Trigger 是否重複
   - 生成完整的 YAML 檔案預覽
   - 在 Issue 中留言顯示驗證結果

4. 若驗證失敗，根據回饋訊息編輯 Issue 修正問題
5. 若驗證成功，等待維護者審核

### 審核提示詞（維護者）

1. 檢視 Issue 及自動生成的 YAML 預覽
2. 確認提示詞品質、格式及內容
3. 檢查 YAML 檔案是否正確
4. 若需要修改：
   - 請貢獻者編輯 Issue
   - 編輯完成後，輸入 `/check` 重新驗證
   - 系統會自動執行完整驗證並顯示新的 YAML 預覽
5. 確認無誤後，在 Issue 中留言：`/approved`
6. 系統將自動建立檔案並合併至專案

## 維護者指令

### `/check` - 重新驗證 Issue 內容

**用途**: 當貢獻者編輯 Issue 後，手動觸發重新驗證

**權限**: 僅限 `admin` 或 `write` 權限的使用者

**執行內容**:
- 重新解析 Issue 的所有欄位
- 執行完整的格式驗證
- 檢查 Trigger 是否重複
- 生成新的 YAML 預覽
- 在 Issue 中留言顯示驗證結果（前綴 🔄）

**使用範例**:
```
貢獻者編輯了 Trigger 從 :test example 改為 :testexample
↓
維護者留言: /check
↓
系統重新驗證並顯示:
🔄 **重新驗證結果**
✅ **提示詞驗證成功！**
...
```

### `/approved` - 核准並合併提示詞

**用途**: 核准提示詞並自動建立檔案

**權限**: 僅限 `admin` 或 `write` 權限的使用者

**執行內容**:
- 重新驗證 Issue 內容（防止編輯後未檢查）
- 建立 YAML 檔案至 `prompts/` 目錄
- Git commit 並 push 至主分支
- 關閉 Issue 並標記為 `approved`
- 留言確認成功

## 錯誤處理

### 權限不足（/check 或 /approved）
```markdown
❌ 抱歉，只有專案維護者可以執行 `/check` 指令。
```
或
```markdown
❌ 抱歉，只有專案維護者可以核准提示詞。
```

### 解析失敗
```markdown
❌ **無法解析提示詞內容，請確保格式正確。**

**解析結果：**
❌ 無法解析 Trigger
✅ Label 解析成功
✅ Description 解析成功
❌ 無法解析 Prompt

請參考 Issue 模板確保格式正確後重新編輯。
```

### 格式驗證失敗
```markdown
❌ **提示詞格式驗證失敗**

⚠️ Trigger 必須以冒號 `:` 開頭
⚠️ Trigger 不可包含空格
⚠️ Prompt 內容過短（至少 10 個字元）

請編輯 Issue 修正這些問題後，系統會自動重新驗證。
```

### 重新驗證成功（/check 指令）
```markdown
🔄 **重新驗證結果**

✅ **提示詞驗證成功！**

以下是即將建立的檔案內容：

**檔案名稱：** `prompts/example.yml`

```yaml
# 提示詞由 Issue #123 貢獻
# 貢獻者: @username

trigger: ":example"
label: "範例標籤"
description: "範例描述"

prompt: |
  提示詞內容
  第二行內容
```

---

**驗證結果：**
- ✅ Trigger 格式正確
- ✅ 所有必要欄位完整
- ✅ 無重複 Trigger
- ✅ 內容長度符合要求

**下一步：**
維護者可以輸入 `/approved` 來核准此提示詞，系統將自動建立上述檔案並合併至專案。
```
```markdown
❌ **Trigger 重複**

這個 Trigger `:example` 已經存在於專案中，請使用不同的 Trigger。

您可以搜尋 [prompts/ 目錄](https://github.com/owner/repo/tree/main/prompts) 查看現有的 Trigger。
```

## 技術細節

### 使用的 GitHub Actions

- **actions/checkout@v4**: Checkout 程式碼倉庫
- **actions/github-script@v7**: 執行 JavaScript 腳本操作 GitHub API
- **oven-sh/setup-bun@v2**: 安裝 Bun 執行環境

### 正規表達式解析

Issue 內容解析使用以下正規表達式：

```javascript
// Trigger: ### Trigger 後的第一行
/### Trigger\s*\n+([^\n]+)/i

// Label: ### Label 後的第一行
/### Label\s*\n+([^\n]+)/i

// Description: ### Description 到下一個 ### 之間的內容
/### Description\s*\n+([\s\S]*?)(?=### Prompt|$)/i

// Prompt: ### Prompt 後的程式碼區塊或文字內容
/### Prompt\s*\n+```[\s\S]*?\n([\s\S]*?)```/i
或
/### Prompt\s*\n+([\s\S]*?)(?=### |$)/i
```

### 檔案產生邏輯

Prompt 內容會自動縮排兩個空格，以符合 YAML 多行區塊格式：

```bash
echo "$PROMPT" | sed 's/^/  /' >> "prompts/$FILENAME"
```

## 維護建議

1. **定期檢查重複檢測邏輯**: 確保能正確識別各種 Trigger 格式
2. **監控失敗案例**: 透過 GitHub Actions 日誌分析常見的失敗原因
3. **更新驗證規則**: 根據社群回饋調整格式驗證的嚴格程度
4. **權限管理**: 定期檢視具有 write 權限的使用者清單

## 相關文件

- [貢獻指南](../CONTRIBUTING.md)
- [Issue 模板](../.github/ISSUE_TEMPLATE/)
- [Espanso 套件規格](https://espanso.org/docs/packages/)
