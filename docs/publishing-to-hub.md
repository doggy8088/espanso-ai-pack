# 上架 Espanso Hub 完整指南

本文件說明如何將 **Espanso AI Pack** 上架到 [Espanso Hub](https://hub.espanso.org/)，讓全世界的使用者都能安裝使用。

---

## 📋 目錄

1. [前置需求](#前置需求)
2. [套件規格檢查](#套件規格檢查)
3. [上架步驟](#上架步驟)
4. [審核流程](#審核流程)
5. [版本更新](#版本更新)
6. [常見問題](#常見問題)

---

## 前置需求

在開始上架前，請確認以下事項：

### 1. 套件結構

您的套件必須包含以下必要檔案：

```
espanso-ai-pack/
├── _manifest.yml          # ✅ 必要：套件 metadata
├── package.yml            # ✅ 必要：主要的 matches 定義
├── README.md              # ✅ 必要：套件說明文件（Markdown 格式）
└── LICENSE                # ⭐ 建議：授權條款（預設為 MIT）
```

### 2. 套件命名規則

套件名稱（`name`）只能包含：
- 小寫英文字母（a-z）
- 數字（0-9）
- 連字號（-）

✅ **有效範例**：
- `espanso-ai-pack`
- `my-nice-package1234`
- `great-package`

❌ **無效範例**：
- `My Package`（含大寫和空格）
- `my_package`（含底線）
- `nice@package`（含特殊符號）

### 3. GitHub 帳號

上架到 Espanso Hub 需要透過 GitHub Pull Request，請確保您有 GitHub 帳號。

---

## 套件規格檢查

### 1. `_manifest.yml` 格式驗證

您的 `_manifest.yml` 必須包含以下欄位：

```yaml
name: "espanso-ai-pack"              # ✅ 必要：套件名稱（須符合命名規則）
title: "AI 提示詞套件"                # ✅ 必要：顯示名稱（可使用中文）
description: "收集常見的 AI 提示詞"   # ✅ 必要：簡短說明
version: "0.1.0"                     # ✅ 必要：版本號（MAJOR.MINOR.PATCH）
author: "Your Name"                  # ✅ 必要：作者名稱
tags: ["ai", "prompts", "chatgpt"]   # ✅ 必要：關鍵字標籤
homepage: "https://github.com/..."   # ✅ 必要：套件首頁或 GitHub repo
```

**版本號規則**：
- 格式：`MAJOR.MINOR.PATCH`
- 新套件建議從 `0.1.0` 開始
- 版本號必須與目錄結構一致（見下方）

### 2. `package.yml` 格式驗證

`package.yml` 是主要的 matches 檔案，格式應符合 [Espanso 的 match 規範](https://espanso.org/docs/matches/basics/)：

```yaml
matches:
  - trigger: ":hello"
    replace: "Hello from package"
  
  - trigger: ":codereview"
    replace: |
      請審查以下程式碼...
    vars:
      - name: "code"
        type: "form"
        params:
          prompt: "請輸入程式碼"
```

**注意事項**：
- ✅ 使用 `.yml` 副檔名（而非 `.yaml`），以相容舊版本
- ✅ 確保 YAML 語法正確（可用 `bun run validate` 驗證）
- ✅ Trigger 建議以 `:` 開頭，避免與一般文字衝突

### 3. `README.md` 內容要求

README 應包含：
- 套件簡介
- 功能特色
- 安裝方式
- 使用範例
- Trigger 列表
- 授權資訊

建議使用清晰的 Markdown 格式，參考本專案的 `README.md`。

---

## 上架步驟

### Step 1: Fork Espanso Hub Repository

1. 前往 [Espanso Hub Repository](https://github.com/espanso/hub)
2. 點擊右上角的 **Fork** 按鈕
3. Fork 到您的 GitHub 帳號

### Step 2: 複製並建立套件目錄

1. 將您的 Fork clone 到本地：
   ```bash
   git clone https://github.com/YOUR_USERNAME/hub.git
   cd hub
   ```

2. 進入 `packages/` 目錄：
   ```bash
   cd packages
   ```

3. 複製範本目錄並重新命名：
   ```bash
   # 複製 dummy-package 作為範本
   cp -r dummy-package espanso-ai-pack
   ```

4. 建立版本目錄結構：
   ```bash
   cd espanso-ai-pack
   # 目錄名稱必須與 _manifest.yml 中的 version 一致
   mv 0.1.0 0.1.0  # 或建立新的版本目錄
   ```

最終結構應為：
```
hub/
└── packages/
    └── espanso-ai-pack/        # 套件名稱
        └── 0.1.0/              # 版本號
            ├── _manifest.yml
            ├── package.yml
            ├── README.md
            └── LICENSE (optional)
```

### Step 3: 放置您的套件檔案

將以下檔案複製到 `packages/espanso-ai-pack/0.1.0/` 目錄：

1. **建置套件**（如果您使用建置腳本）：
   ```bash
   cd /path/to/espanso-ai-pack
   bun run build
   ```

2. **複製檔案到 Hub**：
   ```bash
   # 複製主要檔案
   cp dist/package.yml /path/to/hub/packages/espanso-ai-pack/0.1.0/
   cp _manifest.yml /path/to/hub/packages/espanso-ai-pack/0.1.0/
   cp README.md /path/to/hub/packages/espanso-ai-pack/0.1.0/
   cp LICENSE /path/to/hub/packages/espanso-ai-pack/0.1.0/
   ```

### Step 4: 驗證檔案

在提交前，請確認：

```bash
cd /path/to/hub/packages/espanso-ai-pack/0.1.0/

# 檢查檔案是否存在
ls -la

# 驗證 YAML 格式
cat _manifest.yml
cat package.yml

# 確認套件名稱一致
# _manifest.yml 中的 name 必須等於 espanso-ai-pack
# _manifest.yml 中的 version 必須等於 0.1.0
```

**關鍵檢查項目**：
- [ ] `_manifest.yml` 的 `name` 與目錄名稱一致
- [ ] `_manifest.yml` 的 `version` 與版本目錄一致
- [ ] 所有必要欄位都已填寫
- [ ] YAML 格式正確無誤
- [ ] README.md 內容完整清晰

### Step 5: Commit 與 Push

```bash
cd /path/to/hub

git add packages/espanso-ai-pack/
git commit -m "feat: add espanso-ai-pack package"
git push origin main
```

### Step 6: 建立 Pull Request

1. 前往您的 Fork：`https://github.com/YOUR_USERNAME/hub`
2. 點擊 **Pull Request** 或 **Compare & pull request**
3. 確認 base repository 是 `espanso/hub`，base 是 `main`
4. 填寫 PR 標題與說明：

**PR 標題範例**：
```
Add espanso-ai-pack: AI prompts collection
```

**PR 說明範例**：
```markdown
## Package Description

This package provides a collection of commonly used AI prompts for ChatGPT, Claude, and other AI tools.

## Features

- 10+ pre-built prompts for code review, refactoring, testing, etc.
- Support for custom variables
- Chinese (Traditional) interface

## Checklist

- [x] Package name follows naming rules
- [x] All required files included (_manifest.yml, package.yml, README.md)
- [x] Version number is correct
- [x] README.md is well-documented
- [x] Tested locally with `espanso install`
```

5. 點擊 **Create Pull Request**

---

## 審核流程

提交 PR 後，Espanso 團隊會進行審核：

### 審核項目

審核者會檢查：
1. **格式正確性**：YAML 語法、檔案結構
2. **命名規範**：套件名稱、版本號
3. **內容品質**：README 是否清楚、matches 是否有用
4. **安全性**：是否包含惡意程式碼或腳本
5. **授權合規**：LICENSE 是否正確

### 回應審核意見

審核者可能會要求修改：
1. 在您的 Fork 中進行修改
2. Commit 並 push（會自動更新 PR）
3. 回覆審核者說明已修正

### 審核通過

審核通過後，您的套件會被合併到 Espanso Hub，使用者即可透過以下指令安裝：

```bash
espanso install espanso-ai-pack
```

---

## 版本更新

當您需要更新套件時：

### 1. 建立新版本目錄

```bash
cd /path/to/hub/packages/espanso-ai-pack/
cp -r 0.1.0 0.2.0  # 建立新版本
```

### 2. 更新檔案

在 `0.2.0/` 目錄中：
- 更新 `_manifest.yml` 的 `version` 為 `0.2.0`
- 更新 `package.yml`（新增或修改 matches）
- 更新 `README.md`（說明新功能）

### 3. 提交 PR

流程同上架步驟，PR 標題建議為：
```
Update espanso-ai-pack to v0.2.0
```

---

## 常見問題

### Q1: 版本號應該如何遞增？

遵循 [Semantic Versioning](https://semver.org/)：
- **MAJOR** (1.0.0)：不相容的 API 變更
- **MINOR** (0.1.0)：新增向下相容的功能
- **PATCH** (0.0.1)：向下相容的 bug 修復

範例：
- 新增提示詞：`0.1.0` → `0.2.0`
- 修正錯字：`0.1.0` → `0.1.1`
- 重大變更（破壞相容性）：`0.1.0` → `1.0.0`

### Q2: 可以包含多個 YAML 檔案嗎？

可以！除了 `package.yml`，您可以加入其他 `.yml` 檔案並在 `package.yml` 中 import：

```yaml
# package.yml
imports:
  - "prompts-coding.yml"
  - "prompts-writing.yml"

matches:
  - trigger: ":main"
    replace: "Main package trigger"
```

### Q3: 如何在本地測試套件？

方法一：直接安裝您的 GitHub repo
```bash
espanso install espanso-ai-pack \
  --git https://github.com/YOUR_USERNAME/espanso-ai-pack \
  --external
```

方法二：手動複製到 packages 目錄
```bash
# 查看 packages 目錄位置
espanso path packages

# 手動複製
cp -r /path/to/your/package $(espanso path packages)/espanso-ai-pack

# 重啟 Espanso
espanso restart
```

### Q4: 需要提供授權嗎？

建議提供 `LICENSE` 檔案。如果沒有提供，預設會使用 Espanso Hub 的 MIT License。

常見開源授權：
- MIT（最寬鬆，推薦）
- Apache 2.0
- GPL v3

### Q5: 審核需要多久時間？

通常 1-2 週，視審核者的工作量而定。保持耐心並隨時準備回應審核意見。

### Q6: 可以使用中文嗎？

可以！
- `title`、`description`：可以使用中文
- `name`、`trigger`：建議使用英文（技術限制）
- `README.md`：可以使用中文，但建議同時提供英文版本以觸及更多使用者

### Q7: 套件被拒絕了怎麼辦？

1. 仔細閱讀審核者的意見
2. 根據意見修正套件
3. 在 PR 中回覆說明已修正
4. 如有疑問，禮貌地向審核者詢問

---

## 參考資源

- [Espanso Hub](https://hub.espanso.org/)
- [Espanso Hub GitHub](https://github.com/espanso/hub)
- [Package Specification](https://espanso.org/docs/packages/package-specification/)
- [Creating a Package](https://espanso.org/docs/packages/creating-a-package/)
- [External Packages](https://espanso.org/docs/packages/external-packages/)

---

## 需要協助？

- 📧 **GitHub Issues**: [espanso-ai-pack/issues](../../issues)
- 💬 **Espanso Discord**: [discord.gg/espanso](https://discord.gg/espanso)
- 📖 **官方文件**: [espanso.org/docs](https://espanso.org/docs/)

---

**祝您上架順利！🎉**

