
import React from 'react';
import { GeneratorIcon, ExportIcon, SparklesIcon } from './Icons';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onNavigateHome: () => void;
  onExport?: () => void;
  onRefine?: () => void;
  canExport: boolean;
  canRefine: boolean;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, onNavigateHome, onExport, onRefine, canExport, canRefine }) => {
  return (
    <header className="h-16 glass sticky top-0 z-50 flex items-center justify-between px-6 shrink-0 transition-all duration-300">
      <div className="flex items-center space-x-4 cursor-pointer group" onClick={onNavigateHome}>
        <div className="relative">
             <div className="absolute inset-0 bg-brand-primary/50 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-fast"></div>
             <div className="relative text-brand-primary transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                <GeneratorIcon />
             </div>
        </div>
        <div>
          <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-text-primary to-brand-primary tracking-tight group-hover:to-white transition-all">
            Agentic AI App Builder
          </h1>
          <div className="flex items-center space-x-2">
             <span className="text-[10px] text-brand-text-secondary uppercase tracking-widest font-semibold opacity-70">
                v1.0.0
             </span>
             <span className="w-1.5 h-1.5 rounded-full bg-accent-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
             <span className="text-[10px] text-accent-success font-medium">Online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {viewMode === 'ide' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefine}
              disabled={!canRefine}
              className="group flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-sky-400 text-white rounded-full text-xs font-semibold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
            >
              <SparklesIcon />
              <span>Refine</span>
            </button>

            <button
              onClick={onExport}
              disabled={!canExport}
              className="flex items-center space-x-2 px-4 py-2 glass hover:bg-white/10 text-brand-primary rounded-full text-xs font-semibold transition-all border border-brand-primary/20 hover:border-brand-primary/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent"
            >
                <ExportIcon />
                <span>Export</span>
            </button>
          </div>
        )}
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent border-2 border-white/20 shadow-neon-accent hover:scale-105 transition-transform cursor-pointer"></div>
      </div>
    </header>
  );
};
