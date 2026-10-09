import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_ACTIVE_TASK,
  INITIAL_QUEUED_TASKS,
  INITIAL_COMPLETED_TASKS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_EMPLOYEES_TABLE,
  INITIAL_LEADERBOARD,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { Task, ChatMessage, AuditLogItem, EmployeeRank } from './types';
import { Header } from './components/Header';
import { Toast, ToastData } from './components/Toast';
import { MobileAppView } from './components/mobile/MobileAppView';
import { ManagerDashboardView } from './components/desktop/ManagerDashboardView';
import { AssignTaskModal } from './components/desktop/AssignTaskModal';
import { askMentor, DecomposedMicroTask } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<'mobile' | 'desktop'>('mobile');
  const [activeTask, setActiveTask] = useState<Task>(INITIAL_ACTIVE_TASK);
  const [queuedTasks, setQueuedTasks] = useState<Task[]>(INITIAL_QUEUED_TASKS);
  const [completedTasks, setCompletedTasks] = useState<Task[]>(INITIAL_COMPLETED_TASKS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aliXp, setAliXp] = useState<number>(350);
  const [progressPercent, setProgressPercent] = useState<number>(40);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    1 * 3600 + 24 * 60 + 7 // 01:24:07
  );
  const [fraudAlertsCount, setFraudAlertsCount] = useState<number>(1);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [employeeRows, setEmployeeRows] = useState(INITIAL_EMPLOYEES_TABLE);
  const [leaderboard, setLeaderboard] = useState<EmployeeRank[]>(INITIAL_LEADERBOARD);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Auto-countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Ali XP to Leaderboard and table
  useEffect(() => {
    setLeaderboard((prev) =>
      prev.map((item) => (item.name === 'Ali Mammadov' ? { ...item, xp: aliXp } : item))
    );
  }, [aliXp]);

  const showToast = (
    title: string,
    message: string,
    type: 'indigo' | 'emerald' | 'amber' | 'rose' = 'indigo'
  ) => {
    const newToast: ToastData = {
      id: String(Date.now()),
      title,
      message,
      type,
    };
    setToast(newToast);
    setTimeout(() => {
      setToast((current) => (current?.id === newToast.id ? null : current));
    }, 4500);
  };

  const addAuditLog = (
    title: string,
    message: string,
    type: 'indigo' | 'emerald' | 'amber' | 'rose',
    icon: string = 'bot'
  ) => {
    const newLog: AuditLogItem = {
      id: `LOG-${Date.now()}`,
      title,
      message,
      type,
      icon,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateProgress = (val: number) => {
    setProgressPercent(val);
    setActiveTask((prev) => ({ ...prev, progressPercent: val }));
  };

  // AI Mentor Chat Handler
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await askMentor({
        message: text,
        taskTitle: activeTask.title,
        taskDescription: activeTask.description,
        taskId: activeTask.id,
        history: chatMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      });

      const replyText =
        response.reply ||
        response.answer ||
        response.response ||
        response.text ||
        response.message ||
        'I am analyzing your onboarding task. Please follow enterprise guidelines.';

      const aiMsg: ChatMessage = {
        id: `MSG-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        richContent: response.richContent,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      addAuditLog(
        'Mentor Copilot (API)',
        `Ali M. inquired: "${text.slice(0, 30)}..." • Answered by Gemini`,
        'indigo',
        'bot'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown Gemini API error.';
      console.error('Gemini AI Mentor request failed:', err);
      const aiMsg: ChatMessage = {
        id: `MSG-${Date.now() + 1}`,
        sender: 'ai',
        text: `I couldn't get a response from Gemini. ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      showToast('Gemini Request Failed', errorMessage, 'amber');
      addAuditLog(
        'Mentor Copilot (Error)',
        `Ali M. inquired: "${text.slice(0, 30)}..." • Gemini request failed`,
        'amber',
        'bot'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Time Extension Handler
  const handleGrantExtension = () => {
    setRemainingSeconds((prev) => prev + 1800); // Add 30 mins
    addAuditLog(
      'AI Extension',
      'Granted +30m to Ali Mammadov (+8 questions learning verified)',
      'amber',
      'clock'
    );
    showToast(
      'Extension Granted!',
      'AI Mentor granted +30 minutes based on high interactive learning.',
      'amber'
    );
  };

  // Photo Proof Verified Success
  const handleVerifySuccess = () => {
    setAliXp((prev) => prev + 50);
    setProgressPercent(100);
    setActiveTask((prev) => ({ ...prev, progressPercent: 100, status: 'AI Verified' }));
    addAuditLog(
      'AI Vision Pass',
      'Verified Ali M. document proof (96.4% confidence) - +50 XP awarded',
      'emerald',
      'check-circle'
    );
    showToast(
      'Proof Approved!',
      'AI Vision verified Contract MSA document. +50 XP awarded to Ali!',
      'emerald'
    );
  };

  // Photo Proof Fraud Detection Trigger
  const handleVerifyFailure = () => {
    setFraudAlertsCount((prev) => prev + 1);
    addAuditLog(
      'FRAUD ALERT',
      'Ali M. uploaded non-contract image. Flagged for Manager review on Desktop Dashboard.',
      'rose',
      'alert-triangle'
    );
    showToast(
      'Fraud Alert Flagged',
      'Image does not match criteria. Telemetry sent to Manager Dashboard.',
      'rose'
    );
  };

  // Manager Awards Manual Bonus
  const handleGrantBonus = (name: string) => {
    showToast('Bonus Awarded!', `+25 XP instant micro-bonus dispatched to ${name}.`, 'indigo');
    if (name.includes('Ali')) {
      setAliXp((prev) => prev + 25);
    }
    addAuditLog('Manual Bonus', `Manager awarded +25 XP to ${name}`, 'indigo', 'bot');
  };

  // Manager Resolves Flag
  const handleResolveFlag = (name: string) => {
    showToast('Flag Resolved', `Compliance review verified for ${name}. Restriction lifted.`, 'emerald');
    addAuditLog('Flag Resolved', `Manager cleared fraud flag for ${name}`, 'emerald', 'check-circle');
    setFraudAlertsCount((prev) => (prev > 1 ? prev - 1 : 1));
    setEmployeeRows((prev) =>
      prev.map((row) =>
        row.name === name
          ? {
              ...row,
              status: 'AI Verified' as const,
              checkpoint: 'Verified by Manager',
              progress: 100,
            }
          : row
      )
    );
  };

  // Award Monthly Bonus
  const handleAwardMonthlyBonus = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    showToast(
      'Monthly Bonus Dispatched!',
      'Awarded $150 gift voucher & Golden Badge to June Cohort Leader Eldar Hasanov!',
      'amber'
    );
    addAuditLog(
      'Monthly Bonus',
      'Dispatched $150 gift voucher to #1 Rank Eldar Hasanov',
      'amber',
      'clock'
    );
  };

  // Assign New Task (Supports decomposed micro-tasks from Gemini)
  const handleAssignTask = (newTaskData: {
    title: string;
    category: 'Legal Ops' | 'Finance' | 'IT Engineering' | 'Product Ops';
    assignee: string;
    durationHours: number;
    xpReward: number;
    antiHoardingLock: boolean;
    subtasks?: DecomposedMicroTask[];
  }) => {
    if (newTaskData.subtasks && newTaskData.subtasks.length > 0) {
      const createdSubtasks: Task[] = newTaskData.subtasks.map((st, idx) => ({
        id: `TASK-${Date.now()}-${idx}`,
        title: st.title,
        description: `Micro-task decomposed by Gemini from "${newTaskData.title}".`,
        category: (st.category || newTaskData.category) as any,
        priority: 'High',
        assigneeDept: newTaskData.category,
        assigneeRole: 'Specialist Trainee',
        assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        assignedTo: newTaskData.assignee,
        xpReward: st.xpReward || Math.round(newTaskData.xpReward / newTaskData.subtasks!.length),
        estimatedMinutes: Math.round((st.durationHours || 0.5) * 60),
        remainingSeconds: Math.round((st.durationHours || 0.5) * 3600),
        totalSeconds: Math.round((st.durationHours || 0.5) * 3600),
        progressPercent: 0,
        status: 'Queued',
        locked: newTaskData.antiHoardingLock,
        queriesCount: 0,
        antiHoardingEnabled: newTaskData.antiHoardingLock,
      }));

      setQueuedTasks((prev) => [...createdSubtasks, ...prev]);
      showToast(
        'AI Micro-Tasks Dispatched!',
        `${createdSubtasks.length} micro-tasks created by Gemini and assigned to ${newTaskData.assignee}.`,
        'indigo'
      );
      addAuditLog(
        'AI Decompose Task',
        `Decomposed "${newTaskData.title}" into ${createdSubtasks.length} micro-tasks with Gemini`,
        'indigo',
        'bot'
      );
      return;
    }

    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      title: newTaskData.title,
      description: `Assigned to ${newTaskData.assignee} with Anti-Hoarding enforcement.`,
      category: newTaskData.category,
      priority: 'High',
      assignedTo: newTaskData.assignee,
      assigneeDept: newTaskData.category,
      assigneeRole: 'Specialist Trainee',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      xpReward: newTaskData.xpReward,
      estimatedMinutes: newTaskData.durationHours * 60,
      remainingSeconds: newTaskData.durationHours * 3600,
      totalSeconds: newTaskData.durationHours * 3600,
      progressPercent: 0,
      status: 'Queued',
      locked: newTaskData.antiHoardingLock,
      queriesCount: 0,
      antiHoardingEnabled: newTaskData.antiHoardingLock,
    };

    setQueuedTasks((prev) => [newTask, ...prev]);
    showToast(
      'Task Dispatched!',
      `"${newTaskData.title}" locked to ${newTaskData.assignee} (+${newTaskData.xpReward} XP, ${newTaskData.durationHours}h est).`,
      'indigo'
    );
    addAuditLog(
      'Task Dispatched',
      `New task "${newTaskData.title}" assigned to ${newTaskData.assignee} (+${newTaskData.xpReward} XP)`,
      'indigo',
      'bot'
    );
  };

  // Export CSV Log
  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Event,Details,Status']
        .concat(
          auditLogs.map(
            (log) =>
              `"${log.timestamp}","${log.title}","${log.message.replace(/"/g, '""')}","${log.type}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TaskMentor_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report Generated', 'Audit log export downloaded: TaskMentor_Audit_Report_2024.csv', 'indigo');
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen antialiased flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 perspective-grid pointer-events-none opacity-40"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* TOP GLOBAL APP HEADER */}
      <Header
        currentView={currentView}
        onSwitchView={setCurrentView}
        onTriggerNotification={() =>
          showToast(
            'Mentor AI Notice',
            'Ali Mammadov just requested guidance on clause 4 and SLA Annex C!',
            'indigo'
          )
        }
        activeCount={14}
      />

      {/* NOTIFICATION TOAST */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* MAIN CONTAINER */}
      <main className="flex-1 relative overflow-x-hidden flex flex-col justify-start">
        {currentView === 'mobile' ? (
          <MobileAppView
            activeTask={activeTask}
            queuedTasks={queuedTasks}
            completedTasks={completedTasks}
            chatMessages={chatMessages}
            aliXp={aliXp}
            progressPercent={progressPercent}
            remainingSeconds={remainingSeconds}
            isAiLoading={isAiLoading}
            onUpdateProgress={handleUpdateProgress}
            onSendMessage={handleSendMessage}
            onGrantExtension={handleGrantExtension}
            onVerifySuccess={handleVerifySuccess}
            onVerifyFailure={handleVerifyFailure}
            onShowToast={showToast}
          />
        ) : (
          <ManagerDashboardView
            aliXp={aliXp}
            aliProgress={progressPercent}
            fraudAlertsCount={fraudAlertsCount}
            auditLogs={auditLogs}
            leaderboard={leaderboard}
            employeeRows={employeeRows}
            onSwitchToMobile={() => setCurrentView('mobile')}
            onOpenAssignModal={() => setIsAssignModalOpen(true)}
            onGrantBonus={handleGrantBonus}
            onResolveFlag={handleResolveFlag}
            onTriggerRefresh={() => {
              showToast('Feed Refreshed', 'Telemetry streams synchronized with edge nodes.', 'indigo');
            }}
            onAwardMonthlyBonus={handleAwardMonthlyBonus}
            onExportCsv={handleExportCsv}
          />
        )}
      </main>

      {/* ASSIGN NEW TASK ACTION MODAL */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignTask={handleAssignTask}
      />
    </div>
  );
}
