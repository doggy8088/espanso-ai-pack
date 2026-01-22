/**
 * Espanso AI Pack 建置腳本
 * 使用 Bun 執行：bun run build.ts
 */

import { readdir, readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { join } from "path";
import { parse, stringify } from "yaml";
import { existsSync } from "fs";

interface PromptConfig {
  trigger: string;
  label: string;
  description: string;
  prompt: string;
}

interface EspansoMatch {
  trigger: string;
  label: string;
  replace: string;
  vars?: Array<{
    name: string;
    type: string;
    params: {
      prompt: string;
      default?: string;
    };
  }>;
}

interface EspansoPackage {
  matches: EspansoMatch[];
}

const PROMPTS_DIR = "./prompts";
const DIST_DIR = "./dist";
const OUTPUT_FILE = "package.yml";
const ROOT_OUTPUT_PATH = `./${OUTPUT_FILE}`;

/**
 * 從 prompt 內容中提取變數
 * 支援格式：{{variable}} 或 {{variable|default_value}}
 */
function extractVariables(prompt: string): Array<{ name: string; default?: string }> {
  const regex = /\{\{(\w+)(?:\|([^}]+))?\}\}/g;
  const variables: Array<{ name: string; default?: string }> = [];
  const seen = new Set<string>();

  let match;
  while ((match = regex.exec(prompt)) !== null) {
    const name = match[1];
    const defaultValue = match[2];

    if (!seen.has(name)) {
      seen.add(name);
      variables.push({ name, default: defaultValue });
    }
  }

  return variables;
}

/**
 * 將 prompt 中的變數語法轉換為 espanso 格式
 */
function convertPromptToEspanso(prompt: string): string {
  // 將 {{variable|default}} 轉換為 {{variable}}
  return prompt.replace(/\{\{(\w+)(?:\|[^}]+)?\}\}/g, "{{$1}}");
}

/**
 * 讀取並解析單一 prompt 檔案
 */
async function parsePromptFile(filePath: string): Promise<PromptConfig | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const config = parse(content) as PromptConfig;

    // 驗證必要欄位
    if (!config.trigger || !config.prompt) {
      console.warn(`⚠️  跳過 ${filePath}: 缺少必要欄位 (trigger 或 prompt)`);
      return null;
    }

    return config;
  } catch (error) {
    console.error(`❌ 解析失敗 ${filePath}:`, error);
    return null;
  }
}

/**
 * 將 PromptConfig 轉換為 Espanso Match
 */
function convertToEspansoMatch(config: PromptConfig): EspansoMatch {
  const variables = extractVariables(config.prompt);
  const convertedPrompt = convertPromptToEspanso(config.prompt);

  const match: EspansoMatch = {
    trigger: config.trigger,
    label: config.label || config.trigger,
    replace: convertedPrompt,
  };

  // 如果有變數，加入 vars 設定
  if (variables.length > 0) {
    match.vars = variables.map((v) => ({
      name: v.name,
      type: "form",
      params: {
        prompt: `請輸入 ${v.name}`,
        ...(v.default && { default: v.default }),
      },
    }));
  }

  return match;
}

/**
 * 同步 package.json 版本號到 _manifest.yml
 */
async function syncVersion(): Promise<void> {
  try {
    // 讀取 package.json
    const packageJson = JSON.parse(await readFile("./package.json", "utf-8"));
    const version = packageJson.version;

    if (!version) {
      console.warn("⚠️  package.json 中沒有 version 欄位");
      return;
    }

    // 讀取 _manifest.yml
    const manifestContent = await readFile("./_manifest.yml", "utf-8");
    const manifest = parse(manifestContent);

    // 檢查版本是否需要更新
    if (manifest.version === version) {
      console.log(`✅ 版本號已同步: ${version}`);
      return;
    }

    // 更新版本號
    manifest.version = version;

    // 使用 stringify 保持格式，但手動處理以保留註解
    const lines = manifestContent.split('\n');
    const newLines = lines.map(line => {
      if (line.match(/^version:/)) {
        return `version: "${version}"`;
      }
      return line;
    });

    await writeFile("./_manifest.yml", newLines.join('\n'), "utf-8");
    console.log(`🔄 已將 _manifest.yml 版本號更新為: ${version}`);
  } catch (error) {
    console.error("❌ 同步版本號失敗:", error);
    throw error;
  }
}

/**
 * 主建置流程
 */
async function build(): Promise<void> {
  console.log("🚀 開始建置 Espanso AI Pack...\n");

  // 先同步版本號
  await syncVersion();
  console.log();

  // 確保輸出目錄存在
  await mkdir(DIST_DIR, { recursive: true });

  // 讀取所有 prompt 檔案
  const files = await readdir(PROMPTS_DIR);
  const yamlFiles = files.filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  console.log(`📁 找到 ${yamlFiles.length} 個 prompt 檔案\n`);

  const matches: EspansoMatch[] = [];

  for (const file of yamlFiles) {
    const filePath = join(PROMPTS_DIR, file);
    const config = await parsePromptFile(filePath);

    if (config) {
      const match = convertToEspansoMatch(config);
      matches.push(match);
      console.log(`✅ ${file} -> ${config.trigger}`);
    }
  }

  // 建立最終的 package
  const espansoPackage: EspansoPackage = { matches };

  // 手動生成 YAML 以保持格式
  const output = generateYamlOutput(espansoPackage);

  // 寫入輸出檔案（dist 與根目錄）
  const outputPath = join(DIST_DIR, OUTPUT_FILE);
  await writeFile(outputPath, output, "utf-8");
  await writeFile(ROOT_OUTPUT_PATH, output, "utf-8");

  // 複製 index.html 到 dist 目錄
  const indexHtmlSource = "./dist/index.html";
  if (existsSync(indexHtmlSource)) {
    console.log(`\n📄 index.html 已存在於 dist 目錄`);
  } else {
    console.log(`\n⚠️  警告：dist/index.html 不存在`);
  }

  console.log(`\n✨ 建置完成！`);
  console.log(`📦 輸出檔案: ${outputPath}`);
  console.log(`📦 根目錄同步: ${ROOT_OUTPUT_PATH}`);
  console.log(`📊 總計 ${matches.length} 個提示詞`);
}

/**
 * 生成格式化的 YAML 輸出
 */
function generateYamlOutput(pkg: EspansoPackage): string {
  const lines: string[] = [
    "# Espanso AI Pack",
    "# 自動生成的提示詞套件",
    `# 生成時間: ${new Date().toISOString()}`,
    `# 提示詞數量: ${pkg.matches.length}`,
    "",
    "matches:",
  ];

  for (const match of pkg.matches) {
    lines.push(`  - trigger: "${match.trigger}"`);
    lines.push(`    label: "${match.label}"`);

    // 處理多行 replace
    if (match.replace.includes("\n")) {
      lines.push("    replace: |");
      const replaceLines = match.replace.split("\n");
      for (const line of replaceLines) {
        lines.push(`      ${line}`);
      }
    } else {
      lines.push(`    replace: "${match.replace}"`);
    }

    // 處理 vars
    if (match.vars && match.vars.length > 0) {
      lines.push("    vars:");
      for (const v of match.vars) {
        lines.push(`      - name: "${v.name}"`);
        lines.push(`        type: "${v.type}"`);
        lines.push("        params:");
        lines.push(`          prompt: "${v.params.prompt}"`);
        if (v.params.default) {
          lines.push(`          default: "${v.params.default}"`);
        }
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

// 執行建置
build().catch((error) => {
  console.error("建置失敗:", error);
  process.exit(1);
});
