"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { CollapsibleSidebar } from "@/components/dashboard/collapsible-sidebar";
import { MainCanvas } from "@/components/dashboard/main-canvas";
import { InputBar } from "@/components/dashboard/input-bar";
import { ChatPanel } from "@/components/dashboard/chat-panel";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { ModelSelector } from "@/components/dashboard/model-selector";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { useChatStore } from "@/hooks/use-chat-store";
import { getProviderOverrides } from "@/lib/client-settings";
import { Zap } from "lucide-react";
import type { AIProvider } from "@/lib/ai";

export default function DashboardPage() {
    const [currentProvider, setCurrentProvider] = useState<AIProvider>("groq");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamingCode, setStreamingCode] = useState<string>("");
    const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        currentProjectId,
        messages,
        codeVersions,
        currentVersionIndex,
        isLoading: isLoadingProject,
        loadProject,
        addUserMessage,
        addAssistantMessage,
        startNewChat,
        getLatestCode,
        setCurrentVersionIndex,
    } = useChatStore();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingCode]);

    // Generate component from prompt
    const generateComponent = useCallback(
        async (prompt: string, existingCode?: string) => {
            setIsGenerating(true);
            setStreamingCode("");

            try {
                const { keys, ollamaBaseURL } = getProviderOverrides();
                const response = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt,
                        currentCode: existingCode,
                        provider: currentProvider,
                        isIteration: !!existingCode,
                        keys,
                        ollamaBaseURL,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Generation failed: ${response.status}`);
                }

                // Stream the response
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let accumulatedCode = "";

                if (!reader) throw new Error("No response stream available");

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedCode += chunk;
                    setStreamingCode(accumulatedCode);
                }

                // Clean up the code
                let cleanedCode = accumulatedCode.trim();
                cleanedCode = cleanedCode
                    .replace(/^```(?:jsx|tsx|javascript|js|react)?\n?/i, "")
                    .replace(/\n?```$/i, "")
                    .trim();

                return cleanedCode;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Generation failed";
                toast.error(errorMessage);
                return null;
            } finally {
                setIsGenerating(false);
                setStreamingCode("");
            }
        },
        [currentProvider]
    );

    // Handle user submitting a prompt
    const handleSubmit = useCallback(
        async (input: string) => {
            // First, add user message (this also creates project if needed)
            const projectId = await addUserMessage(input);
            if (!projectId) {
                toast.error("Failed to save message");
                return;
            }

            // Refresh sidebar to show new project
            setSidebarRefreshKey((prev) => prev + 1);

            // Generate the component
            toast.loading("Generating component...", { id: "generating" });

            // Check if this is an iteration (we have existing code)
            const existingCode = getLatestCode();
            const code = await generateComponent(input, existingCode || undefined);

            toast.dismiss("generating");

            if (code) {
                // Save assistant message with the generated code
                await addAssistantMessage("Here's your component:", code);
                toast.success("Component generated!");
                setSidebarRefreshKey((prev) => prev + 1);
            }
        },
        [addUserMessage, addAssistantMessage, generateComponent, getLatestCode]
    );

    // Handle clicking a preset prompt
    const handlePresetClick = useCallback(
        (presetPrompt: string) => {
            handleSubmit(presetPrompt);
        },
        [handleSubmit]
    );

    // Handle regenerating the last component
    const handleRegenerate = useCallback(() => {
        // Find the last user message
        const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
        if (lastUserMessage) {
            handleSubmit(lastUserMessage.content);
        }
    }, [messages, handleSubmit]);

    // Handle starting a new chat
    const handleNewChat = useCallback(() => {
        startNewChat();
        setSidebarRefreshKey((prev) => prev + 1);
        toast.info("Started new chat");
    }, [startNewChat]);

    // Handle selecting a project from sidebar
    const handleProjectSelect = useCallback(
        async (projectId: string) => {
            const success = await loadProject(projectId);
            if (success) {
                toast.success("Chat loaded");
            } else {
                toast.error("Failed to load chat");
            }
        },
        [loadProject]
    );

    // Handle provider change
    const handleProviderChange = useCallback((provider: AIProvider) => {
        setCurrentProvider(provider);
        toast.success(
            `Switched to ${provider === "groq"
                ? "Groq"
                : provider === "google"
                    ? "Gemini"
                    : provider === "local"
                        ? "Local Ollama"
                        : provider
            }`
        );
    }, []);

    // Check if we have content to show in preview
    const hasContent = messages.length > 0 || isGenerating;

    return (
        <>
            <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#171717",
                        border: "1px solid #262626",
                        color: "#fafafa",
                    },
                }}
            />

            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <div className="h-screen flex overflow-hidden bg-neutral-950">
                {/* Collapsible Sidebar */}
                <CollapsibleSidebar
                    key={sidebarRefreshKey}
                    onNewChat={handleNewChat}
                    currentProvider={currentProvider}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                    currentProjectId={currentProjectId}
                    onProjectSelect={handleProjectSelect}
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Main Content Area - Split into Chat and Preview */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Panel (Left) */}
                    <div className="flex-[1] flex flex-col min-w-0 border-r border-neutral-800">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/30">
                            <div className="flex items-center gap-3">
                                <ModelSelector
                                    value={currentProvider}
                                    onChange={handleProviderChange}
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Status indicators */}
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                                {isGenerating && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                                        <span>Generating...</span>
                                    </div>
                                )}
                                {currentProvider && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800/50 rounded">
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                        <span>
                                            {currentProvider === "groq" ? "Groq" : currentProvider}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Content */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
                            {isLoadingProject ? (
                                // Loading state
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex items-center gap-3 text-neutral-400">
                                        <div className="w-5 h-5 border-2 border-t-violet-500 border-neutral-700 rounded-full animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                </div>
                            ) : messages.length === 0 && !isGenerating ? (
                                // Empty state - show presets
                                <MainCanvas onPresetClick={handlePresetClick}>{null}</MainCanvas>
                            ) : (
                                // Chat messages (text only, no inline previews)
                                <div className="p-4">
                                    <ChatPanel
                                        messages={messages}
                                        isGenerating={isGenerating}
                                        streamingCode={streamingCode}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Input Bar */}
                        <InputBar onSubmit={handleSubmit} isLoading={isGenerating} />
                    </div>

                    {/* Preview Panel (Right) - Always visible when there's content */}
                    {hasContent && (
                        <div className="flex-[2] min-w-[500px] max-w-[1100px] flex-shrink-0">
                            <PreviewPanel
                                versions={codeVersions}
                                currentVersionIndex={currentVersionIndex}
                                onVersionChange={setCurrentVersionIndex}
                                onRegenerate={handleRegenerate}
                                isGenerating={isGenerating}
                                streamingCode={streamingCode}
                                className="h-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
