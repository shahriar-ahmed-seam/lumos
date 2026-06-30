"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  History,
  Sparkles,
  Settings,
  FileCode,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Key,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AIProvider } from "@/lib/ai";

interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  _count: {
    components: number;
    chats: number;
  };
}

interface CollapsibleSidebarProps {
  onNewChat?: () => void;
  currentProvider?: AIProvider;
  onSettingsClick?: () => void;
  currentProjectId?: string | null;
  onProjectSelect?: (projectId: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CollapsibleSidebar({
  onNewChat,
  currentProvider = "groq",
  onSettingsClick,
  currentProjectId,
  onProjectSelect,
  isCollapsed,
  onToggle,
}: CollapsibleSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const nonEmptyProjects = data.filter(
          (p: Project) => p._count.chats > 0 || p._count.components > 0
        );
        setProjects(nonEmptyProjects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
        if (currentProjectId === projectId && onNewChat) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const getProviderName = (provider: AIProvider) => {
    switch (provider) {
      case "groq":
        return "Groq";
      case "openai":
        return "OpenAI";
      case "anthropic":
        return "Anthropic";
      case "google":
        return "Gemini";
      case "local":
        return "Local";
      default:
        return provider;
    }
  };

  if (isCollapsed) {
    return (
      <motion.aside
        initial={{ width: 56 }}
        animate={{ width: 56 }}
        className="h-full bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-3 gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="w-5 h-5 text-neutral-400" />
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewChat}
          className="p-2 rounded-lg bg-white text-neutral-900 hover:bg-neutral-200 transition-colors"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </motion.button>

        <div className="flex-1" />

        <Link href="/api-keys">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            title="API Keys"
          >
            <Key className="w-5 h-5 text-neutral-400" />
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-neutral-400" />
        </motion.button>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: 256 }}
      className="h-full bg-neutral-900 border-r border-neutral-800 flex flex-col"
    >
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Lumos</span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-neutral-400" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
            "bg-white text-neutral-900 hover:bg-neutral-200",
            "transition-colors font-medium text-sm"
          )}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium uppercase tracking-wide">
            <History className="w-3 h-3" />
            History
          </div>
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-2 text-sm text-neutral-500"
            >
              Loading...
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="px-3 py-2 text-sm text-neutral-500 rounded-lg">
                No history yet
              </div>
              <p className="px-3 py-2 text-xs text-neutral-600">
                Your generated components will appear here
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onProjectSelect?.(project.id)}
                  className={cn(
                    "group relative px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-neutral-800/50",
                    currentProjectId === project.id && "bg-neutral-800"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <FileCode className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-300 truncate">{project.title}</p>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {project._count.chats > 0
                          ? `${Math.ceil(project._count.chats / 2)} message${
                              Math.ceil(project._count.chats / 2) !== 1 ? "s" : ""
                            }`
                          : `${project._count.components} component${
                              project._count.components !== 1 ? "s" : ""
                            }`}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => deleteProject(project.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800 space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-neutral-500 space-y-1"
        >
          <p className="font-medium text-neutral-400">AI Provider</p>
          <p className="flex items-center gap-1">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            {getProviderName(currentProvider)}
          </p>
        </motion.div>

        <Link href="/api-keys">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Key className="w-4 h-4" />
            API Keys
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSettingsClick}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </motion.button>
      </div>
    </motion.aside>
  );
}
