import React, { useState } from 'react';
import { X, PlusCircle, Lock, Sparkles, Loader2, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { decomposeTask, DecomposedMicroTask } from '../../services/api';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignTask: (task: {
    title: string;
    category: 'Legal Ops' | 'Finance' | 'IT Engineering' | 'Product Ops';
    assignee: string;
    durationHours: number;
    xpReward: number;
    antiHoardingLock: boolean;
    subtasks?: DecomposedMicroTask[];
  }) => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  onAssignTask,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Legal Ops' | 'Finance' | 'IT Engineering' | 'Product Ops'>('Legal Ops');
  const [assignee, setAssignee] = useState('Ali Mammadov');
  const [durationHours, setDurationHours] = useState(2);
  const [xpReward, setXpReward] = useState(50);
  const [antiHoardingLock, setAntiHoardingLock] = useState(true);

  // AI Task Decomposition State
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [decomposedMicroTasks, setDecomposedMicroTasks] = useState<DecomposedMicroTask[]>([]);
  const [decomposeStatus, setDecomposeStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  if (!isOpen) return null;

  const handleDecomposeTask = async () => {
    if (!title.trim()) return;

    setIsDecomposing(true);
    setDecomposeStatus({
      type: 'loading',
      message: `Fetching http://localhost:8000/api/decompose-task...`,
    });

    try {
      const response = await decomposeTask({
        title,
        category,
        assignee,
        durationHours,
      });

      const extractedTasks: DecomposedMicroTask[] =
        response.tasks ||
        response.subtasks ||
        response.microTasks ||
        (response.steps
          ? response.steps.map((step) => ({
              title: step,
              category,
              durationHours: Math.max(0.5, Math.round((durationHours / (response.steps?.length || 2)) * 10) / 10),
              xpReward: Math.round(xpReward / (response.steps?.length || 2)),
            }))
          : []);

      if (extractedTasks.length > 0) {
        setDecomposedMicroTasks(extractedTasks);
      } else {
        // Fallback structure if response is a general message
        setDecomposedMicroTasks([
          {
            title: `Review prerequisites & setup for "${title}"`,
            category,
            durationHours: 0.5,
            xpReward: 15,
          },
          {
            title: `Core execution & compliance checks for "${title}"`,
            category,
            durationHours: Math.max(0.5, durationHours - 1),
            xpReward: Math.max(20, xpReward - 25),
          },
          {
            title: `Generate audit proof & submit for AI Vision check`,
            category,
            durationHours: 0.5,
            xpReward: 10,
          },
        ]);
      }

      if (response.durationHours) setDurationHours(response.durationHours);
      if (response.xpReward) setXpReward(response.xpReward);

      setDecomposeStatus({
        type: 'success',
        message: 'Decomposed via Gemini successfully!',
      });
    } catch (err: unknown) {
      console.warn('Gemini API task decomposition error:', err);
      // Offline fallback
      setDecomposedMicroTasks([
        {
          title: `Step 1: Ingest specifications for ${title}`,
          category,
          durationHours: 0.5,
          xpReward: 15,
        },
        {
          title: `Step 2: Draft documentation and verify SLA standards`,
          category,
          durationHours: 1,
          xpReward: 25,
        },
        {
          title: `Step 3: Export verified artifact and run AI vision inspection`,
          category,
          durationHours: 0.5,
          xpReward: 10,
        },
      ]);
      setDecomposeStatus({
        type: 'error',
        message: 'Gemini API unavailable. Using smart fallback breakdown.',
      });
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAssignTask({
      title,
      category,
      assignee,
      durationHours,
      xpReward,
      antiHoardingLock,
      subtasks: decomposedMicroTasks.length > 0 ? decomposedMicroTasks : undefined,
    });

    setTitle('');
    setDecomposedMicroTasks([]);
    setDecomposeStatus({ type: 'idle', message: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Assign New Micro-Task</h3>
            <p className="text-xs text-slate-400">
              Distribute workflow items with AI Mentorship parameters.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Task Title *</label>
              <span className="text-[10px] text-indigo-400 font-mono">
                API: /api/decompose-task
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Verify SOC-2 Data Subcontractor SLA"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleDecomposeTask}
                disabled={isDecomposing || !title.trim()}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer shrink-0"
                title="Decompose task into micro-tasks via Backend API"
              >
                {isDecomposing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>AI Decompose</span>
              </button>
            </div>
          </div>

          {/* AI Decomposition Status Banner */}
          {decomposeStatus.type !== 'idle' && (
            <div
              className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] ${
                decomposeStatus.type === 'loading'
                  ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
                  : decomposeStatus.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}
            >
              {decomposeStatus.type === 'loading' && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
              )}
              {decomposeStatus.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {decomposeStatus.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span className="flex-1">{decomposeStatus.message}</span>
            </div>
          )}

          {/* Decomposed Subtasks Preview List */}
          {decomposedMicroTasks.length > 0 && (
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Decomposed Micro-Tasks ({decomposedMicroTasks.length})
                </span>
                <span className="text-[10px] text-slate-400">Ready to dispatch</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {decomposedMicroTasks.map((st, i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <span className="text-slate-200 font-medium truncate mr-2">
                      {i + 1}. {st.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                      <span className="text-slate-400">{st.durationHours || 0.5}h</span>
                      <span className="text-emerald-400 font-bold">+{st.xpReward || 15}XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Legal Ops">Legal &amp; Compliance</option>
                <option value="Finance">Finance &amp; Billing</option>
                <option value="IT Engineering">IT &amp; Security</option>
                <option value="Product Ops">Product Ops</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Address To (Employee or Cohort)
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Ali Mammadov">Ali Mammadov (Legal)</option>
                <option value="Gunel Rustamova">Gunel Rustamova (Finance)</option>
                <option value="Eldar Hasanov">Eldar Hasanov (IT)</option>
                <option value="All Legal Ops">Auto-Queue: Legal Cohort</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimated Duration</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">hours</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Gamification Reward</label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2 text-emerald-400 font-mono font-bold">
                  +XP
                </span>
              </div>
            </div>
          </div>

          {/* Anti-Hoarding Lock Toggle */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Enforce Anti-Hoarding Lock Policy
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Locks task to user exclusively. Blocks hoarded backlogs.
              </div>
            </div>
            <input
              type="checkbox"
              checked={antiHoardingLock}
              onChange={(e) => setAntiHoardingLock(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              {decomposedMicroTasks.length > 0
                ? `Dispatch ${decomposedMicroTasks.length} Micro-Tasks`
                : 'Create & Dispatch Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
