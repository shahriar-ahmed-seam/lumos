"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Zap, Cloud, Bot, Server, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIProvider } from "@/lib/ai";

interface ModelSelectorProps {
  value: AIProvider;
  onChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

const PROVIDERS: {
  id: AIProvider;
  name: string;
  description: string;
  icon: typeof Zap;
  badge?: string;
  badgeColor?: string;
}[] = [
  {
    id: "groq",
    name: "Groq",
    description: "Llama 3.3 70B - Ultra fast inference",
    icon: Zap,
    badge: "FREE",
    badgeColor: "bg-green-500/20 text-green-400",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o - Best overall quality",
    icon: Cloud,
    badge: "PAID",
    badgeColor: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 3.5 Sonnet - Great for code",
    icon: Bot,
    badge: "PAID",
    badgeColor: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "google",
    name: "Gemini",
    description: "Gemini 2.5 Flash Lite - Fast & free",
    icon: Zap,
    badge: "FREE",
    badgeColor: "bg-green-500/20 text-green-400",
  },
  {
    id: "local",
    name: "Local (Ollama)",
    description: "Gemma 3 4B - Runs on your machine",
    icon: Server,
    badge: "FREE",
    badgeColor: "bg-green-500/20 text-green-400",
  },
];

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProvider = PROVIDERS.find((p) => p.id === value) || PROVIDERS[0];
  const Icon = selectedProvider.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border",
          "bg-neutral-900 border-neutral-700 hover:border-neutral-600",
          "text-sm transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Icon className="w-4 h-4 text-neutral-400" />
        <span className="font-medium">{selectedProvider.name}</span>
        {selectedProvider.badge && (
          <span className={cn("px-1.5 py-0.5 text-xs rounded", selectedProvider.badgeColor)}>
            {selectedProvider.badge}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-neutral-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-neutral-500 px-2 py-1 mb-1">Select AI Provider</p>
            {PROVIDERS.map((provider) => {
              const ProviderIcon = provider.icon;
              const isSelected = provider.id === value;

              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    onChange(provider.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    isSelected ? "bg-neutral-800" : "hover:bg-neutral-800/50"
                  )}
                >
                  <ProviderIcon className={cn("w-5 h-5 mt-0.5", isSelected ? "text-white" : "text-neutral-400")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium", isSelected && "text-white")}>{provider.name}</span>
                      {provider.badge && (
                        <span className={cn("px-1.5 py-0.5 text-xs rounded", provider.badgeColor)}>
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{provider.description}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-violet-500 mt-0.5" />}
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-neutral-800 p-3">
            <p className="text-xs text-neutral-500">
              💡 Groq is free with rate limits. Use Local Ollama for unlimited testing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
