import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const statusConfig = {
  idle: { color: 'bg-slate-600', border: 'border-slate-500', glow: '' },
  working: { color: 'bg-amber-400', border: 'border-amber-300', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse' },
  waiting: { color: 'bg-purple-400', border: 'border-purple-300', glow: 'shadow-[0_0_8px_rgba(192,132,252,0.4)]' },
  done: { color: 'bg-emerald-400', border: 'border-emerald-300', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.4)]' },
};

const roleColors = {
  planner: 'text-purple-300',
  architect: 'text-blue-300',
  designer: 'text-pink-300',
  engineer: 'text-orange-300',
  qa: 'text-red-300',
  devops: 'text-cyan-300',
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const status = statusConfig[agent.status];

  return (
    <div className={`group px-4 py-3 border-b border-ide-border hover:bg-white/5 transition-colors duration-200`}>
      <div className="flex items-start space-x-3">
        <div className="relative mt-1">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700 text-slate-300 shadow-sm">
             {agent.name.charAt(0)}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-ide-sidebar ${status.color} ${status.glow}`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <h4 className="text-sm font-medium text-brand-text-primary truncate group-hover:text-white transition-colors">{agent.name}</h4>
            <span className={`text-[10px] font-mono uppercase tracking-wider opacity-80 ${roleColors[agent.role]}`}>{agent.role}</span>
          </div>
          <p className={`text-xs truncate transition-all duration-300 ${agent.status === 'working' ? 'text-brand-primary' : 'text-slate-500'}`}>
             {agent.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export const PipelineStage = AgentCard;