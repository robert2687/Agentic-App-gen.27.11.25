export type AgentRole = 'planner' | 'architect' | 'designer' | 'engineer' | 'qa' | 'devops';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'working' | 'waiting' | 'done';
  message: string;
}

export interface File {
  name: string;
  language: string;
  content: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentId: string; // 'system' or agent ID
  message: string;
  type: 'info' | 'success' | 'error' | 'cmd' | 'warning' | 'chat';
}

export interface ExecutionStep {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

export interface ApiContract {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  request?: string;
  response: string;
}

export interface ClarificationRequest {
  fromAgentId: string;
  toAgentId: string;
  question: string;
}

export type AppTheme = 'modern-clean' | 'glassmorphism' | 'neobrutalism' | 'cyberpunk' | 'minimal';

export interface ProjectConfig {
  name: string;
  description: string;
  theme: AppTheme;
  features: string[];
}

export type ViewMode = 'dashboard' | 'wizard' | 'ide';
