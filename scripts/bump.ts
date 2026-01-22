/**
 * 版本升級腳本
 * 使用 Bun 執行：bun run bump.ts [major|minor|patch]
 */

import { readFile, writeFile } from "fs/promises";
import { execSync } from "child_process";

const BUMP_TYPE = process.argv[2] || "patch";

if (!["major", "minor", "patch"].includes(BUMP_TYPE)) {
  console.error("❌ 無效的升級類型，請使用 major、minor 或 patch");
  process.exit(1);
}

async function bumpVersion(): Promise<void> {
  try {
    console.log(`🚀 開始升級版本 (${BUMP_TYPE})...\n`);

    // 讀取 package.json
    const packageJson = JSON.parse(await readFile("./package.json", "utf-8"));
    const currentVersion = packageJson.version;

    // 解析版本號
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    // 計算新版本號
    let newVersion: string;
    switch (BUMP_TYPE) {
      case "major":
        newVersion = `${major + 1}.0.0`;
        break;
      case "minor":
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case "patch":
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      default:
        throw new Error("無效的升級類型");
    }

    console.log(`📌 目前版本: ${currentVersion}`);
    console.log(`📌 新版本: ${newVersion}\n`);

    // 更新 package.json
    packageJson.version = newVersion;
    await writeFile("./package.json", JSON.stringify(packageJson, null, 2) + "\n", "utf-8");
    console.log("✅ 已更新 package.json");

    // 執行建置（會自動同步 _manifest.yml）
    console.log("\n🔨 執行建置...");
    execSync("bun run build", { stdio: "inherit" });

    console.log(`\n✨ 版本升級完成！`);
    console.log(`📦 新版本: ${newVersion}`);
    console.log(`\n💡 下一步：`);
    console.log(`   git add .`);
    console.log(`   git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`   git push`);
  } catch (error) {
    console.error("❌ 版本升級失敗:", error);
    process.exit(1);
  }
}

bumpVersion();
