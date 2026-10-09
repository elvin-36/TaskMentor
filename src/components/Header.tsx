import React from 'react';
import { Sparkles, Smartphone, LayoutDashboard, Bell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: 'mobile' | 'desktop';
  onSwitchView: (view: 'mobile' | 'desktop') => void;
  onTriggerNotification: () => void;
  activeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSwitchView,
  onTriggerNotification,
  activeCount = 14,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                TaskMentor<span className="text-indigo-400">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
                Copilot v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Driven Onboarding, Micro-Tasks &amp; Live Mentorship
            </p>
          </div>
        </div>

        {/* VIEW TOGGLE SWITCH */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSwitchView('mobile')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentView === 'mobile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Employee Mobile App</span>
            {currentView === 'mobile' && (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => onSwitchView('desktop')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentView === 'desktop'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Manager Dashboard</span>
            <span className="hidden sm:inline text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {activeCount} Active
            </span>
          </button>
        </div>

        {/* Live Demo Status & Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-indigo-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono text-[11px]">
              API: <b className="text-emerald-400 font-semibold">localhost:8000</b>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-mono text-[11px]">
              Auto-Lock: <b className="text-emerald-400 font-semibold">Active</b>
            </span>
          </div>

          <button
            onClick={onTriggerNotification}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition relative cursor-pointer"
            title="Simulate AI Mentor Event Ping"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
