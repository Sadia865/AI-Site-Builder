import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Send, Bot, User, RotateCcw, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';
import type { Project } from '../types';
import logo from '../assets/favicon.svg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  versionId?: string;
}

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project | null;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  onInitialGenerate: (prompt: string) => void;
}

const Sidebar = ({
  isMenuOpen,
  project,
  setProject,
  isGenerating,
  setIsGenerating,
  onInitialGenerate,
}: SidebarProps) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ✅ Browser: setInterval returns number, not NodeJS.Timer
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversation = useCallback(async () => {
    if (!project?.id) return;
    try {
      const { data } = await api.get(`/api/project/conversation/${project.id}`);
      const transformed: Message[] = data.conversation.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.timestamp || msg.createdAt || new Date().toISOString(),
        versionId: msg.versionId,
      }));
      setMessages(transformed);
      setLoadingMessages(false);

      const lastMsg = transformed[transformed.length - 1];
      if (
        lastMsg?.content.includes("I've Created your website") ||
        lastMsg?.content.includes("I've Made the changes")
      ) {
        setIsGenerating(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (err) {
      console.error('Failed fetching conversation:', err);
      if (messages.length === 0) toast.error('Failed to load conversation');
    }
  }, [project?.id, setIsGenerating, messages.length]);

  const fetchProject = useCallback(async () => {
    if (!project?.id) return;
    try {
      const { data } = await api.get(`/api/user/project/${project.id}`);
      setProject(data.project);
    } catch (err) {
      console.error('Failed fetching project:', err);
    }
  }, [project?.id, setProject]);

  useEffect(() => {
    if (project?.id) fetchConversation();
  }, [project?.id, fetchConversation]);

  // Polling for updates while generating
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (isGenerating && project?.id) {
      pollingRef.current = window.setInterval(() => {
        fetchConversation();
        fetchProject();
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isGenerating, project?.id, fetchConversation, fetchProject]);

  const sendMessage = async () => {
    if (!prompt.trim() || isGenerating) return;
    const currentPrompt = prompt;
    setPrompt('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentPrompt,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (!project?.current_code) {
      onInitialGenerate(currentPrompt);
      return;
    }

    try {
      setIsGenerating(true);
      await api.post(`/api/project/${project.id}/revision`, { message: currentPrompt });
      toast.success('Making changes to your website...');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      setIsGenerating(false);
    }
  };

  const handleRollBack = async (messageId: string) => {
    if (!project?.id) return;
    const msg = messages.find((m) => m.id === messageId);
    if (!msg?.versionId) return toast.error('Version not found');

    const confirmed = window.confirm('Are you sure you want to rollback to this version?');
    if (!confirmed) return;

    try {
      setIsGenerating(true);
      toast.info('Rolling back...');
      const { data } = await api.post(`/api/project/${project.id}/rollback/${msg.versionId}`);
      await fetchProject();
      await fetchConversation();
      toast.success(data.message || 'Rolled back successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to rollback');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEnhancedPromptMessage = (content: string) => content.includes("I've enhanced your prompt");
  const isStatusMessage = (content: string) =>
    ["now generating your website", "I've Created your website", "I've Made the changes"].some((s) =>
      content.includes(s)
    );

  return (
    <aside className={`fixed top-0 left-0 h-screen w-[360px] bg-[#0f1419] border-r border-slate-700
      ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform flex flex-col z-20`}>
      
      {/* Logo & Project Name */}
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
           onClick={() => navigate('/')}>
        <img src={logo} alt="Site Logo" className="w-8 h-8"/>
        <span className="font-semibold text-base text-white truncate">
          {project?.name || 'My Website Project'}
        </span>
      </div>

      <div className="border-b border-slate-800" />

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Bot className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">No messages yet</p>
            <p className="text-gray-500 text-xs mt-1">
              {project?.current_code ? 'Start chatting to make changes' : 'Describe your website to get started'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isEnhanced = isEnhancedPromptMessage(message.content);
            const isStatus = isStatusMessage(message.content);
            const canRollback = message.role === 'assistant' && message.versionId && !isStatus && index > 0;

            return (
              <div key={message.id} className="space-y-2">
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-indigo-600' : isEnhanced ? 'bg-purple-600' : 'bg-slate-700'}`}>
                    {message.role === 'user' ? <User className="w-4 h-4 text-white"/> : <Bot className="w-4 h-4 text-white"/>}
                  </div>

                  <div className="flex-1 max-w-[260px]">
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' ? 'bg-indigo-600 text-white' :
                        isEnhanced ? 'bg-purple-900/50 text-purple-200 border border-purple-700' :
                          isStatus ? 'bg-blue-900/30 text-blue-200 border border-blue-700' :
                            'bg-slate-800 text-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {canRollback && (
                        <>
                          <span className="text-gray-600">•</span>
                          <button onClick={() => handleRollBack(message.id)}
                                  disabled={isGenerating}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Rollback to this version">
                            <RotateCcw className="w-3 h-3"/> Rollback
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white animate-pulse"/>
            </div>
            <div className="flex-1 rounded-lg p-3 bg-slate-800 max-w-[260px]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500"/>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  Generating code
                  <span className="inline-flex gap-0.5">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">This may take 1-2 minutes...</div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="relative">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating ? "Generating website..." :
                !project?.current_code ? "Describe your website..." : "Describe changes..."
            }
            className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGenerating}
          />
          {isGenerating && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>}
        </div>
        <button onClick={sendMessage}
                disabled={!prompt.trim() || isGenerating}
                className="mt-2 w-full bg-indigo-600 py-2.5 rounded-lg flex justify-center items-center gap-2 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-gray-500">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin"/> Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4"/> Send
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
