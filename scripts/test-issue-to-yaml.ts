/**
 * 測試從 Issue 生成 YAML（包含自動偵測 form_fields）
 */

import { generateYamlFromIssue } from "./validate.ts";

// 模擬 Issue #3 的內容
const issueContent = `
### Trigger
:nbp

### Label
資訊圖表（專業風格）

### Description
生成一張專業風格的資訊圖表

### Prompt
\`\`\`
Infographic, $|$ style, zh-tw language on text, cheerful, clean lines, simple shapes, 16:9 aspect ratio, professional, easy to understand, detailed, high resolution, soft lighting, (best quality, masterpiece)

Negative prompt: ugly, deformed, noisy, blurry, low quality, bad anatomy, bad proportions, out of frame, text, watermark, signature

Content:
{{content}}
\`\`\`
`;

console.log("🧪 測試從 Issue 生成 YAML");
console.log("=".repeat(70));
console.log("\n📥 輸入 Issue 內容:");
console.log("─".repeat(70));
console.log(issueContent);
console.log("\n📤 生成的 YAML 檔案:");
console.log("─".repeat(70));

const yaml = generateYamlFromIssue(issueContent, 3, "@doggy8088");

if (yaml) {
  console.log(yaml);
  console.log("\n");
  console.log("✅ 成功生成 YAML，且自動偵測到 content 應為 multiline");
} else {
  console.log("❌ 解析失敗");
}

console.log("\n");
console.log("=".repeat(70));

// 測試案例 2: 多個變數
const issueContent2 = `
### Trigger
:codereview

### Label
程式碼審查

### Description
審查程式碼並提供建議

### Prompt
\`\`\`
請審查以下程式碼：

{{code}}

重點關注：{{focus|安全性和效能}}

額外說明：
{{notes}}
\`\`\`
`;

console.log("🧪 測試案例 2: 多個變數（混合 inline 和 multiline）");
console.log("=".repeat(70));
console.log("\n📤 生成的 YAML 檔案:");
console.log("─".repeat(70));

const yaml2 = generateYamlFromIssue(issueContent2, 999, "@testuser");

if (yaml2) {
  console.log(yaml2);
  console.log("\n");
  console.log("✅ 成功生成 YAML");
  console.log("   - code 應為 multiline (單獨成行)");
  console.log("   - focus 不應為 multiline (行內變數)");
  console.log("   - notes 應為 multiline (單獨成行)");
} else {
  console.log("❌ 解析失敗");
}
