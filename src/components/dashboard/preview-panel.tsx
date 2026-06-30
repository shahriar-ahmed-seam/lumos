"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  Eye,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  History,
  ChevronDown,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { validateAndSanitizeCode } from "@/lib/sandbox/code-validator";

export interface CodeVersion {
  id: string;
  code: string;
  timestamp: Date;
  prompt?: string;
}

interface PreviewPanelProps {
  versions: CodeVersion[];
  currentVersionIndex: number;
  onVersionChange: (index: number) => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  streamingCode?: string;
  className?: string;
}

/**
 * Sanitize and fix common issues in AI-generated code
 * Now uses the centralized code-validator
 */
function sanitizeCode(code: string): string {
  const result = validateAndSanitizeCode(code);
  
  // Log fixes for debugging
  if (result.fixes.length > 0) {
    console.log("[Sandbox] Applied fixes:", result.fixes);
  }
  if (result.warnings.length > 0) {
    console.log("[Sandbox] Warnings:", result.warnings);
  }
  
  return result.code;
}

// Inner component with Sandpack context
function PreviewContent({
  activeTab,
  onRegenerate,
}: {
  activeTab: "preview" | "code";
  onRegenerate?: () => void;
}) {
  const { sandpack } = useSandpack();
  const { error } = sandpack;

  if (error && activeTab === "preview") {
    return (
      <div className="h-full min-h-[400px] bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-950/20 border border-red-900/50 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-red-400 mb-2">Compilation Error</h3>
              <p className="text-sm text-red-300/90 mb-3 whitespace-pre-wrap font-mono text-xs max-h-24 overflow-y-auto">
                {error.message}
              </p>
              <div className="flex items-center gap-2">
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("w-full h-full", activeTab === "preview" ? "block" : "hidden")}>
        <SandpackPreview
          showOpenInCodeSandbox={false}
          showRefreshButton={true}
          style={{ height: "100%" }}
        />
      </div>
      <div className={cn("w-full h-full", activeTab === "code" ? "block" : "hidden")}>
        <SandpackCodeEditor
          showLineNumbers
          showInlineErrors
          wrapContent
          style={{ height: "100%" }}
        />
      </div>
    </>
  );
}

export function PreviewPanel({
  versions,
  currentVersionIndex,
  onVersionChange,
  onRegenerate,
  isGenerating,
  streamingCode,
  className,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentVersion = versions[currentVersionIndex];
  const hasCode = currentVersion?.code || streamingCode;

  const handleCopy = async () => {
    const codeToCopy = currentVersion?.code || "";
    await navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = currentVersion?.code;
    if (!code) {
      toast.error("Nothing to download yet");
      return;
    }
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Component.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Component.tsx");
  };

  const sandpackCode = useMemo(() => {
    const code = currentVersion?.code || "";
    if (!code) {
      return `export default function Component() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px] text-neutral-500">
      <p>Generate a component to see the preview</p>
    </div>
  );
}`;
    }

    let processedCode = sanitizeCode(code);

    if (!processedCode.includes("export default")) {
      processedCode = `export default function Component() {
  return (
    <div className="p-8">
      <p>Component needs export default</p>
    </div>
  );
}`;
    }

    return processedCode;
  }, [currentVersion?.code]);

  // Empty state
  if (!hasCode && !isGenerating) {
    return (
      <div
        className={cn(
          "flex flex-col h-full bg-neutral-900 border-l border-neutral-800",
          className
        )}
      >
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-neutral-800/50 flex items-center justify-center">
              <Code2 className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="font-medium text-neutral-400 mb-2">No Preview Yet</h3>
            <p className="text-sm text-neutral-600">
              Describe what you want to build and the preview will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming state
  if (isGenerating && streamingCode) {
    return (
      <div
        className={cn(
          "flex flex-col h-full bg-neutral-900 border-l border-neutral-800",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-neutral-300">Generating...</span>
          </div>
        </div>

        {/* Streaming Code */}
        <div className="flex-1 overflow-hidden">
          <pre className="p-4 text-xs font-mono text-neutral-400 overflow-auto h-full">
            <code>{streamingCode}</code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-neutral-900 border-l border-neutral-800",
        isExpanded && "fixed inset-0 z-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/50">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-800/50 rounded-lg">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
              activeTab === "preview"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-neutral-300"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
              activeTab === "code"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-neutral-300"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Download component */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors"
            title="Download as .tsx"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </motion.button>

          {/* Version selector */}
          {versions.length > 1 && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>v{versions.length - currentVersionIndex}</span>
                <ChevronDown className="w-3 h-3" />
              </motion.button>

              <AnimatePresence>
                {showVersionDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowVersionDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 z-20 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="p-2 border-b border-neutral-700">
                        <p className="text-xs text-neutral-400 font-medium">Version History</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {versions.map((version, idx) => (
                          <motion.button
                            key={version.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              onVersionChange(idx);
                              setShowVersionDropdown(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-700/50 transition-colors",
                              currentVersionIndex === idx && "bg-neutral-700/50"
                            )}
                          >
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                currentVersionIndex === idx ? "bg-violet-500" : "bg-neutral-600"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-200">
                                Version {versions.length - idx}
                              </p>
                              <p className="text-xs text-neutral-500 truncate">
                                {version.prompt || "Generated component"}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Copy */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-neutral-800 transition-colors"
            title="Copy code"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4 text-neutral-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Expand/Collapse */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-neutral-800 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-neutral-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-neutral-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          template="react"
          theme="dark"
          files={{
            "/App.js": {
              code: sandpackCode,
            },
          }}
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
              "recharts": "latest",
              "date-fns": "latest",
              "framer-motion": "latest",
              "react-icons": "latest",
              "clsx": "latest",
              "classnames": "latest",
              "@radix-ui/react-dialog": "latest",
              "@radix-ui/react-dropdown-menu": "latest",
              "@radix-ui/react-tabs": "latest",
              "@radix-ui/react-select": "latest",
              "@radix-ui/react-slider": "latest",
              "react-hook-form": "latest",
              "zod": "latest",
              "axios": "latest",
              "react-spring": "latest",
              "zustand": "latest",
              "react-router-dom": "latest",
            },
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            classes: {
              "sp-wrapper": "!bg-neutral-950 !h-full",
              "sp-layout": "!bg-neutral-950 !border-0 !h-full",
            },
          }}
        >
          <SandpackLayout className="!bg-neutral-950 !border-0 !rounded-none !h-full">
            <PreviewContent activeTab={activeTab} onRegenerate={onRegenerate} />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}
