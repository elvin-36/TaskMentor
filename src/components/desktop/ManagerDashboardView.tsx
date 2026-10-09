import React, { useState } from 'react';
import {
  Users,
  Gauge,
  Clock,
  ShieldCheck,
  Activity,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Smartphone,
  Zap,
  Check,
  Trophy,
  Gift,
  ShieldAlert,
  Download,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuditLogItem, EmployeeRank } from '../../types';

interface EmployeeTableRow {
  id: string;
  name: string;
  dept: string;
  deptFull: string;
  role: string;
  avatar: string;
  countryCode: string;
  taskTitle: string;
  taskMeta: string;
  progress: number;
  checkpoint: string;
  learningIndex: string;
  learningIndexLevel: string;
  status: 'In Progress' | 'AI Verified' | 'Flagged';
  isMobileSync?: boolean;
}

interface ManagerDashboardViewProps {
  aliXp: number;
  aliProgress: number;
  fraudAlertsCount: number;
  auditLogs: AuditLogItem[];
  leaderboard: EmployeeRank[];
  employeeRows: EmployeeTableRow[];
  onSwitchToMobile: () => void;
  onOpenAssignModal: () => void;
  onGrantBonus: (name: string) => void;
  onResolveFlag: (name: string) => void;
  onTriggerRefresh: () => void;
  onAwardMonthlyBonus: () => void;
  onExportCsv: () => void;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
  aliXp,
  aliProgress,
  fraudAlertsCount,
  auditLogs,
  leaderboard,
  employeeRows,
  onSwitchToMobile,
  onOpenAssignModal,
  onGrantBonus,
  onResolveFlag,
  onTriggerRefresh,
  onAwardMonthlyBonus,
  onExportCsv,
}) => {
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEmployees = employeeRows.filter((emp) => {
    const matchDept = filterDept === 'all' || emp.dept === filterDept;
    const matchStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchDept && matchStatus;
  });

  const getLogIcon = (iconName: string, type: string) => {
    switch (iconName) {
      case 'check-circle':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'clock':
      case 'clock-alert':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getLogBg = (type: string) => {
    switch (type) {
      case 'emerald':
        return 'bg-emerald-500/15 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/15 border-rose-500/40';
      default:
        return 'bg-indigo-500/15 border-indigo-500/30';
    }
  };

  return (
    <section className="w-full flex-1 max-w-7xl mx-auto p-4 sm:p-6 space-y-6 transition-opacity duration-300">
      {/* SUBHEADER / QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Operations &amp; Mentorship Control Center
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
              Live Real-Time Sync
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor real-time micro-task execution, AI mentor interactions, and anti-fraud alerts across all onboarding cohorts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAssignModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
          <button
            onClick={onTriggerRefresh}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 inline" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* TOP METRICS BAR (4 KPI CARDS - EXACT SPEC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Employees Onboarding */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Employees Onboarding</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">14</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +3 this week
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>IT: 5 • Finance: 4 • Legal: 5</span>
            <span className="text-indigo-400">100% capacity</span>
          </div>
        </div>

        {/* KPI 2: Avg. Onboarding Speed */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg. Onboarding Speed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">3.2</span>
            <span className="text-xs text-slate-400 font-semibold">Days</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
              -65% time saved
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Industry baseline: 9.1 days per employee
          </div>
        </div>

        {/* KPI 3: Manager Hours Saved */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Manager Hours Saved</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">42</span>
            <span className="text-xs text-slate-400 font-semibold">hrs</span>
            <span className="text-xs text-indigo-400 font-medium">this month</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            AI handled 184 repetitive onboarding queries
          </div>
        </div>

        {/* KPI 4: Anti-Cheat / Fraud Alerts */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Anti-Cheat / Fraud Alerts</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{fraudAlertsCount}</span>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              {fraudAlertsCount > 1 ? 'Needs Action' : 'Flagged (Resolved)'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Vision model confidence: 99.2%</span>
            <button
              onClick={() => setFilterStatus('Flagged')}
              className="text-rose-400 cursor-pointer hover:underline text-[11px]"
            >
              View Log
            </button>
          </div>
        </div>
      </div>

      {/* MAIN SECTION 1: LIVE EMPLOYEE TASK TRACKER (TABLE) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Table Header & Filters */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Live Employee Task Tracker
            </h3>
            <p className="text-xs text-slate-400">
              Real-time telemetry on active micro-tasks, progress locks, and learning behavior.
            </p>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 mr-2">Dept:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Departments (3)</option>
                <option value="Legal" className="bg-slate-900">Legal Ops</option>
                <option value="Finance" className="bg-slate-900">Finance</option>
                <option value="IT" className="bg-slate-900">IT Engineering</option>
              </select>
            </div>
            <div className="flex items-center bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 mr-2">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="In Progress" className="bg-slate-900">In Progress</option>
                <option value="AI Verified" className="bg-slate-900">AI Verified</option>
                <option value="Flagged" className="bg-slate-900">Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Assigned Task</th>
                <th className="py-3 px-4">Live Progress</th>
                <th className="py-3 px-4">AI Learning Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredEmployees.map((emp) => {
                const isAli = emp.isMobileSync;
                const currentProgress = isAli ? aliProgress : emp.progress;

                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-slate-850/50 transition ${
                      emp.status === 'Flagged' ? 'bg-rose-500/[0.04]' : ''
                    }`}
                  >
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className={`w-8 h-8 rounded-full border object-cover ${
                            emp.status === 'Flagged'
                              ? 'border-rose-500/50'
                              : isAli
                              ? 'border-indigo-500/50'
                              : 'border-slate-700'
                          }`}
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {emp.name}
                            {isAli && (
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono">
                                Mobile Sync
                              </span>
                            )}
                            {emp.status === 'Flagged' && (
                              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded font-mono">
                                Flagged
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {emp.deptFull} • {emp.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Task Title & Meta */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">{emp.taskTitle}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {isAli ? (
                          <>
                            <Lock className="w-3 h-3 text-indigo-400" /> Locked • Due in 01:24:07
                          </>
                        ) : (
                          emp.taskMeta
                        )}
                      </div>
                    </td>

                    {/* Live Progress Bar */}
                    <td className="py-3.5 px-4 w-44">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span className={emp.status === 'Flagged' ? 'text-rose-400 font-bold' : ''}>
                          {emp.status === 'Flagged' ? 'Blocked' : `${currentProgress}%`}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {isAli ? 'Checkpoint 2/4' : emp.checkpoint}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            emp.status === 'Flagged'
                              ? 'bg-rose-500'
                              : currentProgress === 100
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${currentProgress}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* AI Learning Index */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          emp.learningIndexLevel === 'high'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : emp.learningIndexLevel === 'medium'
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {emp.learningIndexLevel === 'high' && <Zap className="w-3 h-3" />}
                        {emp.learningIndexLevel === 'medium' && <Bot className="w-3 h-3" />}
                        {emp.learningIndexLevel === 'low' && <AlertTriangle className="w-3 h-3" />}
                        {emp.learningIndex}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          emp.status === 'AI Verified'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : emp.status === 'Flagged'
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                            : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        }`}
                      >
                        {emp.status === 'In Progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        )}
                        {emp.status === 'AI Verified' && <Check className="w-3 h-3" />}
                        {emp.status === 'Flagged' && <AlertTriangle className="w-3 h-3" />}
                        {emp.status === 'Flagged' ? 'Flagged for Review' : emp.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAli && (
                          <button
                            onClick={onSwitchToMobile}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Inspect Mobile Screen"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {emp.status === 'Flagged' ? (
                          <button
                            onClick={() => onResolveFlag(emp.name)}
                            className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition cursor-pointer"
                          >
                            Resolve
                          </button>
                        ) : (
                          <button
                            onClick={() => onGrantBonus(emp.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Give +25 XP Bonus"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAIN SECTION 2 & 4: TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 2: GAMIFICATION & REWARDS LEADERBOARD (Top 3) */}
        <div className="lg:col-span-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Leaderboard &amp; Rewards
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                June Cohort
              </span>
            </div>

            {/* Top 3 List */}
            <div className="space-y-3">
              {leaderboard.map((item, index) => {
                const isAli = item.name === 'Ali Mammadov';
                const displayedXp = isAli ? aliXp : item.xp;

                return (
                  <div
                    key={item.name}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      index === 0
                        ? 'bg-gradient-to-r from-amber-500/10 via-slate-850 to-slate-900 border-amber-500/30'
                        : isAli
                        ? 'bg-slate-850 border-indigo-500/30'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 shadow ${
                          index === 0
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.rank}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.dept}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-xs ${
                          index === 0
                            ? 'text-amber-400'
                            : isAli
                            ? 'text-emerald-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        {displayedXp} XP
                      </div>
                      <span className="text-[9px] text-emerald-400">
                        {item.streakText || `Level ${item.level}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Award Monthly Bonus CTA Button */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={onAwardMonthlyBonus}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Award Monthly Bonus ($150 Gift Card)</span>
            </button>
          </div>
        </div>

        {/* SECTION 4: AI ANALYTICS & FRAUD LOG (Mini Feed) */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  AI Analytics &amp; Real-Time Audit Log
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous telemetry generated by AI Mentor agent and Vision validator.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Stream Active
              </span>
            </div>

            {/* Log Entries List */}
            <div className="space-y-2.5 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl bg-slate-950 border flex items-start justify-between gap-3 animate-fade-in ${getLogBg(
                    log.type
                  )}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg shrink-0">
                      {getLogIcon(log.icon, log.type)}
                    </div>
                    <div>
                      <span className="text-white font-bold font-sans">{log.title}:</span>{' '}
                      <span className="text-slate-200 font-sans">{log.message}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log Stats Summary */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Audit retention: 90 days SOC-2 Type II</span>
            <button
              onClick={onExportCsv}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Log</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
