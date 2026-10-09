import React, { useState } from 'react';
import {
  Sparkles,
  Signal,
  Wifi,
  Battery,
  Flame,
  Lock,
  Timer,
  CheckCircle2,
  Bot,
  Clock,
  Camera,
  ShieldAlert,
  CheckCheck,
  Award,
  Zap,
  CheckSquare,
  Trophy,
  User,
  Layers,
  Loader2,
  X,
} from 'lucide-react';
import { Task, ChatMessage } from '../../types';
import { AiMentorDrawer } from './AiMentorDrawer';
import { ExtensionModal } from './ExtensionModal';
import { VisionProofModal } from './VisionProofModal';
import { decomposeTask, DecomposedMicroTask } from '../../services/api';

interface MobileAppViewProps {
  activeTask: Task;
  queuedTasks: Task[];
  completedTasks: Task[];
  chatMessages: ChatMessage[];
  aliXp: number;
  progressPercent: number;
  remainingSeconds: number;
  isAiLoading?: boolean;
  onUpdateProgress: (val: number) => void;
  onSendMessage: (text: string) => void;
  onGrantExtension: () => void;
  onVerifySuccess: () => void;
  onVerifyFailure: () => void;
  onShowToast: (title: string, message: string, type?: 'indigo' | 'emerald' | 'amber' | 'rose') => void;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  activeTask,
  queuedTasks,
  completedTasks,
  chatMessages,
  aliXp,
  progressPercent,
  remainingSeconds,
  isAiLoading = false,
  onUpdateProgress,
  onSendMessage,
  onGrantExtension,
  onVerifySuccess,
  onVerifyFailure,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'queue' | 'completed'>('active');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [isDecomposeModalOpen, setIsDecomposeModalOpen] = useState(false);
  const [isDecomposingActive, setIsDecomposingActive] = useState(false);
  const [activeSubtasks, setActiveSubtasks] = useState<DecomposedMicroTask[]>([]);

  // Format countdown seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDecomposeActiveTask = async () => {
    setIsDecomposingActive(true);
    setIsDecomposeModalOpen(true);
    try {
      const res = await decomposeTask({
        title: activeTask.title,
        category: activeTask.category,
        assignee: activeTask.assignedTo,
        durationHours: activeTask.remainingSeconds / 3600,
      });

      const extracted: DecomposedMicroTask[] =
        res.tasks ||
        res.subtasks ||
        res.microTasks ||
        (res.steps
          ? res.steps.map((step) => ({
              title: step,
              category: activeTask.category,
              durationHours: 0.5,
              xpReward: 15,
            }))
          : []);

      if (extracted.length > 0) {
        setActiveSubtasks(extracted);
      } else {
        setActiveSubtasks([
          { title: 'Ingest and verify MSA Clause 4 boilerplate', durationHours: 0.5, xpReward: 15 },
          { title: 'Check SOC-2 vendor SLA annex definitions', durationHours: 1.0, xpReward: 25 },
          { title: 'Generate PDF proof for AI Vision verification', durationHours: 0.5, xpReward: 10 },
        ]);
      }
      onShowToast(
        'AI Task Decomposed',
        'Micro-steps fetched via http://localhost:8000/api/decompose-task',
        'indigo'
      );
    } catch (err: any) {
      console.warn('Backend API decompose-task fetch error:', err);
      setActiveSubtasks([
        { title: 'Ingest and verify MSA Clause 4 boilerplate', durationHours: 0.5, xpReward: 15 },
        { title: 'Check SOC-2 vendor SLA annex definitions', durationHours: 1.0, xpReward: 25 },
        { title: 'Generate PDF proof for AI Vision verification', durationHours: 0.5, xpReward: 10 },
      ]);
      onShowToast(
        'Backend Offline',
        'Could not reach http://localhost:8000/api/decompose-task. Displaying local breakdown.',
        'amber'
      );
    } finally {
      setIsDecomposingActive(false);
    }
  };

  return (
    <section className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 transition-opacity duration-300">
      {/* View helper badge */}
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-indigo-500/30 text-indigo-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Simulated Employee View: Live interactive micro-tasks with AI Mentor assistance
        </span>
      </div>

      {/* IPHONE 15 PRO MOCKUP SHELL */}
      <div className="relative w-full max-w-[390px] h-[844px] max-h-[92vh] bg-slate-900 iphone-frame rounded-[46px] overflow-hidden flex flex-col border-[6px] border-slate-800 shadow-2xl">
        {/* DYNAMIC ISLAND / SPEAKER */}
        <div
          onClick={() => setIslandExpanded(!islandExpanded)}
          className={`absolute top-2.5 left-1/2 transform -translate-x-1/2 z-50 bg-black rounded-full flex items-center justify-between px-2.5 cursor-pointer transition-all duration-300 ${
            islandExpanded ? 'w-48 h-8' : 'w-28 h-6'
          }`}
          title="Dynamic Island: Click to toggle"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-500/80"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold text-emerald-400">AI</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            {islandExpanded && (
              <span className="text-[9px] text-slate-300 font-mono ml-1">Copilot Active</span>
            )}
          </div>
        </div>

        {/* MOBILE STATUS BAR */}
        <div className="pt-2 px-6 flex justify-between items-center text-[11px] font-semibold text-slate-400 select-none shrink-0 z-40 bg-slate-900/60 backdrop-blur">
          <span className="font-mono text-slate-200">09:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* MOBILE INNER SCROLL CONTAINER */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 pt-3 relative scroll-smooth" id="mobileScrollArea">
          {/* MOBILE HEADER: Employee Profile & Gamification */}
          <div className="bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 rounded-2xl p-3.5 border border-slate-700/70 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
              {/* Avatar & Name */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5">
                    <img
                      src={activeTask.assigneeAvatar}
                      alt={activeTask.assignedTo}
                      className="w-full h-full object-cover rounded-full border border-slate-900"
                    />
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"
                    title="Online & Active"
                  ></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                    {activeTask.assignedTo}
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      AZ
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-300 font-medium">{activeTask.assigneeRole}</p>
                </div>
              </div>

              {/* XP Points Badge */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  <span id="mobileXpDisplay">{aliXp} XP</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5">Rank #2 in Team</span>
              </div>
            </div>

            {/* LEVEL PROGRESS BAR */}
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-indigo-400" />
                  Level 4 Onboarder
                </span>
                <span className="text-indigo-400 font-mono">150 XP to Level 5</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* MOBILE TABS */}
          <div className="flex items-center justify-between gap-1 mt-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'font-bold bg-indigo-600 text-white shadow'
                  : 'font-medium text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Tasks (1)
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'font-bold bg-indigo-600 text-white shadow'
                  : 'font-medium text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto-Queue ({queuedTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'font-bold bg-indigo-600 text-white shadow'
                  : 'font-medium text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>

          {/* TAB CONTENT 1: ACTIVE TASKS */}
          {activeTab === 'active' && (
            <div className="mt-4 space-y-3.5 animate-fade-in">
              {/* MAIN ACTIVE TASK CARD: Prepare B2B Contract Template */}
              <div className="bg-slate-850 rounded-2xl p-4 border border-indigo-500/30 shadow-xl relative overflow-hidden transition-all hover:border-indigo-500/60">
                {/* Top tags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                    <Flame className="w-3 h-3" />
                    High Priority
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    <Lock className="w-3 h-3" />
                    Locked to Ali • Anti-Hoarding On
                  </span>
                </div>

                {/* Title & Meta */}
                <h4 className="text-base font-bold text-white leading-snug">{activeTask.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {activeTask.description}
                </p>

                {/* COUNTDOWN TIMER */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        Time Remaining
                      </div>
                      <div className="font-mono text-sm font-bold text-amber-300 tracking-wide">
                        {formatTime(remainingSeconds)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/ 02:30:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                      +{activeTask.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* PROGRESS CHECKPOINT SLIDER */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Progress Checkpoint
                    </span>
                    <span className="font-mono font-bold text-indigo-300 text-xs">
                      {progressPercent}% Completed
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={(e) => onUpdateProgress(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span className={progressPercent < 35 ? 'text-indigo-400 font-bold' : ''}>
                      Drafting
                    </span>
                    <span
                      className={
                        progressPercent >= 35 && progressPercent < 75
                          ? 'text-indigo-400 font-bold'
                          : ''
                      }
                    >
                      Reviewing
                    </span>
                    <span className={progressPercent >= 75 ? 'text-emerald-400 font-bold' : ''}>
                      AI Proof
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS (4 INTERACTIVE BUTTONS CONNECTED TO BACKEND) */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  {/* Button A: Ask AI Mentor for Help (POST /api/ask-mentor) */}
                  <button
                    onClick={() => setIsAiDrawerOpen(true)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-200" />
                      Ask AI Mentor for Help
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-500/40 px-1.5 py-0.5 rounded text-indigo-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      /api/ask-mentor
                    </span>
                  </button>

                  {/* 3-Col Action Grid: Extension, Decompose, Submit Proof */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Button B: Request AI Time Extension */}
                    <button
                      onClick={() => setIsExtensionModalOpen(true)}
                      className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold transition active:scale-[0.98] cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                      <span>Extension</span>
                    </button>

                    {/* Button C: Decompose Task (POST /api/decompose-task) */}
                    <button
                      onClick={handleDecomposeActiveTask}
                      disabled={isDecomposingActive}
                      className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold transition active:scale-[0.98] cursor-pointer"
                      title="Decompose task via /api/decompose-task"
                    >
                      {isDecomposingActive ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin mb-0.5" />
                      ) : (
                        <Layers className="w-3.5 h-3.5 text-indigo-400 mb-0.5" />
                      )}
                      <span>Decompose</span>
                    </button>

                    {/* Button D: Submit Proof (POST /api/verify-proof) */}
                    <button
                      onClick={() => setIsVisionModalOpen(true)}
                      className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold transition active:scale-[0.98] cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                      <span>Proof</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Anti-Hoarding Guideline Badge */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
                <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-300">Anti-Hoarding Policy:</span> Only 1 active
                  task allowed simultaneously. Task expires if idle for &gt;45 mins without Mentor
                  Copilot interaction.
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: AUTO-QUEUE (BACKLOG) */}
          {activeTab === 'queue' && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {queuedTasks.map((qTask, idx) => (
                <div key={qTask.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">
                      {idx + 1}. {qTask.title}
                    </span>
                    <span className="text-indigo-400 font-mono text-[10px]">
                      +{qTask.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{qTask.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Est: {qTask.estimatedMinutes} mins</span>
                    <span className={idx === 0 ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                      {idx === 0 ? 'Auto-assigned in queue' : idx === 1 ? 'Requires Level 4' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT 3: COMPLETED TASKS */}
          {activeTab === 'completed' && (
            <div className="mt-4 space-y-2.5 animate-fade-in">
              {completedTasks.map((cTask) => (
                <div
                  key={cTask.id}
                  className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {cTask.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{cTask.description}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{cTask.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FLOATING AI MENTOR DRAWER */}
        <AiMentorDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          messages={chatMessages}
          onSendMessage={onSendMessage}
          taskTitle={activeTask.title}
          isLoading={isAiLoading}
        />

        {/* AI TIME EXTENSION MODAL */}
        <ExtensionModal
          isOpen={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
          progressPercent={progressPercent}
          queriesCount={chatMessages.length + 5}
          onGrantExtension={onGrantExtension}
        />

        {/* PHOTO PROOF UPLOAD & AI VISION VERIFICATION */}
        <VisionProofModal
          isOpen={isVisionModalOpen}
          onClose={() => setIsVisionModalOpen(false)}
          onVerifySuccess={onVerifySuccess}
          onVerifyFailure={onVerifyFailure}
        />

        {/* ACTIVE TASK DECOMPOSED SUBTASKS MODAL */}
        {isDecomposeModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs p-4 shadow-2xl relative">
              <button
                onClick={() => setIsDecomposeModalOpen(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AI Task Decomposition</h3>
                  <div className="text-[9px] text-emerald-400 font-mono">POST /api/decompose-task</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 mt-1 mb-2">
                Deconstructed <span className="font-semibold text-white">"{activeTask.title}"</span> into micro-steps:
              </p>

              {isDecomposingActive ? (
                <div className="p-4 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
                  <div className="text-xs text-slate-300 font-mono">Fetching backend breakdown...</div>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeSubtasks.map((st, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <span className="text-slate-200 font-medium truncate mr-1">
                        {i + 1}. {st.title}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold shrink-0 text-[10px]">
                        +{st.xpReward || 15}XP
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsDecomposeModalOpen(false)}
                className="w-full mt-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* MOBILE BOTTOM DOCK */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-6 flex items-center justify-between z-30">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === 'active' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-[10px] font-bold">Tasks</span>
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span className="text-[10px]">AI Mentor</span>
          </button>
          <button
            onClick={() =>
              onShowToast(
                'Gamification Rank',
                `Ali Mammadov: #2 in Legal Ops (${aliXp} XP earned, 150 XP to Level 5).`,
                'indigo'
              )
            }
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[10px]">Rank</span>
          </button>
          <button
            onClick={() =>
              onShowToast(
                'Employee Profile',
                'Ali Mammadov - Junior Specialist (Legal Ops). Anti-hoarding lock active.',
                'indigo'
              )
            }
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>

        {/* HOME INDICATOR BAR */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full z-40"></div>
      </div>
    </section>
  );
};
