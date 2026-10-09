import React, { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, Sparkles, Send } from 'lucide-react';
import { ChatMessage } from '../../types';

interface AiMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  taskTitle: string;
  isLoading?: boolean;
}

export const AiMentorDrawer: React.FC<AiMentorDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  taskTitle,
  isLoading = false,
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickPrompts = [
    'Where is the template?',
    'Draft contract outline',
    'Explain clause 4',
    'Review SLA penalties',
  ];

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out bg-slate-900 border-t-2 border-indigo-500 rounded-t-3xl shadow-2xl flex flex-col h-[82%] ${
        isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      {/* Drawer Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between rounded-t-3xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              AI Mentor Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-mono font-normal text-indigo-400 px-1 py-0.2 rounded bg-indigo-950/60 border border-indigo-500/30">
                /api/ask-mentor
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
              Context: {taskTitle}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close drawer"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                isUser ? 'justify-end ml-auto max-w-[85%]' : 'max-w-[90%]'
              }`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-2.5 rounded-2xl ${
                  isUser
                    ? 'bg-indigo-600 rounded-tr-sm text-white'
                    : 'bg-slate-800 border border-slate-700/60 rounded-tl-sm text-slate-200'
                }`}
              >
                {msg.richContent?.type === 'steps' ? (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white">Step-by-Step Location Guide:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      {msg.richContent.steps?.map((step, idx) => (
                        <li key={idx} className="leading-snug">
                          {step}
                        </li>
                      ))}
                    </ol>
                    {msg.richContent.warning && (
                      <p className="text-[10px] text-slate-400 italic mt-1 border-t border-slate-700 pt-1">
                        • {msg.richContent.warning}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                )}
                <div
                  className={`text-[9px] mt-1 ${
                    isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-[90%] animate-pulse">
            <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800 border border-indigo-500/30 rounded-tl-sm text-slate-300">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-semibold text-indigo-300">AI Mentor</span>
                <span className="text-[10px] text-slate-400 font-mono">Fetching /api/ask-mentor...</span>
              </div>
              <div className="flex gap-1 mt-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-850 hover:bg-slate-800 text-[11px] text-indigo-300 border border-slate-700 transition cursor-pointer"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Mentor anything about this task..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shrink-0 shadow-md cursor-pointer"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
