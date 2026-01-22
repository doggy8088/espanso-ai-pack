/**
 * 偵測 prompt 中需要 multiline 設定的變數
 * 規則：變數單獨存在一整行時，應設定為 multiline: true
 */

export interface MultilineVariable {
  name: string;
  defaultValue?: string;
}

/**
 * 檢測 prompt 中哪些變數應該設定為 multiline
 * @param prompt Prompt 內容
 * @returns 需要 multiline 的變數列表
 */
export function detectMultilineVariables(prompt: string): MultilineVariable[] {
  const lines = prompt.split("\n");
  const multilineVars = new Set<string>();
  const varDefaults = new Map<string, string>();

  // 正規表達式匹配變數: {{varName}} 或 {{varName|defaultValue}}
  const varRegex = /\{\{(\w+)(?:\|([^}]*))?\}\}/g;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 檢查此行是否只包含一個變數（允許前後有空白）
    const matches = [...trimmedLine.matchAll(varRegex)];
    
    if (matches.length === 1) {
      // 檢查移除變數後是否只剩空白
      const withoutVar = trimmedLine.replace(varRegex, "").trim();
      
      if (withoutVar === "") {
        const varName = matches[0][1];
        const defaultValue = matches[0][2];
        
        multilineVars.add(varName);
        if (defaultValue) {
          varDefaults.set(varName, defaultValue);
        }
      }
    }
  }

  // 轉換為結果陣列
  return Array.from(multilineVars).map((name) => ({
    name,
    defaultValue: varDefaults.get(name),
  }));
}

/**
 * 生成 form_fields YAML 內容
 * @param variables 需要 multiline 的變數
 * @returns YAML 格式的 form_fields 區塊（如果有變數的話）
 */
export function generateFormFields(variables: MultilineVariable[]): string {
  if (variables.length === 0) {
    return "";
  }

  const lines: string[] = ["", "form_fields:"];
  
  for (const variable of variables) {
    lines.push(`  ${variable.name}:`);
    lines.push(`    multiline: true`);
  }

  return lines.join("\n");
}

/**
 * 從 prompt 生成完整的 YAML 內容（包含 form_fields）
 * @param config Prompt 設定
 * @returns 完整的 YAML 內容
 */
export function generateYamlWithFormFields(config: {
  trigger: string;
  label: string;
  description: string;
  prompt: string;
  issueNumber?: number;
  contributor?: string;
}): string {
  const lines: string[] = [];

  // 新增貢獻資訊（如果有）
  if (config.issueNumber && config.contributor) {
    lines.push(`# 提示詞由 Issue #${config.issueNumber} 貢獻`);
    lines.push(`# 貢獻者: ${config.contributor}`);
    lines.push("");
  }

  // 基本欄位
  lines.push(`trigger: "${config.trigger}"`);
  lines.push(`label: "${config.label}"`);
  lines.push(`description: "${config.description}"`);
  lines.push("");
  lines.push("prompt: |");
  
  // Prompt 內容（每行縮排兩個空格）
  for (const line of config.prompt.split("\n")) {
    lines.push(`  ${line}`);
  }

  // 自動偵測並生成 form_fields
  const multilineVars = detectMultilineVariables(config.prompt);
  const formFields = generateFormFields(multilineVars);
  
  if (formFields) {
    lines.push(formFields);
  }

  return lines.join("\n");
}
