import React from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  title?: string;
  onChange?: (newCode: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, title, onChange, readOnly = false }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] border-slate-800">
        {title && (
            <div className="px-4 py-2 bg-[#252526] text-xs text-slate-400 border-b border-[#3e3e42] flex items-center shrink-0 justify-between">
                <span>{title}</span>
                <span className="text-[10px] uppercase opacity-50 bg-[#3e3e42] px-1.5 py-0.5 rounded font-mono">{language}</span>
            </div>
        )}
        <div className="flex-1 relative overflow-hidden group">
            <textarea
                value={code}
                onChange={(e) => onChange && onChange(e.target.value)}
                readOnly={readOnly}
                spellCheck={false}
                placeholder={readOnly ? "No content" : "// Type your code here..."}
                className={`w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[13px] leading-6 p-6 outline-none resize-none selection:bg-brand-primary/20 ${
                    readOnly ? 'cursor-default' : 'cursor-text'
                }`}
                style={{ 
                    fontFamily: '"JetBrains Mono", "Menlo", "Consolas", monospace',
                }}
            />
            {!readOnly && (
                <div className="absolute bottom-4 right-4 px-2 py-1 bg-slate-800/80 text-slate-400 text-[10px] rounded border border-slate-700 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Editable
                </div>
            )}
        </div>
    </div>
  );
};

export const CodeBlock = CodeEditor;