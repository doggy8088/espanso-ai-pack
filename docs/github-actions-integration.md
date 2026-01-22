# 在 GitHub Actions 中整合 Multiline 自動偵測

此文件說明如何在 `.github/workflows/process-issue.yml` 中整合 multiline 自動偵測功能。

## 概述

當維護者使用 `/approved` 指令核准提示詞時，系統應該：
1. 解析 Issue 內容
2. 自動偵測哪些變數需要 `multiline: true`
3. 生成包含 `form_fields` 的完整 YAML 檔案
4. 提交到 `prompts/` 目錄

## 修改 process-issue.yml

### 原有的檔案生成邏輯（需要移除）

```yaml
- name: Create prompt file
  run: |
    # 手動組合 YAML...
    echo "trigger: \"$TRIGGER\"" >> "prompts/$FILENAME"
    echo "label: \"$LABEL\"" >> "prompts/$FILENAME"
    # ... 繁瑣的手動處理
```

### 新的整合方式

使用 `generateYamlFromIssue()` 函數自動生成完整的 YAML（含 form_fields）：

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest

- name: Install dependencies
  run: bun install

- name: Create prompt file
  id: create-file
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const path = require('path');
      
      // 匯入 validate.ts
      const { generateYamlFromIssue } = await import('./scripts/validate.ts');
      
      const issueBody = `${{ github.event.issue.body }}`;
      const issueNumber = ${{ github.event.issue.number }};
      const contributor = '@${{ github.event.issue.user.login }}';
      
      // 生成完整的 YAML（自動包含 form_fields）
      const yaml = generateYamlFromIssue(issueBody, issueNumber, contributor);
      
      if (!yaml) {
        core.setFailed('無法解析 Issue 內容');
        return;
      }
      
      // 解析 trigger 以產生檔案名稱
      const triggerMatch = issueBody.match(/### Trigger\s*\n+`?([^`\n]+)`?/i);
      const trigger = triggerMatch ? triggerMatch[1].trim() : null;
      
      if (!trigger) {
        core.setFailed('無法解析 Trigger');
        return;
      }
      
      // 產生檔案名稱
      const filename = trigger
        .replace(/^:/, '')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .toLowerCase() + '.yml';
      
      const filepath = path.join('prompts', filename);
      
      // 寫入檔案
      fs.writeFileSync(filepath, yaml, 'utf-8');
      
      core.setOutput('filename', filename);
      core.setOutput('trigger', trigger);
```

## 在驗證流程中顯示 YAML 預覽

### validate-on-create Job

修改 `Parse and validate issue` 步驟以顯示完整的 YAML 預覽（含 form_fields）：

```yaml
- name: Parse and validate issue
  id: validate
  uses: actions/github-script@v7
  with:
    script: |
      // 匯入驗證工具
      const { generateYamlFromIssue, validatePromptConfig, parseIssueContent } = 
        await import('./scripts/validate.ts');
      
      const issueBody = `${{ github.event.issue.body }}`;
      const issueNumber = ${{ github.event.issue.number }};
      const contributor = '@${{ github.event.issue.user.login }}';
      
      // 解析 Issue
      const config = parseIssueContent(issueBody);
      
      if (!config) {
        // 解析失敗...
        return;
      }
      
      // 驗證格式
      const validation = validatePromptConfig(config);
      
      if (!validation.valid) {
        // 顯示錯誤...
        return;
      }
      
      // 檢查重複...
      
      // 生成完整的 YAML 預覽（自動包含 form_fields）
      const yaml = generateYamlFromIssue(issueBody, issueNumber, contributor);
      
      // 產生檔案名稱
      const filename = config.trigger
        .replace(/^:/, '')
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .toLowerCase() + '.yml';
      
      // 發送成功訊息（含 YAML 預覽）
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: `✅ **提示詞驗證成功！**

感謝您的貢獻！以下是即將建立的檔案內容：

**檔案名稱：** \`prompts/${filename}\`

\`\`\`yaml
${yaml}
\`\`\`

---

**驗證結果：**
- ✅ Trigger 格式正確
- ✅ 所有必要欄位完整
- ✅ 無重複 Trigger
- ✅ 內容長度符合要求
${yaml.includes('form_fields') ? '- ✅ 自動偵測到 multiline 變數' : ''}

**下一步：**
維護者可以輸入 \`/approved\` 來核准此提示詞，系統將自動建立上述檔案並合併至專案。`
      });
```

## 完整範例

參考以下完整的工作流程片段：

```yaml
process-approval:
  if: |
    contains(github.event.issue.labels.*.name, 'prompt-contribution') &&
    github.event_name == 'issue_comment'
  runs-on: ubuntu-latest
  permissions:
    contents: write
    issues: write
  
  steps:
    - name: Check if approved
      id: check-approval
      # ... 權限檢查

    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Bun
      uses: oven-sh/setup-bun@v2

    - name: Install dependencies
      run: bun install

    - name: Create prompt file
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const path = require('path');
          const { generateYamlFromIssue } = await import('./scripts/validate.ts');
          
          const yaml = generateYamlFromIssue(
            `${{ github.event.issue.body }}`,
            ${{ github.event.issue.number }},
            '@${{ github.event.issue.user.login }}'
          );
          
          // 產生檔案並寫入...
          
    - name: Commit and push
      # ... Git commit

    - name: Close issue
      # ... 關閉 Issue
```

## 測試整合

在本地測試 GitHub Actions 腳本邏輯：

```bash
# 測試 Issue 解析和 YAML 生成
bun run test:issue-yaml

# 測試 multiline 偵測
bun run test:multiline

# 驗證所有檔案
bun run validate
```

## 優點

1. **自動化**：不需要在 workflow 中手動判斷 multiline
2. **一致性**：本地開發和 CI 使用相同的邏輯
3. **可測試**：可以在本地執行測試腳本驗證
4. **維護性**：修改規則只需要改一個地方（`detect-multiline-vars.ts`）

## 注意事項

- 確保 GitHub Actions 有權限執行 `bun` 指令（使用 `oven-sh/setup-bun@v2`）
- 確保執行 `bun install` 安裝依賴套件
- 使用 `await import()` 動態匯入 ES modules
- 測試時使用實際的 Issue 內容範例

## 相關文件

- [Multiline 自動偵測說明](./multiline-auto-detection.md)
- [Process Issue Workflow](./process-issue-workflow.md)
- [Scripts 工具說明](../scripts/README.md)
