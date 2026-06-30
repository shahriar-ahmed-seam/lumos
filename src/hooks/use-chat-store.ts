"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: string; // For assistant messages that include generated code
  createdAt: Date;
}

export interface CodeVersion {
  id: string;
  code: string;
  timestamp: Date;
  prompt?: string;
}

export interface ChatProject {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

interface ChatStoreState {
  currentProjectId: string | null;
  messages: ChatMessage[];
  codeVersions: CodeVersion[];
  currentVersionIndex: number;
  isLoading: boolean;
}

const STORAGE_KEY = "loomos_current_project";

export function useChatStore() {
  const [state, setState] = useState<ChatStoreState>({
    currentProjectId: null,
    messages: [],
    codeVersions: [],
    currentVersionIndex: 0,
    isLoading: true,
  });

  // Use ref to track current projectId for async operations
  const currentProjectIdRef = useRef<string | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentProjectIdRef.current = state.currentProjectId;
  }, [state.currentProjectId]);

  // Initialize: Load saved project on mount
  useEffect(() => {
    const initializeStore = async () => {
      const savedProjectId = localStorage.getItem(STORAGE_KEY);
      
      if (savedProjectId) {
        await loadProject(savedProjectId);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeStore();
  }, []);

  // Load a project and its messages
  const loadProject = useCallback(async (projectId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await fetch(`/api/projects/${projectId}`);
      
      if (!res.ok) {
        // Project doesn't exist, clear storage
        localStorage.removeItem(STORAGE_KEY);
        currentProjectIdRef.current = null;
        setState({ currentProjectId: null, messages: [], codeVersions: [], currentVersionIndex: 0, isLoading: false });
        return false;
      }

      const project = await res.json();
      
      // Convert chats from DB format to our message format
      const messages: ChatMessage[] = project.chats.map((chat: any) => ({
        id: chat.id,
        role: chat.role as "user" | "assistant",
        content: chat.content,
        code: chat.code || undefined,
        createdAt: new Date(chat.createdAt),
      }));

      // Extract code versions from messages
      const codeVersions: CodeVersion[] = messages
        .filter((m) => m.role === "assistant" && m.code)
        .map((m, idx) => ({
          id: m.id,
          code: m.code!,
          timestamp: m.createdAt,
          prompt: messages[messages.indexOf(m) - 1]?.content || undefined,
        }));

      localStorage.setItem(STORAGE_KEY, projectId);
      currentProjectIdRef.current = projectId;
      setState({
        currentProjectId: projectId,
        messages,
        codeVersions,
        currentVersionIndex: 0, // Most recent version
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      console.error("Failed to load project:", error);
      localStorage.removeItem(STORAGE_KEY);
      currentProjectIdRef.current = null;
      setState({ currentProjectId: null, messages: [], codeVersions: [], currentVersionIndex: 0, isLoading: false });
      return false;
    }
  }, []);

  // Create a new project (only called when starting a new chat)
  const createProject = useCallback(async (title?: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "New Chat",
          description: "",
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const project = await res.json();
      
      localStorage.setItem(STORAGE_KEY, project.id);
      currentProjectIdRef.current = project.id;
      setState({
        currentProjectId: project.id,
        messages: [],
        codeVersions: [],
        currentVersionIndex: 0,
        isLoading: false,
      });

      return project.id;
    } catch (error) {
      console.error("Failed to create project:", error);
      return null;
    }
  }, []);

  // Add a user message to the current chat
  const addUserMessage = useCallback(async (content: string): Promise<string | null> => {
    let projectId = currentProjectIdRef.current;

    // If no project exists, create one with the first message as title
    if (!projectId) {
      const title = content.length > 50 ? content.slice(0, 47) + "..." : content;
      projectId = await createProject(title);
      if (!projectId) return null;
      // Update the ref immediately so addAssistantMessage can use it
      currentProjectIdRef.current = projectId;
    }

    // Save to database
    try {
      const res = await fetch(`/api/projects/${projectId}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to save message");

      const savedMessage = await res.json();
      
      const newMessage: ChatMessage = {
        id: savedMessage.id,
        role: "user",
        content,
        createdAt: new Date(savedMessage.createdAt),
      };

      setState(prev => ({
        ...prev,
        currentProjectId: projectId,
        messages: [...prev.messages, newMessage],
      }));

      // Update project title if this is the first message
      const title = content.length > 50 ? content.slice(0, 47) + "..." : content;
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      return projectId;
    } catch (error) {
      console.error("Failed to add user message:", error);
      return null;
    }
  }, [state.currentProjectId, state.messages.length, createProject]);

  // Add an assistant message (with generated code)
  const addAssistantMessage = useCallback(async (content: string, code?: string): Promise<boolean> => {
    const projectId = currentProjectIdRef.current;
    if (!projectId) {
      console.error("No project ID available for assistant message");
      return false;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content,
          code,
        }),
      });

      if (!res.ok) throw new Error("Failed to save message");

      const savedMessage = await res.json();
      
      const newMessage: ChatMessage = {
        id: savedMessage.id,
        role: "assistant",
        content,
        code,
        createdAt: new Date(savedMessage.createdAt),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        codeVersions: code
          ? [
              {
                id: savedMessage.id,
                code,
                timestamp: new Date(savedMessage.createdAt),
                prompt: prev.messages[prev.messages.length - 1]?.content,
              },
              ...prev.codeVersions,
            ]
          : prev.codeVersions,
        currentVersionIndex: 0,
      }));

      // Also save the component to the components table for history
      if (code) {
        await fetch(`/api/projects/${projectId}/components`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            prompt: content,
            provider: "groq",
            version: 1,
          }),
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to add assistant message:", error);
      return false;
    }
  }, []);

  // Start a new chat (clears current state, will create project on first message)
  const startNewChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    currentProjectIdRef.current = null;
    setState({
      currentProjectId: null,
      messages: [],
      codeVersions: [],
      currentVersionIndex: 0,
      isLoading: false,
    });
  }, []);

  // Set the current version index (for restore points)
  const setCurrentVersionIndex = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentVersionIndex: Math.max(0, Math.min(index, prev.codeVersions.length - 1)),
    }));
  }, []);

  // Get the latest code from the conversation
  const getLatestCode = useCallback((): string | null => {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      if (state.messages[i].code) {
        return state.messages[i].code!;
      }
    }
    return null;
  }, [state.messages]);

  return {
    currentProjectId: state.currentProjectId,
    messages: state.messages,
    codeVersions: state.codeVersions,
    currentVersionIndex: state.currentVersionIndex,
    isLoading: state.isLoading,
    loadProject,
    createProject,
    addUserMessage,
    addAssistantMessage,
    startNewChat,
    getLatestCode,
    setCurrentVersionIndex,
  };
}
