import { 
  LUCIDE_ICONS, 
  isValidIcon, 
  getValidIconSuggestion,
  SANDPACK_DEPENDENCIES 
} from "./component-registry";

export interface ValidationResult {
  isValid: boolean;
  code: string;
  errors: string[];
  warnings: string[];
  fixes: string[];
}

export function validateAndSanitizeCode(rawCode: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: string[] = [];
  
  let code = rawCode;

  code = removeDangerousPatterns(code, fixes);

  code = removeUseClient(code, fixes);

  code = removeCssImports(code, fixes);

  const iconResult = fixIconImports(code);
  code = iconResult.code;
  warnings.push(...iconResult.warnings);
  fixes.push(...iconResult.fixes);

  const importResult = filterImports(code);
  code = importResult.code;
  warnings.push(...importResult.warnings);
  fixes.push(...importResult.fixes);

  code = mergeDuplicateImports(code);

  const exportResult = ensureDefaultExport(code);
  code = exportResult.code;
  if (exportResult.fixed) {
    fixes.push("Added default export");
  }

  code = fixCommonSyntaxIssues(code, fixes);

  code = cleanupWhitespace(code);

  return {
    isValid: errors.length === 0,
    code,
    errors,
    warnings,
    fixes,
  };
}

function removeDangerousPatterns(code: string, fixes: string[]): string {
  let result = code;

  if (/\beval\s*\(/.test(result)) {
    result = result.replace(/\beval\s*\([^)]*\)/g, "(() => {})()");
    fixes.push("Removed eval() calls");
  }

  if (/new\s+Function\s*\(/.test(result)) {
    result = result.replace(/new\s+Function\s*\([^)]*\)/g, "(() => {})");
    fixes.push("Removed Function constructor");
  }

  if (/document\.write\s*\(/.test(result)) {
    result = result.replace(/document\.write\s*\([^)]*\)/g, "console.log");
    fixes.push("Replaced document.write with console.log");
  }

  if (/document\.cookie/.test(result)) {
    result = result.replace(/document\.cookie/g, '""');
    fixes.push("Removed document.cookie access");
  }


  return result;
}

function removeUseClient(code: string, fixes: string[]): string {
  if (/['"]use client['"];?\s*\n?/.test(code)) {
    fixes.push("Removed 'use client' directive");
    return code.replace(/['"]use client['"];?\s*\n?/g, "");
  }
  return code;
}

function removeCssImports(code: string, fixes: string[]): string {
  const cssImportPattern = /import\s+['"][^'"]*\.css['"];?\s*\n?/g;
  if (cssImportPattern.test(code)) {
    fixes.push("Removed CSS imports (using Tailwind CDN)");
    return code.replace(cssImportPattern, "");
  }
  return code;
}

function fixIconImports(code: string): { code: string; warnings: string[]; fixes: string[] } {
  const warnings: string[] = [];
  const fixes: string[] = [];
  let result = code;

  const usedIcons = new Set<string>();
  const iconUsagePattern = /<([A-Z][a-zA-Z0-9]*)\s/g;
  let match;

  while ((match = iconUsagePattern.exec(code)) !== null) {
    const componentName = match[1];
    if (LUCIDE_ICONS.includes(componentName as any)) {
      usedIcons.add(componentName);
    }
  }

  const lucideImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  while ((match = lucideImportPattern.exec(code)) !== null) {
    const importedIcons = match[1].split(",").map(s => s.trim()).filter(Boolean);
    
    importedIcons.forEach(icon => {
      const actualIcon = icon.split(/\s+as\s+/)[0].trim();
      
      if (!isValidIcon(actualIcon)) {
        const suggestion = getValidIconSuggestion(actualIcon);
        warnings.push(`Invalid icon "${actualIcon}" replaced with "${suggestion}"`);
        
        const iconPattern = new RegExp(`\\b${actualIcon}\\b`, "g");
        result = result.replace(iconPattern, suggestion);
        fixes.push(`Replaced invalid icon "${actualIcon}" with "${suggestion}"`);
        usedIcons.add(suggestion);
      } else {
        usedIcons.add(actualIcon);
      }
    });
  }

  if (/<IconName/.test(result)) {
    result = result.replace(/<IconName\s+as=\{(\w+)\}([^/>]*)\/?>/g, "<$1$2/>");
    result = result.replace(/<IconName[^>]*\/>/g, '<CircleHelp className="w-4 h-4" />');
    result = result.replace(/<IconName[^>]*>[^<]*<\/IconName>/g, '<CircleHelp className="w-4 h-4" />');
    fixes.push("Fixed IconName pattern");
    usedIcons.add("CircleHelp");
  }

  result = result.replace(/import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"];?\s*\n?/g, "");

  if (usedIcons.size > 0) {
    const sortedIcons = Array.from(usedIcons).sort();
    const lucideImport = `import { ${sortedIcons.join(", ")} } from "lucide-react";\n`;
    
    const reactImportMatch = result.match(/import\s+.*from\s+['"]react['"];?\s*\n/);
    if (reactImportMatch) {
      result = result.replace(
        reactImportMatch[0],
        reactImportMatch[0] + lucideImport
      );
    } else {
      result = lucideImport + result;
    }
  }

  return { code: result, warnings, fixes };
}

function filterImports(code: string): { code: string; warnings: string[]; fixes: string[] } {
  const warnings: string[] = [];
  const fixes: string[] = [];
  let result = code;

  const allowedPackages = Object.keys(SANDPACK_DEPENDENCIES);

  const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importPattern.exec(code)) !== null) {
    const fullImport = match[0];
    const packagePath = match[1];
    
    if (packagePath.startsWith(".") || packagePath.startsWith("/")) {
      continue;
    }

    const basePackage = packagePath.startsWith("@")
      ? packagePath.split("/").slice(0, 2).join("/")
      : packagePath.split("/")[0];

    const isAllowed = allowedPackages.some(pkg => 
      pkg === basePackage || 
      pkg.startsWith(basePackage) ||
      basePackage.startsWith("@radix-ui")
    );

    if (!isAllowed) {
      warnings.push(`Removed import from unsupported package: ${packagePath}`);
      fixes.push(`Removed ${basePackage} import`);
      result = result.replace(fullImport + /;?\s*\n?/.source, "");
    }
  }

  return { code: result, warnings, fixes };
}

function mergeDuplicateImports(code: string): string {
  const importMap = new Map<string, Set<string>>();
  const otherLines: string[] = [];
  const lines = code.split("\n");

  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("import ")) {
      const fromMatch = line.match(/from\s*['"]([^'"]+)['"]/);
      const namedMatch = line.match(/import\s*\{([^}]*)\}/);

      if (fromMatch && namedMatch) {
        const moduleName = fromMatch[1];
        const imports = namedMatch[1]
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);

        if (!importMap.has(moduleName)) {
          importMap.set(moduleName, new Set());
        }
        imports.forEach(imp => importMap.get(moduleName)!.add(imp));
      } else if (fromMatch) {
        const key = `__DEFAULT__${line}`;
        importMap.set(key, new Set([line]));
      }
    } else {
      otherLines.push(line);
    }
  });

  const importLines: string[] = [];
  importMap.forEach((imports, moduleName) => {
    if (moduleName.startsWith("__DEFAULT__")) {
      imports.forEach(line => importLines.push(line));
    } else if (imports.size > 0) {
      const importList = Array.from(imports).sort().join(", ");
      importLines.push(`import { ${importList} } from "${moduleName}";`);
    }
  });

  return [...importLines, "", ...otherLines].join("\n");
}

function ensureDefaultExport(code: string): { code: string; fixed: boolean } {
  if (/export\s+default\s+/.test(code)) {
    return { code, fixed: false };
  }

  const componentMatch = code.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:=|\()/);
  
  if (componentMatch) {
    const componentName = componentMatch[1];
    
    if (new RegExp(`export\\s+(?:function|const)\\s+${componentName}`).test(code)) {
      return {
        code: code + `\n\nexport default ${componentName};`,
        fixed: true,
      };
    }
    
    if (code.includes(`function ${componentName}`)) {
      return {
        code: code.replace(
          new RegExp(`function\\s+${componentName}`),
          `export default function ${componentName}`
        ),
        fixed: true,
      };
    }
    
    if (code.includes(`const ${componentName}`)) {
      return {
        code: code + `\n\nexport default ${componentName};`,
        fixed: true,
      };
    }
  }

  const wrappedCode = `
export default function GeneratedComponent() {
  return (
    <div className="p-4">
      <p className="text-red-500">Error: Could not find a valid component to export.</p>
      <p className="text-sm text-gray-400">The AI may have generated invalid code.</p>
    </div>
  );
}
  `.trim();

  return { code: wrappedCode, fixed: true };
}

function fixCommonSyntaxIssues(code: string, fixes: string[]): string {
  let result = code;

  const voidElements = ["img", "br", "hr", "input", "meta", "link"];
  voidElements.forEach(el => {
    const pattern = new RegExp(`<${el}([^>]*[^/])>`, "gi");
    if (pattern.test(result)) {
      result = result.replace(pattern, `<${el}$1 />`);
    }
  });

  if (/\bclass\s*=/.test(result) && !/\bclassName\s*=/.test(result)) {
    result = result.replace(/\bclass\s*=/g, "className=");
    fixes.push("Replaced class with className");
  }

  if (/\bfor\s*=/.test(result)) {
    result = result.replace(/\bfor\s*=(?=["'{])/g, "htmlFor=");
    fixes.push("Replaced for with htmlFor");
  }

  result = result.replace(/:\s*React\.(FC|FunctionComponent|ComponentType)/g, "");
  result = result.replace(/:\s*React\.ReactNode/g, "");
  result = result.replace(/:\s*JSX\.Element/g, "");

  if (/export\s+default\s+async\s+function/.test(result)) {
    result = result.replace(/export\s+default\s+async\s+function/, "export default function");
    fixes.push("Removed async from component function");
  }

  result = result.replace(/interface\s+\w+\s*\{[^}]*\}\s*/g, "");
  result = result.replace(/type\s+\w+\s*=\s*[^;]+;\s*/g, "");

  result = result.replace(/<(\w+)<[^>]+>>/g, "<$1>");

  result = result.replace(/:\s*React\.FC<[^>]*>/g, "");
  result = result.replace(/:\s*FC<[^>]*>/g, "");

  result = result.replace(/\((\w+):\s*\w+\)\s*=>/g, "($1) =>");
  result = result.replace(/\((\w+):\s*\{[^}]*\}\)\s*=>/g, "($1) =>");

  result = result.replace(/:\s*React\.\w+Event<\w+>/g, "");
  result = result.replace(/:\s*\w+Event/g, "");

  result = result.replace(/\s+as\s+const/g, "");


  result = result.replace(/;;+/g, ";");

  result = result.replace(/return\s*;\s*}/g, "return null; }");

  const hooksUsed: string[] = [];
  if (/\buseState\b/.test(result)) hooksUsed.push("useState");
  if (/\buseEffect\b/.test(result)) hooksUsed.push("useEffect");
  if (/\buseRef\b/.test(result)) hooksUsed.push("useRef");
  if (/\buseCallback\b/.test(result)) hooksUsed.push("useCallback");
  if (/\buseMemo\b/.test(result)) hooksUsed.push("useMemo");
  if (/\buseContext\b/.test(result)) hooksUsed.push("useContext");
  if (/\buseReducer\b/.test(result)) hooksUsed.push("useReducer");
  if (/\buseLayoutEffect\b/.test(result)) hooksUsed.push("useLayoutEffect");

  if (hooksUsed.length > 0) {
    const existingReactImport = result.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/);
    if (existingReactImport) {
      const currentImports = existingReactImport[1].split(",").map(s => s.trim());
      const newImports = [...new Set([...currentImports, ...hooksUsed])].join(", ");
      result = result.replace(existingReactImport[0], `import { ${newImports} } from "react"`);
    } else if (!/import\s+React/.test(result) && !/from\s*['"]react['"]/.test(result)) {
      result = `import { ${hooksUsed.join(", ")} } from "react";\n${result}`;
      fixes.push("Added React hooks import");
    }
  }

  result = result.replace(/dangerouslySetInnerHTML=\{([^}]+)\}/g, (match, content) => {
    if (!content.includes("__html")) {
      return `dangerouslySetInnerHTML={{ __html: ${content} }}`;
    }
    return match;
  });

  return result;
}

function cleanupWhitespace(code: string): string {
  return code
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/^\s+/, "")
    .replace(/\s*$/, "\n");
}

export function quickValidate(code: string): { hasErrors: boolean; message: string } {
  if (!code.trim()) {
    return { hasErrors: true, message: "Empty code" };
  }

  if (!/export\s+default/.test(code)) {
    return { hasErrors: true, message: "Missing default export" };
  }

  if (!/<[A-Za-z]/.test(code)) {
    return { hasErrors: true, message: "No JSX found" };
  }

  return { hasErrors: false, message: "OK" };
}
