/**
 * 測試 multiline 變數偵測邏輯
 */

import { detectMultilineVariables, generateFormFields, generateYamlWithFormFields } from "./detect-multiline-vars.ts";

// 測試案例 1: nanobanana-2.yml 的 prompt
const test1 = `Infographic, $|$ style, zh-tw language on text, cheerful, clean lines, simple shapes, 16:9 aspect ratio, professional, easy to understand, detailed, high resolution, soft lighting, (best quality, masterpiece)

Negative prompt: ugly, deformed, noisy, blurry, low quality, bad anatomy, bad proportions, out of frame, text, watermark, signature

Content:
{{content}}`;

console.log("📝 測試案例 1: nanobanana-2 (變數單獨成行)");
console.log("─".repeat(60));
const vars1 = detectMultilineVariables(test1);
console.log("偵測到的 multiline 變數:", vars1);
console.log("\n生成的 form_fields:");
console.log(generateFormFields(vars1));
console.log("\n");

// 測試案例 2: 變數在行內
const test2 = `請幫我翻譯以下內容：{{text}}
翻譯成：{{language|英文}}`;

console.log("📝 測試案例 2: 變數在行內");
console.log("─".repeat(60));
const vars2 = detectMultilineVariables(test2);
console.log("偵測到的 multiline 變數:", vars2);
console.log("(應該是空陣列)");
console.log("\n");

// 測試案例 3: 混合情況
const test3 = `請根據以下需求生成程式碼：

需求描述：
{{requirements}}

使用語言：{{language|TypeScript}}

額外說明：
{{notes}}`;

console.log("📝 測試案例 3: 混合情況");
console.log("─".repeat(60));
const vars3 = detectMultilineVariables(test3);
console.log("偵測到的 multiline 變數:", vars3);
console.log("(應該包含 requirements 和 notes，但不包含 language)");
console.log("\n生成的 form_fields:");
console.log(generateFormFields(vars3));
console.log("\n");

// 測試案例 4: 完整 YAML 生成
console.log("📝 測試案例 4: 完整 YAML 生成");
console.log("─".repeat(60));
const yaml = generateYamlWithFormFields({
  trigger: ":nbp",
  label: "資訊圖表（專業風格）",
  description: "生成一張專業風格的資訊圖表",
  prompt: test1,
  issueNumber: 3,
  contributor: "@doggy8088",
});
console.log(yaml);
console.log("\n");

// 測試案例 5: 變數前後有空白
const test5 = `標題：
  {{title}}
  
內容：
  {{content}}
  
備註：在這裡輸入 {{note}} 的內容`;

console.log("📝 測試案例 5: 變數前後有空白");
console.log("─".repeat(60));
const vars5 = detectMultilineVariables(test5);
console.log("偵測到的 multiline 變數:", vars5);
console.log("(應該包含 title 和 content，但不包含 note)");
console.log("\n生成的 form_fields:");
console.log(generateFormFields(vars5));
