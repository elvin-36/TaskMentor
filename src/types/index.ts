export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Legal Ops' | 'Finance' | 'IT Engineering' | 'Product Ops';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
  assigneeDept: string;
  assigneeRole: string;
  assigneeAvatar: string;
  xpReward: number;
  estimatedMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  progressPercent: number;
  status: 'In Progress' | 'AI Verified' | 'Flagged' | 'Queued' | 'Completed';
  locked: boolean;
  queriesCount: number;
  antiHoardingEnabled: boolean;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  richContent?: {
    type: 'steps' | 'code' | 'warning';
    steps?: string[];
    code?: string;
    warning?: string;
  };
}

export interface AuditLogItem {
  id: string;
  title: string;
  message: string;
  type: 'indigo' | 'emerald' | 'amber' | 'rose';
  icon: string;
  timestamp: string;
}

export interface EmployeeRank {
  rank: number;
  name: string;
  dept: string;
  tasksDone: number;
  xp: number;
  level: number;
  streakText?: string;
  avatar: string;
}

export interface DecomposedMicroTask {
  title: string;
  category?: 'Legal Ops' | 'Finance' | 'IT Engineering' | 'Product Ops';
  durationHours?: number;
  xpReward?: number;
  description?: string;
}

