import React from 'react';

interface PanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = "", headerAction }) => {
  return (
    <div className={`flex flex-col bg-ide-sidebar border-ide-border ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-ide-bg/50 border-b border-ide-border shrink-0 backdrop-blur-sm">
        <h3 className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-widest">{title}</h3>
        {headerAction}
      </div>
      <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {children}
      </div>
    </div>
  );
};

export const Section = Panel;