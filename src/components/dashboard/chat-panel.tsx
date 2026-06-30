"use client";

import { forwardRef } from "react";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-chat-store";
import { useState } from "react";

interface ChatPanelProps {
  messages: ChatMessage[];
  isGenerating?: boolean;
  streamingCode?: string;
  className?: string;
}

export const ChatPanel = forwardRef<HTMLDivElement, ChatPanelProps>(
  function ChatPanel({ messages, isGenerating, streamingCode, className }, ref) {
    if (messages.length === 0 && !isGenerating) {
      return null;
    }

    return (
      <div ref={ref} className={cn("space-y-4 pb-4", className)}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming/Generating indicator */}
        {isGenerating && (
          <div className="flex gap-3">
            {/* Assistant avatar */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>

            {/* Streaming content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-medium text-sm text-neutral-200">Lumos</span>
                <div className="flex items-center gap-1.5 text-xs text-violet-400">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                  Generating...
                </div>
              </div>

              {streamingCode ? (
                <p className="text-sm text-neutral-400">
                  Building your component...
                </p>
              ) : (
                <div className="flex items-center gap-2 text-neutral-500">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-xs">Thinking...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopyCode = async () => {
    if (message.code) {
      await navigator.clipboard.writeText(message.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
          isUser
            ? "bg-neutral-700"
            : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-neutral-300" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-neutral-200">
            {isUser ? "You" : "Lumos"}
          </span>
          <span className="text-xs text-neutral-600">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {isUser ? (
          // User message - simple text
          <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        ) : (
          // Assistant message - text and optional code reference
          <div className="space-y-2">
            <p className="text-sm text-neutral-300 leading-relaxed">
              {message.content}
            </p>

            {/* If there's code, show a compact indicator */}
            {message.code && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-neutral-400">
                  Component generated
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-neutral-700 rounded transition-colors ml-1"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-500" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
