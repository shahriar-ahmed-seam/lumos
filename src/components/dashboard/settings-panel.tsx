"use client";

import { useEffect, useState } from "react";
import { Settings, X, Eye, EyeOff, Save, Check, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import {
  loadSettings,
  saveSettings,
  PROVIDER_META,
  DEFAULT_SETTINGS,
  type KeyProvider,
  type LumosSettings,
} from "@/lib/client-settings";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key";

const KEY_PROVIDERS: KeyProvider[] = ["groq", "openai", "anthropic", "google"];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState<LumosSettings>(DEFAULT_SETTINGS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Load persisted settings whenever the panel opens.
  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
      setSaved(false);
    }
  }, [isOpen]);

  const toggleShowKey = (provider: string) =>
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));

  const updateKey = (provider: KeyProvider, value: string) =>
    setSettings((prev) => ({ ...prev, keys: { ...prev.keys, [provider]: value } }));

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-400" />
            <h2 className="font-semibold">Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* API Keys */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-1">API Keys</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Stored only in this browser and sent with your generation requests. Leave blank to use
              the server&apos;s configured keys.
            </p>

            <div className="space-y-3">
              {KEY_PROVIDERS.map((provider) => {
                const meta = PROVIDER_META[provider];
                return (
                  <div key={provider} className="space-y-1.5">
                    <label className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">{meta.label}</span>
                      <a
                        href={meta.getKeyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-400"
                      >
                        Get key <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys[provider] ? "text" : "password"}
                        value={settings.keys[provider] ?? ""}
                        onChange={(e) => updateKey(provider, e.target.value)}
                        placeholder={meta.placeholder}
                        className={cn(
                          "w-full px-3 py-2 pr-10 rounded-lg bg-neutral-800 border border-neutral-700",
                          "text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(provider)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-400"
                      >
                        {showKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Ollama */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-3">Local Ollama</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-400">Ollama Base URL</label>
                <input
                  type="text"
                  value={settings.ollamaBaseURL}
                  onChange={(e) => setSettings((p) => ({ ...p, ollamaBaseURL: e.target.value }))}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>
              <div className="p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">
                <p className="font-medium text-neutral-400 mb-1">Quick Setup:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Install Ollama from <span className="text-blue-400">ollama.com</span></li>
                  <li>Run: <code className="px-1 py-0.5 bg-neutral-800 rounded">ollama pull gemma3:4b</code></li>
                  <li>Select &quot;Local (Ollama)&quot; in the model dropdown</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-3">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm">Auto-fallback on rate limit</p>
                  <p className="text-xs text-neutral-500">Switch to backup provider automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoFallback}
                  onChange={(e) => setSettings((p) => ({ ...p, autoFallback: e.target.checked }))}
                  className="w-4 h-4 rounded bg-neutral-700 border-neutral-600 text-violet-500 focus:ring-violet-500 focus:ring-offset-neutral-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm">Use smaller model for iterations</p>
                  <p className="text-xs text-neutral-500">Saves tokens when making edits</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smallModelForIterations}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, smallModelForIterations: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-neutral-700 border-neutral-600 text-violet-500 focus:ring-violet-500 focus:ring-offset-neutral-900"
                />
              </label>
            </div>
          </div>

          {/* Account (only when Clerk is configured) */}
          {isClerkConfigured && (
            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-3">Account</h3>
              <SignOutButton />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-800 bg-neutral-900/50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              saved ? "bg-green-600 text-white" : "bg-white text-neutral-900 hover:bg-neutral-200"
            )}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Isolated so the Clerk hook only runs when Clerk is actually configured.
function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className="flex items-center gap-2 w-full p-3 text-left text-red-400 hover:text-red-300 bg-neutral-800/50 hover:bg-red-500/10 rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <div>
        <p className="text-sm font-medium">Sign Out</p>
        <p className="text-xs text-neutral-500">Sign out of your account</p>
      </div>
    </button>
  );
}

// Settings button for sidebar
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
    >
      <Settings className="w-4 h-4" />
      Settings
    </button>
  );
}
