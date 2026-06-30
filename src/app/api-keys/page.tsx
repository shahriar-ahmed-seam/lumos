"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Eye, EyeOff, Save, Check, ExternalLink, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  loadSettings,
  saveSettings,
  PROVIDER_META,
  DEFAULT_SETTINGS,
  type KeyProvider,
  type LumosSettings,
} from "@/lib/client-settings";

const KEY_PROVIDERS: KeyProvider[] = ["groq", "openai", "anthropic", "google"];

export default function ApiKeysPage() {
  const [settings, setSettings] = useState<LumosSettings>(DEFAULT_SETTINGS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedProvider, setSavedProvider] = useState<string | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const persist = (next: LumosSettings, provider: KeyProvider, message: string) => {
    setSettings(next);
    saveSettings(next);
    setSavedProvider(provider);
    setTimeout(() => setSavedProvider(null), 1500);
    toast.success(message);
  };

  const handleSave = (provider: KeyProvider) => {
    const value = settings.keys[provider]?.trim();
    if (!value) {
      toast.error("Enter a key first");
      return;
    }
    persist(settings, provider, `${PROVIDER_META[provider].label} key saved`);
  };

  const handleClear = (provider: KeyProvider) => {
    const next = { ...settings, keys: { ...settings.keys } };
    delete next.keys[provider];
    persist(next, provider, `${PROVIDER_META[provider].label} key removed`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="max-w-3xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </Link>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-neutral-400">
            Bring your own keys for higher limits and premium models.
          </p>
        </motion.div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
          <p className="text-sm text-neutral-400">
            Keys are stored only in <span className="text-neutral-200">this browser</span> and sent
            with your generation requests over the same origin. They are never saved on our servers
            and are only forwarded to the AI provider you choose. Leave a field empty to fall back to
            the server&apos;s configured key.
          </p>
        </div>

        <div className="space-y-3">
          {KEY_PROVIDERS.map((provider, index) => {
            const meta = PROVIDER_META[provider];
            const value = settings.keys[provider] ?? "";
            const hasKey = !!value.trim();
            return (
              <motion.div
                key={provider}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-neutral-800">
                      <Key className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{meta.label}</h3>
                      <span
                        className={cn(
                          "text-xs",
                          hasKey ? "text-green-400" : "text-neutral-500"
                        )}
                      >
                        {hasKey ? "Configured" : "Not set"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={meta.getKeyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    Get key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[provider] ? "text" : "password"}
                      value={value}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, keys: { ...p.keys, [provider]: e.target.value } }))
                      }
                      placeholder={meta.placeholder}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 pr-10 font-mono text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys((p) => ({ ...p, [provider]: !p[provider] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave(provider)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      savedProvider === provider
                        ? "bg-green-600 text-white"
                        : "bg-white text-neutral-900 hover:bg-neutral-200"
                    )}
                  >
                    {savedProvider === provider ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {savedProvider === provider ? "Saved" : "Save"}
                  </button>
                  {hasKey && (
                    <button
                      onClick={() => handleClear(provider)}
                      className="grid place-items-center rounded-lg border border-neutral-700 px-3 text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Remove key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Local Ollama needs no key — configure its URL in Settings.
        </p>
      </div>
    </div>
  );
}
