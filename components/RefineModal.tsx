
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { SparklesIcon, XIcon } from './Icons';

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instruction: string) => void;
  isProcessing: boolean;
}

export const RefineModal: React.FC<RefineModalProps> = ({ isOpen, onClose, onSubmit, isProcessing }) => {
  const [instruction, setInstruction] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={!isProcessing ? onClose : undefined} />
      
      {/* Modal Content */}
      <div className="relative bg-brand-surface border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
           <div className="flex items-center space-x-2 text-brand-primary">
              <SparklesIcon />
              <h3 className="font-semibold text-white">Refine Application</h3>
           </div>
           {!isProcessing && (
             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
               <XIcon />
             </button>
           )}
        </div>
        
        <div className="p-6 space-y-4">
           <p className="text-sm text-slate-300">
             Describe how you want to change the application. The agents will analyze the current code and apply your improvements.
           </p>
           
           <textarea 
             value={instruction}
             onChange={(e) => setInstruction(e.target.value)}
             placeholder="e.g. 'Change the background to a dark blue gradient' or 'Add a Reset button next to Submit'"
             className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 outline-none resize-none"
             autoFocus
           />
        </div>
        
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex justify-end space-x-3">
           <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
             Cancel
           </Button>
           <Button 
             onClick={() => onSubmit(instruction)} 
             disabled={!instruction.trim() || isProcessing}
             isLoading={isProcessing}
             className="shadow-lg shadow-brand-primary/20"
           >
             {isProcessing ? 'Refining...' : 'Apply Changes'}
           </Button>
        </div>
      </div>
    </div>
  );
};
