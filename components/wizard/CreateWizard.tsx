
import React, { useState } from 'react';
import { ProjectConfig, AppTheme } from '../../types';
import { Button } from '../ui/Button';
import { CheckIcon, ArrowRightIcon, ChevronRightIcon } from '../Icons';

interface CreateWizardProps {
  onComplete: (config: ProjectConfig) => void;
  onCancel: () => void;
}

const THEMES: { id: AppTheme; name: string; description: string; color: string }[] = [
  { id: 'modern-clean', name: 'Modern Clean', description: 'Minimalist, whitespace-heavy, corporate friendly.', color: 'from-slate-400 to-slate-600' },
  { id: 'glassmorphism', name: 'Glassmorphism', description: 'Translucent layers, blurs, and vivid gradients.', color: 'from-purple-400 to-pink-500' },
  { id: 'neobrutalism', name: 'Neo-Brutalism', description: 'High contrast, bold borders, vibrant colors.', color: 'from-yellow-400 to-orange-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Dark mode, neon accents, futuristic tech feel.', color: 'from-pink-500 to-cyan-400' },
  { id: 'minimal', name: 'Ultra Minimal', description: 'Monochrome, typography-focused, essential.', color: 'from-gray-300 to-gray-500' },
];

const TEMPLATES = [
  {
    name: "DevFolio X",
    description: "A high-impact personal portfolio for developers. Features a glitch-effect hero section, a masonry grid for project showcases, technical skills visualization, and a terminal-style contact form.",
    theme: 'cyberpunk' as AppTheme,
    features: ["Hero Animation", "Project Grid", "Skills Graph", "Contact Form"]
  },
  {
    name: "TaskFlow Pro",
    description: "A productivity dashboard designed for focus. Includes drag-and-drop task management, category filtering, local storage persistence, and a Pomodoro timer integration.",
    theme: 'modern-clean' as AppTheme,
    features: ["Task CRUD", "Drag & Drop", "Local Storage", "Pomodoro Timer"]
  },
  {
    name: "ZenReader",
    description: "A distraction-free blog platform. Features include estimated reading times, dark/light mode toggle, markdown rendering, and a newsletter subscription component.",
    theme: 'minimal' as AppTheme,
    features: ["Article View", "Dark Mode", "Newsletter", "Reading Time"]
  }
];

export const CreateWizard: React.FC<CreateWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ProjectConfig>({
    name: '',
    description: '',
    theme: 'modern-clean',
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setConfig(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setConfig(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  // Auto-add feature if user typed it but forgot to click Add when clicking Next
  const handleNextFromFeatures = () => {
    if (featureInput.trim()) {
        setConfig(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
        setFeatureInput('');
    }
    setStep(3);
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
      setConfig({
          name: template.name,
          description: template.description,
          theme: template.theme,
          features: template.features
      });
  };

  const isStep1Valid = config.name.length > 0 && config.description.length > 0;
  const isStep2Valid = true; 
  // Step 3 is valid if Step 1 is valid; features are optional (AI can infer)
  const isStep3Valid = isStep1Valid;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 bg-brand-background">
      <div className="max-w-5xl w-full bg-brand-surface border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[700px] backdrop-blur-sm">
        
        {/* Sidebar Steps */}
        <div className="w-full md:w-72 bg-slate-900/80 border-r border-slate-800 p-8 flex flex-col relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <h2 className="text-xl font-bold text-white mb-10 tracking-tight relative z-10">New Project</h2>
          <div className="space-y-8 relative z-10">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex items-center space-x-4 group ${step === s ? 'text-white' : step > s ? 'text-emerald-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${step === s ? 'border-brand-primary bg-brand-primary/20 text-brand-primary shadow-[0_0_10px_rgba(56,189,248,0.3)]' : step > s ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 group-hover:border-slate-600'}`}>
                  {step > s ? <CheckIcon /> : <span className="text-xs font-bold">{s}</span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold transition-colors">
                    {s === 1 ? 'Concept' : s === 2 ? 'Design & Stack' : 'Review'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60 font-medium">
                     {s === 1 ? 'Define Vision' : s === 2 ? 'Customize' : 'Confirmation'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500 font-mono">
            Agentic Builder v1.0
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-ide-bg relative">
          <div className="absolute inset-0 bg-gradient-to-br from-ide-bg to-slate-900 pointer-events-none"></div>
          
          <div className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Project Concept</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">Describe your vision. The agents will use this to architect your application.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-brand-primary transition-colors">Project Name</label>
                    <input 
                      type="text" 
                      value={config.name}
                      onChange={e => setConfig({ ...config, name: e.target.value })}
                      placeholder="e.g. TaskMaster Pro"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-brand-primary transition-colors">Requirements & Description</label>
                    <textarea 
                      value={config.description}
                      onChange={e => setConfig({ ...config, description: e.target.value })}
                      placeholder="Describe the application features, target audience, and any specific behaviors you want..."
                      className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 outline-none transition-all resize-none shadow-inner leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Start Templates</div>
                        <div className="text-[10px] text-slate-600">Click to populate</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {TEMPLATES.map((t, i) => (
                            <button 
                                key={i}
                                onClick={() => applyTemplate(t)}
                                className="text-left p-4 rounded-xl bg-slate-800/20 border border-slate-700/40 hover:bg-slate-700/40 hover:border-brand-primary/30 transition-all group flex flex-col h-full"
                            >
                                <div className="font-semibold text-slate-300 group-hover:text-brand-primary mb-1 transition-colors text-sm">{t.name}</div>
                                <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{t.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Design System</h3>
                  <p className="text-slate-400 text-lg">Choose an aesthetic and define the core capabilities.</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-4">Visual Theme</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => setConfig({...config, theme: theme.id})}
                          className={`relative group flex items-start p-4 rounded-xl border text-left transition-all duration-200 overflow-hidden ${config.theme === theme.id ? 'bg-slate-800 border-brand-primary shadow-[0_0_0_1px_rgba(56,189,248,1)]' : 'bg-slate-800/30 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'}`}
                        >
                           <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${theme.color} opacity-0 transition-opacity ${config.theme === theme.id ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                           <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.color} shadow-lg shrink-0 mr-4 opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                           <div>
                              <div className={`text-base font-semibold ${config.theme === theme.id ? 'text-white' : 'text-slate-200'}`}>{theme.name}</div>
                              <div className="text-sm text-slate-400 mt-1 leading-snug">{theme.description}</div>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Feature List (Optional)</label>
                  <div className="flex space-x-3 mb-4">
                    <input 
                      type="text" 
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddFeature()}
                      placeholder="Add a feature (e.g. 'User Authentication')"
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all shadow-inner"
                    />
                    <Button onClick={handleAddFeature} variant="secondary" className="shadow-none border-slate-600">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                    {config.features.map((f, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20 animate-in zoom-in duration-200">
                        {f}
                        <button onClick={() => removeFeature(i)} className="ml-2 text-brand-primary/60 hover:text-brand-primary focus:outline-none rounded hover:bg-brand-primary/10 p-0.5 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </span>
                    ))}
                    {config.features.length === 0 && <span className="text-sm text-slate-500 italic p-2 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2"></span>AI will infer features from description.</span>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Ready to Launch</h3>
                  <p className="text-slate-400 text-lg">Review your specifications. The agent swarm is standing by.</p>
                </div>

                <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 space-y-8 backdrop-blur-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                   
                   <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-700/50 pb-6 relative z-10">
                      <div>
                         <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Project Name</div>
                         <div className="text-2xl font-bold text-white tracking-tight">{config.name}</div>
                      </div>
                      <div className="md:text-right">
                         <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Selected Theme</div>
                         <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-surface border border-slate-600 text-sm font-medium text-brand-primary shadow-sm">
                            <span className={`w-2 h-2 rounded-full mr-2 bg-gradient-to-br ${THEMES.find(t=>t.id===config.theme)?.color}`}></span>
                            {THEMES.find(t=>t.id===config.theme)?.name}
                         </div>
                      </div>
                   </div>
                   
                   <div className="relative z-10">
                      <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Description</div>
                      <div className="text-base text-slate-300 bg-slate-900/50 p-5 rounded-xl border border-slate-800/50 leading-relaxed shadow-inner">
                        {config.description}
                      </div>
                   </div>

                   <div className="relative z-10">
                      <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Implementation Plan</div>
                      {config.features.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {config.features.map(f => (
                            <div key={f} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                    <CheckIcon />
                                </div>
                                <span className="text-sm font-medium text-slate-200">{f}</span>
                            </div>
                            ))}
                        </div>
                      ) : (
                          <div className="text-slate-500 italic flex items-center p-3 bg-slate-800/30 rounded-lg">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2"></div>
                             No specific features listed. Agents will analyze description to scope features.
                          </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 md:p-8 border-t border-slate-800 flex justify-between bg-slate-900/50 backdrop-blur-md relative z-20">
             <Button variant="ghost" onClick={step === 1 ? onCancel : () => setStep(s => s - 1)} className="text-slate-400 hover:text-white">
                {step === 1 ? 'Cancel' : 'Back'}
             </Button>
             
             {step < 3 ? (
                <Button 
                  onClick={() => step === 2 ? handleNextFromFeatures() : setStep(s => s + 1)} 
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                  icon={<ChevronRightIcon />}
                  className="shadow-lg shadow-brand-primary/20"
                >
                  Continue
                </Button>
             ) : (
                <Button 
                  onClick={() => onComplete(config)} 
                  disabled={!isStep3Valid}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 border-0"
                  icon={<ArrowRightIcon />}
                >
                  Generate Application
                </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
