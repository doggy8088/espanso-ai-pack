# Espanso AI Pack - AI 提示詞套件

<div align="center">

![Espanso](https://img.shields.io/badge/Espanso-Text%20Expander-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)
![Version](https://img.shields.io/badge/Version-0.1.0-purple)

**一套收集常見 AI 提示詞的 Espanso 套件，讓您快速輸入各種實用的提示詞模板。**

[安裝方式](#-安裝方式) •
[更新方式](#-更新方式) •
[解除安裝](#-解除安裝) •
[使用方法](#-使用方法) •
[提示詞列表](#-提示詞列表) •
[下載中心](https://doggy8088.github.io/espanso-ai-pack/) •
[貢獻指南](#-貢獻提示詞) •
[開發指南](#-開發指南)

</div>

---

## 📖 簡介

**Espanso AI Pack** 是一個為 [Espanso](https://espanso.org/) 設計的提示詞套件，收集了各種常見的 AI 提示詞模板。無論您使用的是 ChatGPT、Claude、Gemini 或其他 AI 工具，這個套件都能幫助您快速輸入結構化的提示詞，大幅提升工作效率。

### ✨ 特色功能

- 🚀 **快速輸入**：只需輸入簡短的觸發詞，即可展開完整的提示詞模板
- 📝 **變數支援**：部分提示詞支援變數輸入，可根據需求自訂內容
- 🌐 **社群貢獻**：歡迎任何人透過 Issue 貢獻新的提示詞
- 🔄 **自動建置**：使用 CI/CD 自動合併並發佈新版本

---

## 📦 安裝方式

### 方法一：從 GitHub 安裝（推薦）

```bash
espanso install espanso-ai-pack --git https://github.com/doggy8088/espanso-ai-pack --external
```

> 註：`espanso install --git` 會讀取 repository 根目錄的 `package.yml`，本專案建置會自動產生並同步。

### 方法二：從 GitHub Pages 下載

前往 **[下載中心](https://doggy8088.github.io/espanso-ai-pack/)** 下載檔案並手動安裝。

提供的檔案：
- `package.yml` - 主套件檔案
- `_manifest.yml` - 套件描述檔
- `README.md` - 說明文件

### 方法三：使用 Espanso Hub（未來）

```bash
espanso install espanso-ai-pack
```

> 註：目前尚未上架到 Espanso Hub，敬請期待！

**詳細安裝說明**：請參考 [外部安裝指南](docs/external-installation.md)

---

## 🔄 更新方式

如果已經安裝過套件，可使用以下指令更新到最新版本：

```bash
espanso package update espanso-ai-pack
```

> 註：更新後如未生效，請執行 `espanso restart`。

---

## 🗑️ 解除安裝

```bash
espanso uninstall espanso-ai-pack
```

> 註：解除安裝後建議執行 `espanso restart`。

---

## 🎯 使用方法

安裝完成後，您可以在任何文字輸入欄位中輸入觸發詞來使用提示詞。

### 基本使用

1. 在任何文字輸入欄位中輸入觸發詞（例如：`:code-review`）
2. Espanso 會自動將觸發詞替換為完整的提示詞模板
3. 如果提示詞包含變數，會彈出表單讓您填寫

### 範例

輸入 `:code-review` 後，會自動展開為：

```
請審查以下程式碼，並提供詳細的回饋：

1. **程式碼品質**：是否遵循最佳實踐？
2. **潛在問題**：是否有 bug 或安全漏洞？
3. **效能**：是否有效能改進空間？
4. **可讀性**：命名是否清晰？結構是否合理？
5. **建議**：具體的改進方案

程式碼：
```

---

## 📋 提示詞列表

以下是目前套件中包含的所有提示詞：

### 程式開發類

| 觸發詞 | 名稱 | 說明 |
|--------|------|------|
| `:code-review` | 程式碼審查 | 請 AI 審查程式碼並提供改進建議 |
| `:explain-code` | 解釋程式碼 | 請 AI 詳細解釋程式碼的功能與邏輯 |
| `:refactor` | 程式碼重構 | 請 AI 重構程式碼以提升品質 |
| `:write-test` | 撰寫測試 | 請 AI 為程式碼撰寫單元測試 |
| `:fix-bug` | 修復 Bug | 請 AI 分析並修復程式碼中的錯誤 |
| `:write-doc` | 撰寫文件 | 請 AI 為程式碼撰寫技術文件 |
| `:git-commit` | Git Commit 訊息 | 請 AI 撰寫符合規範的 Git Commit 訊息 |
| `:sql-query` | SQL 查詢 | 請 AI 撰寫或優化 SQL 查詢 |

### 文字處理類

| 觸發詞 | 名稱 | 說明 |
|--------|------|------|
| `:translate` | 翻譯文字 | 請 AI 翻譯文字內容 |
| `:summarize` | 內容摘要 | 請 AI 摘要長篇內容 |

---

## 🤝 貢獻提示詞

我們非常歡迎社群貢獻新的提示詞！您可以透過以下步驟來貢獻：

### 步驟一：建立 Issue

1. 前往 [Issues](../../issues) 頁面
2. 點擊 **New Issue**
3. 選擇 **新增提示詞** 模板
4. 填寫以下資訊：
   - **Trigger**：觸發詞（必須以 `:` 開頭）
   - **Label**：顯示名稱
   - **Description**：提示詞的用途說明
   - **Prompt**：完整的提示詞內容

### 步驟二：等待審核

提交 Issue 後，維護者會審核您的提示詞。審核通過後，維護者會輸入 `/approved` 指令，系統會自動將您的提示詞加入套件。

### 提示詞格式規範

#### 基本格式

```yaml
# 提示詞說明
# Prompt Description

trigger: ":your-trigger"
label: "您的提示詞名稱"
description: "簡短說明這個提示詞的用途"

prompt: |
  您的提示詞內容...
```

#### 使用變數

您可以在提示詞中使用變數，讓使用者可以自訂部分內容：

```yaml
prompt: |
  請將以下內容翻譯成 {{target_language|繁體中文}}：

  {{text}}
```

- `{{variable}}`：必填變數，使用時會彈出表單請使用者輸入
- `{{variable|預設值}}`：選填變數，如果使用者未輸入則使用預設值

#### 格式要求

1. **Trigger 規則**：
   - 必須以冒號 `:` 開頭
   - 不可包含空格
   - 建議使用英文小寫字母和連字號 `-`
   - 長度至少 2 個字元

2. **Label**：使用繁體中文，簡潔明瞭

3. **Description**：說明這個提示詞的使用情境和目的

4. **Prompt**：
   - 結構清晰，使用 Markdown 格式
   - 如需使用者輸入，使用 `{{variable}}` 語法

**詳細格式規範**：請參考 [上架 Hub 指南](docs/publishing-to-hub.md#套件規格檢查)

---

## 🛠 開發指南

如果您想在本地開發或測試這個套件，請參考以下步驟。

### 環境需求

- [Bun](https://bun.sh/) v1.0.0 或以上版本
- [Git](https://git-scm.com/)

### 安裝依賴

```bash
# 克隆專案
git clone https://github.com/doggy8088/espanso-ai-pack.git
cd espanso-ai-pack

# 安裝依賴
bun install
```

### 專案結構

```
espanso-ai-pack/
├── prompts/                 # 提示詞原始檔案
│   ├── code-review.yml
│   ├── explain-code.yml
│   └── ...
├── scripts/
│   ├── build.ts            # 建置腳本
│   └── validate.ts         # 驗證腳本
├── dist/
│   └── package.yml         # 建置產出（供下載中心使用）
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # CI/CD 工作流程
│   │   └── process-issue.yml # Issue 處理工作流程
│   └── ISSUE_TEMPLATE/
│       └── new-prompt.yml  # Issue 模板
├── package.json
├── package.yml             # 建置產出（供 espanso install 使用）
└── README.md
```

### 常用指令

```bash
# 驗證所有提示詞格式
bun run validate

# 建置套件
bun run build
```

### 新增提示詞（開發者）

1. 在 `prompts/` 目錄下建立新的 `.yml` 檔案
2. 按照格式規範填寫內容
3. 執行 `bun run validate` 確認格式正確
4. 執行 `bun run build` 產生新的 `package.yml`
5. 提交 PR

### 建置流程說明

建置腳本 (`scripts/build.ts`) 會：

1. 讀取 `prompts/` 目錄下的所有 `.yml` 檔案
2. 解析每個檔案的內容
3. 提取並處理變數（`{{variable}}` 或 `{{variable|default}}`）
4. 轉換為 Espanso 支援的格式
5. 合併所有提示詞並輸出到 `package.yml` 與 `dist/package.yml`

---

## 📄 授權條款

本專案採用 [MIT 授權條款](LICENSE)。

---

## 🙏 致謝

- [Espanso](https://espanso.org/) - 強大的跨平台文字擴展工具
- 所有貢獻提示詞的社群成員

---

## 📮 聯絡方式

- **問題回報**：請透過 [Issues](https://github.com/doggy8088/espanso-ai-pack/issues) 提交
- **功能建議**：歡迎在 [Discussions](https://github.com/doggy8088/espanso-ai-pack/discussions) 討論
- **提示詞貢獻**：請使用 Issue 模板提交

## 📚 文件資源

- **[上架 Espanso Hub 指南](docs/publishing-to-hub.md)** - 完整的上架流程說明
- **[Espanso 官方文件](https://espanso.org/docs/)** - Espanso 使用手冊
- **[外部安裝指南](docs/external-installation.md)** - 從 GitHub 或本地安裝的詳細步驟

---

<div align="center">

**如果這個專案對您有幫助，歡迎給個 ⭐️ Star！**

</div>
