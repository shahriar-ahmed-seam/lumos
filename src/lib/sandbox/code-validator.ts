/**
 * Code Validator & Sanitizer
 * 
 * This module validates and sanitizes AI-generated React code before
 * it's rendered in Sandpack. It ensures:
 * 1. Only valid imports are used
 * 2. Icon names are valid Lucide icons
 * 3. Common syntax errors are fixed
 * 4. Dangerous patterns are removed
 */

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

/**
 * Main validation and sanitization function
 */
export function validateAndSanitizeCode(rawCode: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: string[] = [];
  
  let code = rawCode;

  // Step 1: Remove dangerous patterns
  code = removeDangerousPatterns(code, fixes);

  // Step 2: Remove 'use client' directive (not needed in Sandpack)
  code = removeUseClient(code, fixes);

  // Step 3: Remove CSS imports (we use Tailwind CDN)
  code = removeCssImports(code, fixes);

  // Step 4: Fix and validate icon imports
  const iconResult = fixIconImports(code);
  code = iconResult.code;
  warnings.push(...iconResult.warnings);
  fixes.push(...iconResult.fixes);

  // Step 5: Remove invalid package imports
  const importResult = filterImports(code);
  code = importResult.code;
  warnings.push(...importResult.warnings);
  fixes.push(...importResult.fixes);

  // Step 6: Merge duplicate imports
  code = mergeDuplicateImports(code);

  // Step 7: Ensure default export exists
  const exportResult = ensureDefaultExport(code);
  code = exportResult.code;
  if (exportResult.fixed) {
    fixes.push("Added default export");
  }

  // Step 8: Fix common syntax issues
  code = fixCommonSyntaxIssues(code, fixes);

  // Step 9: Clean up whitespace
  code = cleanupWhitespace(code);

  return {
    isValid: errors.length === 0,
    code,
    errors,
    warnings,
    fixes,
  };
}

/**
 * Remove dangerous patterns that could cause security issues
 * NOTE: localStorage/sessionStorage are ALLOWED in Sandpack (it's sandboxed)
 */
function removeDangerousPatterns(code: string, fixes: string[]): string {
  let result = code;

  // Remove eval and Function constructor - these are truly dangerous
  if (/\beval\s*\(/.test(result)) {
    result = result.replace(/\beval\s*\([^)]*\)/g, "(() => {})()");
    fixes.push("Removed eval() calls");
  }

  // Remove new Function() constructor
  if (/new\s+Function\s*\(/.test(result)) {
    result = result.replace(/new\s+Function\s*\([^)]*\)/g, "(() => {})");
    fixes.push("Removed Function constructor");
  }

  // Remove document.write (can break the page)
  if (/document\.write\s*\(/.test(result)) {
    result = result.replace(/document\.write\s*\([^)]*\)/g, "console.log");
    fixes.push("Replaced document.write with console.log");
  }

  // Remove document.cookie access (not needed in preview)
  if (/document\.cookie/.test(result)) {
    result = result.replace(/document\.cookie/g, '""');
    fixes.push("Removed document.cookie access");
  }

  // NOTE: localStorage and sessionStorage are ALLOWED
  // Sandpack runs in an iframe with its own storage context
  // This is safe and often needed for dark mode, etc.

  return result;
}

/**
 * Remove 'use client' directive
 */
function removeUseClient(code: string, fixes: string[]): string {
  if (/['"]use client['"];?\s*\n?/.test(code)) {
    fixes.push("Removed 'use client' directive");
    return code.replace(/['"]use client['"];?\s*\n?/g, "");
  }
  return code;
}

/**
 * Remove CSS imports
 */
function removeCssImports(code: string, fixes: string[]): string {
  const cssImportPattern = /import\s+['"][^'"]*\.css['"];?\s*\n?/g;
  if (cssImportPattern.test(code)) {
    fixes.push("Removed CSS imports (using Tailwind CDN)");
    return code.replace(cssImportPattern, "");
  }
  return code;
}

/**
 * Fix icon imports - validate and replace invalid icons
 */
function fixIconImports(code: string): { code: string; warnings: string[]; fixes: string[] } {
  const warnings: string[] = [];
  const fixes: string[] = [];
  let result = code;

  // Find all icons being used in JSX
  const usedIcons = new Set<string>();
  const iconUsagePattern = /<([A-Z][a-zA-Z0-9]*)\s/g;
  let match;

  while ((match = iconUsagePattern.exec(code)) !== null) {
    const componentName = match[1];
    // Check if it looks like an icon (PascalCase, common icon names)
    if (LUCIDE_ICONS.includes(componentName as any)) {
      usedIcons.add(componentName);
    }
  }

  // Find icons in import statements
  const lucideImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  while ((match = lucideImportPattern.exec(code)) !== null) {
    const importedIcons = match[1].split(",").map(s => s.trim()).filter(Boolean);
    
    importedIcons.forEach(icon => {
      // Handle 'as' aliases
      const actualIcon = icon.split(/\s+as\s+/)[0].trim();
      
      if (!isValidIcon(actualIcon)) {
        const suggestion = getValidIconSuggestion(actualIcon);
        warnings.push(`Invalid icon "${actualIcon}" replaced with "${suggestion}"`);
        
        // Replace in code
        const iconPattern = new RegExp(`\\b${actualIcon}\\b`, "g");
        result = result.replace(iconPattern, suggestion);
        fixes.push(`Replaced invalid icon "${actualIcon}" with "${suggestion}"`);
        usedIcons.add(suggestion);
      } else {
        usedIcons.add(actualIcon);
      }
    });
  }

  // Remove IconName pattern (common AI hallucination)
  if (/<IconName/.test(result)) {
    result = result.replace(/<IconName\s+as=\{(\w+)\}([^/>]*)\/?>/g, "<$1$2/>");
    result = result.replace(/<IconName[^>]*\/>/g, '<CircleHelp className="w-4 h-4" />');
    result = result.replace(/<IconName[^>]*>[^<]*<\/IconName>/g, '<CircleHelp className="w-4 h-4" />');
    fixes.push("Fixed IconName pattern");
    usedIcons.add("CircleHelp");
  }

  // Remove existing lucide imports
  result = result.replace(/import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"];?\s*\n?/g, "");

  // Add consolidated lucide import at the top (after any remaining imports or at start)
  if (usedIcons.size > 0) {
    const sortedIcons = Array.from(usedIcons).sort();
    const lucideImport = `import { ${sortedIcons.join(", ")} } from "lucide-react";\n`;
    
    // Find the best place to insert
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

/**
 * Filter imports to only allowed packages
 */
function filterImports(code: string): { code: string; warnings: string[]; fixes: string[] } {
  const warnings: string[] = [];
  const fixes: string[] = [];
  let result = code;

  const allowedPackages = Object.keys(SANDPACK_DEPENDENCIES);

  // Pattern to match import statements
  const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importPattern.exec(code)) !== null) {
    const fullImport = match[0];
    const packagePath = match[1];
    
    // Skip relative imports
    if (packagePath.startsWith(".") || packagePath.startsWith("/")) {
      continue;
    }

    // Extract base package name
    const basePackage = packagePath.startsWith("@")
      ? packagePath.split("/").slice(0, 2).join("/")
      : packagePath.split("/")[0];

    // Check if package is allowed
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

/**
 * Merge duplicate imports from the same module
 */
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
        // Default or namespace import - keep as unique
        const key = `__DEFAULT__${line}`;
        importMap.set(key, new Set([line]));
      }
    } else {
      otherLines.push(line);
    }
  });

  // Reconstruct imports
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

/**
 * Ensure the code has a default export
 */
function ensureDefaultExport(code: string): { code: string; fixed: boolean } {
  // Check for existing default export
  if (/export\s+default\s+/.test(code)) {
    return { code, fixed: false };
  }

  // Look for a component definition to export
  const componentMatch = code.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:=|\()/);
  
  if (componentMatch) {
    const componentName = componentMatch[1];
    
    // Check if it's already exported as named export
    if (new RegExp(`export\\s+(?:function|const)\\s+${componentName}`).test(code)) {
      // Add default export at the end
      return {
        code: code + `\n\nexport default ${componentName};`,
        fixed: true,
      };
    }
    
    // Add export default to existing component
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

  // Fallback: wrap in a component
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

/**
 * Fix common syntax issues
 * This function handles many common AI code generation mistakes
 */
function fixCommonSyntaxIssues(code: string, fixes: string[]): string {
  let result = code;

  // Fix self-closing tags that should be self-closing
  const voidElements = ["img", "br", "hr", "input", "meta", "link"];
  voidElements.forEach(el => {
    const pattern = new RegExp(`<${el}([^>]*[^/])>`, "gi");
    if (pattern.test(result)) {
      result = result.replace(pattern, `<${el}$1 />`);
    }
  });

  // Fix className vs class
  if (/\bclass\s*=/.test(result) && !/\bclassName\s*=/.test(result)) {
    result = result.replace(/\bclass\s*=/g, "className=");
    fixes.push("Replaced class with className");
  }

  // Fix for vs htmlFor
  if (/\bfor\s*=/.test(result)) {
    result = result.replace(/\bfor\s*=(?=["'{])/g, "htmlFor=");
    fixes.push("Replaced for with htmlFor");
  }

  // Remove typescript type annotations from JSX (common AI mistake)
  result = result.replace(/:\s*React\.(FC|FunctionComponent|ComponentType)/g, "");
  result = result.replace(/:\s*React\.ReactNode/g, "");
  result = result.replace(/:\s*JSX\.Element/g, "");

  // Fix async component functions (React doesn't support async components in client)
  if (/export\s+default\s+async\s+function/.test(result)) {
    result = result.replace(/export\s+default\s+async\s+function/, "export default function");
    fixes.push("Removed async from component function");
  }

  // Remove TypeScript interfaces/types that might be inline
  result = result.replace(/interface\s+\w+\s*\{[^}]*\}\s*/g, "");
  result = result.replace(/type\s+\w+\s*=\s*[^;]+;\s*/g, "");

  // Fix TypeScript generic annotations in JSX
  result = result.replace(/<(\w+)<[^>]+>>/g, "<$1>");

  // Remove React.FC<Props> type annotations
  result = result.replace(/:\s*React\.FC<[^>]*>/g, "");
  result = result.replace(/:\s*FC<[^>]*>/g, "");

  // Fix inline type annotations on function parameters
  result = result.replace(/\((\w+):\s*\w+\)\s*=>/g, "($1) =>");
  result = result.replace(/\((\w+):\s*\{[^}]*\}\)\s*=>/g, "($1) =>");

  // Fix common event handler type issues
  result = result.replace(/:\s*React\.\w+Event<\w+>/g, "");
  result = result.replace(/:\s*\w+Event/g, "");

  // Remove 'as const' assertions
  result = result.replace(/\s+as\s+const/g, "");

  // Fix undefined/null checks that use optional chaining incorrectly
  // This is valid, but let's ensure we're not breaking it

  // Fix double semicolons
  result = result.replace(/;;+/g, ";");

  // Fix empty statements after returns
  result = result.replace(/return\s*;\s*}/g, "return null; }");

  // Ensure useState/useEffect are imported if used
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
      // No React import at all, add hooks import at the top
      result = `import { ${hooksUsed.join(", ")} } from "react";\n${result}`;
      fixes.push("Added React hooks import");
    }
  }

  // Fix dangerouslySetInnerHTML syntax
  result = result.replace(/dangerouslySetInnerHTML=\{([^}]+)\}/g, (match, content) => {
    if (!content.includes("__html")) {
      return `dangerouslySetInnerHTML={{ __html: ${content} }}`;
    }
    return match;
  });

  return result;
}

/**
 * Clean up whitespace
 */
function cleanupWhitespace(code: string): string {
  return code
    // Remove multiple blank lines
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    // Remove leading whitespace
    .replace(/^\s+/, "")
    // Ensure single newline at end
    .replace(/\s*$/, "\n");
}

/**
 * Quick validation for real-time feedback
 */
export function quickValidate(code: string): { hasErrors: boolean; message: string } {
  // Check for basic syntax
  if (!code.trim()) {
    return { hasErrors: true, message: "Empty code" };
  }

  // Check for default export
  if (!/export\s+default/.test(code)) {
    return { hasErrors: true, message: "Missing default export" };
  }

  // Check for JSX
  if (!/<[A-Za-z]/.test(code)) {
    return { hasErrors: true, message: "No JSX found" };
  }

  return { hasErrors: false, message: "OK" };
}
