/**
 * 版本同步測試腳本
 */

import { readFile } from "fs/promises";
import { parse } from "yaml";

async function testVersionSync(): Promise<void> {
  console.log("🧪 測試版本同步...\n");

  try {
    // 讀取 package.json
    const packageJson = JSON.parse(await readFile("./package.json", "utf-8"));
    const packageVersion = packageJson.version;
    console.log(`📦 package.json 版本: ${packageVersion}`);

    // 讀取 _manifest.yml
    const manifestContent = await readFile("./_manifest.yml", "utf-8");
    const manifest = parse(manifestContent);
    const manifestVersion = manifest.version;
    console.log(`📄 _manifest.yml 版本: ${manifestVersion}`);

    // 比較版本
    if (packageVersion === manifestVersion) {
      console.log("\n✅ 版本號一致！");
      process.exit(0);
    } else {
      console.log("\n❌ 版本號不一致！");
      console.log("請執行 `bun run build` 來同步版本號");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ 測試失敗:", error);
    process.exit(1);
  }
}

testVersionSync();
