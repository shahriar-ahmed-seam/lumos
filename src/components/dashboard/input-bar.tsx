"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputBarProps {
  onSubmit?: (prompt: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function InputBar({ 
  onSubmit, 
  isLoading = false,
  placeholder = "Describe the component you want to create..."
}: InputBarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit?.(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent pt-8 pb-6 px-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={cn(
          "relative flex items-end gap-2 p-3 rounded-2xl",
          "bg-neutral-900 border border-neutral-800",
          "focus-within:border-neutral-700 transition-colors",
          "shadow-lg shadow-black/20"
        )}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "flex-1 bg-transparent resize-none outline-none",
              "text-sm placeholder:text-neutral-500",
              "max-h-32 min-h-[24px]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{
              height: "auto",
              minHeight: "24px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex-shrink-0 p-2 rounded-lg transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              input.trim() && !isLoading
                ? "bg-white text-neutral-900 hover:bg-neutral-200"
                : "bg-neutral-800 text-neutral-500"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <p className="text-xs text-neutral-600 text-center mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400 ml-1">Shift+Enter</kbd> for new line
        </p>
      </form>
    </div>
  );
}
