# 外部安裝指南

本文件說明如何從外部來源（非 Espanso Hub）安裝本套件。

---

## 📋 安裝方法

### 方法一：從 GitHub 安裝（推薦）

直接從本專案的 GitHub repository 安裝：

```bash
espanso install espanso-ai-pack \
  --git https://github.com/doggy8088/espanso-ai-pack \
  --external
```

**說明**：
- `--git`：指定 Git repository URL
- `--external`：表示這是外部套件（非 Hub）
> 註：`espanso install --git` 會讀取 repository 根目錄的 `package.yml`，本專案建置會自動產生並同步。

### 方法二：手動安裝

1. **下載最新的 `package.yml`**：
   - 從 [Releases](../../releases) 頁面下載
   - 或直接從 repository 根目錄的 `package.yml` / `dist/package.yml` 複製

2. **找到 Espanso 的 packages 目錄**：
   ```bash
   espanso path packages
   ```

3. **建立套件目錄**：
   ```bash
   # Windows (PowerShell)
   New-Item -ItemType Directory -Path "$(espanso path packages)\espanso-ai-pack" -Force

   # macOS/Linux
   mkdir -p "$(espanso path packages)/espanso-ai-pack"
   ```

4. **複製檔案**：
   ```bash
   # Windows (PowerShell)
   Copy-Item package.yml "$(espanso path packages)\espanso-ai-pack\"
   Copy-Item _manifest.yml "$(espanso path packages)\espanso-ai-pack\"
   Copy-Item README.md "$(espanso path packages)\espanso-ai-pack\"

   # macOS/Linux
   cp package.yml "$(espanso path packages)/espanso-ai-pack/"
   cp _manifest.yml "$(espanso path packages)/espanso-ai-pack/"
   cp README.md "$(espanso path packages)/espanso-ai-pack/"
   ```

5. **重啟 Espanso**：
   ```bash
   espanso restart
   ```

### 方法三：從本地開發目錄安裝

如果您正在本地開發此套件：

```bash
# 1. 建置套件
bun run build

# 2. 複製到 Espanso packages 目錄
# Windows (PowerShell)
$pkgPath = "$(espanso path packages)\espanso-ai-pack"
New-Item -ItemType Directory -Path $pkgPath -Force
Copy-Item dist\package.yml $pkgPath\
Copy-Item _manifest.yml $pkgPath\
Copy-Item README.md $pkgPath\

# macOS/Linux
PKG_PATH="$(espanso path packages)/espanso-ai-pack"
mkdir -p "$PKG_PATH"
cp dist/package.yml "$PKG_PATH/"
cp _manifest.yml "$PKG_PATH/"
cp README.md "$PKG_PATH/"

# 3. 重啟 Espanso
espanso restart
```

---

## 🔄 更新套件

### 從 GitHub 更新

```bash
espanso package update espanso-ai-pack
```

### 強制重新安裝

如果您修改過套件並想恢復原始版本：

```bash
espanso install espanso-ai-pack \
  --git https://github.com/doggy8088/espanso-ai-pack \
  --external \
  --force
```

---

## 🗑️ 解除安裝

```bash
espanso uninstall espanso-ai-pack
```

---

## 📝 驗證安裝

安裝完成後，可以透過以下方式驗證：

### 1. 列出已安裝的套件

```bash
espanso package list
```

應該會看到 `espanso-ai-pack` 在列表中。

### 2. 測試 Trigger

在任何文字編輯器中輸入 `:code-review`，應該會自動展開為提示詞。

### 3. 檢查套件路徑

```bash
# Windows (PowerShell)
Get-ChildItem "$(espanso path packages)\espanso-ai-pack"

# macOS/Linux
ls -la "$(espanso path packages)/espanso-ai-pack"
```

---

## 🐛 常見問題

### Q: 為什麼安裝後無法使用？

**A**: 請確認：
1. Espanso 是否正在執行：`espanso status`
2. 是否已重啟 Espanso：`espanso restart`
3. 套件檔案是否正確放置：檢查 `espanso path packages`

### Q: 如何安裝特定版本？

**A**: 使用 Git 的 tag 或 branch：

```bash
# 安裝特定 tag
espanso install espanso-ai-pack \
  --git https://github.com/doggy8088/espanso-ai-pack#v0.1.0 \
  --external

# 安裝特定 branch
espanso install espanso-ai-pack \
  --git https://github.com/doggy8088/espanso-ai-pack#develop \
  --external
```

### Q: Git 安裝需要什麼前置條件？

**A**:
- 電腦上需要安裝 `git` 指令
- 如果是私有 repository，需要設定好 Git 認證
- 測試方式：執行 `git clone <repository_url>` 看是否成功

### Q: 手動安裝後如何更新？

**A**: 重複手動安裝步驟，覆蓋舊檔案即可。

---

## 📚 相關資源

- [Espanso 官方文件](https://espanso.org/docs/)
- [External Packages 說明](https://espanso.org/docs/packages/external-packages/)
- [本專案 README](../README.md)
- [上架 Hub 指南](./publishing-to-hub.md)

---

## 💡 給公司或團隊的說明

如果您想在公司內部分享此套件：

1. **建立私有 Git repository**
2. **複製此專案內容到您的 repo**
3. **修改提示詞以符合公司需求**
4. **團隊成員使用上述的 Git 安裝方法**

範例：
```bash
espanso install company-prompts \
  --git https://github.com/your-company/espanso-prompts \
  --external
```

**注意**：私有 repository 需要確保每位成員都有存取權限，並且電腦上的 Git 已正確設定認證。

---

**需要協助？** 請到 [Issues](../../issues) 提問。
