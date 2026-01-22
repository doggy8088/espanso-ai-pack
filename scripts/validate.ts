/**
 * 提示詞格式驗證腳本
 * 用於 CI 和本地驗證
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { parse } from "yaml";

interface PromptConfig {
  trigger: string;
  label: string;
  description: string;
  prompt: string;
}

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const PROMPTS_DIR = "./prompts";

const REQUIRED_FIELDS = ["trigger", "label", "description", "prompt"];

/**
 * 驗證單一 prompt 檔案
 */
async function validatePromptFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath,
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = await readFile(filePath, "utf-8");
    const config = parse(content) as PromptConfig;

    // 檢查必要欄位
    for (const field of REQUIRED_FIELDS) {
      if (!(field in config) || !config[field as keyof PromptConfig]) {
        result.errors.push(`缺少必要欄位: ${field}`);
        result.valid = false;
      }
    }

    // 驗證 trigger 格式
    if (config.trigger) {
      if (!config.trigger.startsWith(":")) {
        result.errors.push("trigger 必須以冒號 (:) 開頭");
        result.valid = false;
      }
      if (config.trigger.includes(" ")) {
        result.errors.push("trigger 不可包含空格");
        result.valid = false;
      }
      if (config.trigger.length < 2) {
        result.errors.push("trigger 長度至少需要 2 個字元");
        result.valid = false;
      }
    }

    // 驗證 prompt 內容
    if (config.prompt) {
      if (config.prompt.trim().length < 10) {
        result.warnings.push("prompt 內容過短，建議提供更詳細的提示詞");
      }
    }

    // 驗證變數格式
    const variableRegex = /\{\{(\w+)(?:\|([^}]*))?\}\}/g;
    let match;
    while ((match = variableRegex.exec(config.prompt || "")) !== null) {
      const varName = match[1];
      if (varName.length < 2) {
        result.warnings.push(`變數名稱 "${varName}" 過短，建議使用更具描述性的名稱`);
      }
    }

  } catch (error) {
    result.errors.push(`YAML 解析錯誤: ${error}`);
    result.valid = false;
  }

  return result;
}

/**
 * 從 Issue 內容解析提示詞
 */
export function parseIssueContent(content: string): PromptConfig | null {
  const triggerMatch = content.match(/### Trigger\s*\n+`?([^`\n]+)`?/i);
  const labelMatch = content.match(/### Label\s*\n+(.+)/i);
  const descriptionMatch = content.match(/### Description\s*\n+([\s\S]*?)(?=###|$)/i);
  const promptMatch = content.match(/### Prompt\s*\n+```[\s\S]*?\n([\s\S]*?)```/i);

  if (!triggerMatch || !labelMatch || !descriptionMatch || !promptMatch) {
    return null;
  }

  return {
    trigger: triggerMatch[1].trim(),
    label: labelMatch[1].trim(),
    description: descriptionMatch[1].trim(),
    prompt: promptMatch[1].trim(),
  };
}

/**
 * 驗證從 Issue 解析的提示詞
 */
export function validatePromptConfig(config: PromptConfig): ValidationResult {
  const result: ValidationResult = {
    file: "issue",
    valid: true,
    errors: [],
    warnings: [],
  };

  // 檢查必要欄位
  for (const field of REQUIRED_FIELDS) {
    if (!(field in config) || !config[field as keyof PromptConfig]) {
      result.errors.push(`缺少必要欄位: ${field}`);
      result.valid = false;
    }
  }

  // 驗證 trigger 格式
  if (config.trigger) {
    if (!config.trigger.startsWith(":")) {
      result.errors.push("trigger 必須以冒號 (:) 開頭");
      result.valid = false;
    }
    if (config.trigger.includes(" ")) {
      result.errors.push("trigger 不可包含空格");
      result.valid = false;
    }
    if (config.trigger.length < 2) {
      result.errors.push("trigger 長度至少需要 2 個字元");
      result.valid = false;
    }
  }

  // 驗證 prompt 內容
  if (config.prompt) {
    if (config.prompt.trim().length < 10) {
      result.warnings.push("prompt 內容過短，建議提供更詳細的提示詞");
    }
  }

  return result;
}

/**
 * 主驗證流程
 */
async function main(): Promise<void> {
  console.log("🔍 開始驗證提示詞檔案...\n");

  const files = await readdir(PROMPTS_DIR);
  const yamlFiles = files.filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  let hasErrors = false;

  for (const file of yamlFiles) {
    const filePath = join(PROMPTS_DIR, file);
    const result = await validatePromptFile(filePath);

    // 輸出結果
    if (result.valid) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      hasErrors = true;
    }

    for (const error of result.errors) {
      console.log(`   ❌ ${error}`);
    }
    for (const warning of result.warnings) {
      console.log(`   ⚠️  ${warning}`);
    }
  }

  console.log(`\n📊 驗證完成: ${yamlFiles.length} 個檔案`);

  if (hasErrors) {
    console.log("\n❌ 驗證失敗，請修正上述錯誤");
    process.exit(1);
  } else {
    console.log("\n✅ 所有檔案驗證通過");
  }
}

// 如果直接執行此腳本
if (import.meta.main) {
  main().catch((error) => {
    console.error("驗證失敗:", error);
    process.exit(1);
  });
}
