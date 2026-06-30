"use client";

import {
  Sparkles,
  CreditCard,
  LogIn,
  BarChart3,
  User,
  LayoutGrid,
  Menu,
  PanelBottom,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import { PRESET_PROMPTS } from "@/lib/ai";

interface MainCanvasProps {
  onPresetClick?: (prompt: string) => void;
  children?: React.ReactNode;
}

const PRESET_ICONS: Record<string, LucideIcon> = {
  CreditCard,
  LogIn,
  Sparkles,
  BarChart3,
  User,
  LayoutGrid,
  Menu,
  PanelBottom,
};

export function MainCanvas({ onPresetClick, children }: MainCanvasProps) {
  if (children) {
    return <div className="flex-1 overflow-y-auto p-6">{children}</div>;
  }

  // Empty state with presets
  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Welcome Message */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">What would you like to build?</h2>
          <p className="text-neutral-400 text-lg">
            Describe your component and watch it come to life with AI-powered generation.
          </p>
        </div>

        {/* Preset Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12">
          {PRESET_PROMPTS.map((preset, index) => {
            const Icon = PRESET_ICONS[preset.icon] ?? CircleHelp;
            return (
              <button
                key={index}
                onClick={() => onPresetClick?.(preset.prompt)}
                className="group p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 hover:border-neutral-700 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 text-sm">{preset.title}</h3>
                    <p className="text-xs text-neutral-500 line-clamp-2">{preset.prompt}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tips */}
        <div className="mt-12 text-sm text-neutral-500">
          <p>💡 Tip: Be specific about colors, layout, and functionality for best results</p>
        </div>
      </div>
    </div>
  );
}
