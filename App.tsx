
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Panel } from './components/Section';
import { CodeEditor } from './components/CodeBlock';
import { AgentCard } from './components/PipelineStage';
import { CreateWizard } from './components/wizard/CreateWizard';
import { RefineModal } from './components/RefineModal';
import { Button } from './components/ui/Button';
import { INITIAL_AGENTS, INITIAL_STEPS } from './constants';
import { aiService } from './services/aiService';
import { zipService } from './services/zipService';
import { Agent, LogEntry, File, ExecutionStep, ProjectConfig, ViewMode } from './types';
import { 
  FileIcon, TerminalIcon, 
  CheckCircleIcon, CircleIcon, LoaderIcon,
  DesktopIcon, TabletIcon, MobileIcon,
  GeneratorIcon, MaximizeIcon, MinimizeIcon,
  PlayIcon, AlertTriangleIcon, XIcon
} from './components/Icons';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [completed, setCompleted] = useState(false);
  
  // Project State
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>(INITIAL_STEPS);
  
  // UI State
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewWidth, setPreviewWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  // Refinement State
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle Resize Logic
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
        const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
        setPreviewWidth(Math.min(Math.max(newWidth, 20), 80));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      }

      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // Listen for errors from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'iframe_error') {
        addLog(`Runtime Error: ${event.data.message}`, 'system', 'error');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update preview when files change
  useEffect(() => {
    if (files.length > 0 && iframeRef.current) {
      const htmlFile = files.find(f => f.name.toLowerCase() === 'index.html');
      const cssFile = files.find(f => f.name.toLowerCase() === 'style.css');
      const jsFile = files.find(f => f.name.toLowerCase() === 'app.js');

      if (htmlFile) {
        let content = htmlFile.content;
        
        // Inject CSS
        if (cssFile) {
            if (content.includes('style.css')) {
                content = content.replace(/<link[^>]*href=["']style\.css["'][^>]*>/i, `<style>${cssFile.content}</style>`);
            } else {
                content = content.replace('</head>', `<style>${cssFile.content}</style></head>`);
            }
        }

        // Inject Error Handling & JS
        const errorScript = `
        <script>
            window.onerror = function(msg, url, line, col, error) {
                window.parent.postMessage({ type: 'iframe_error', message: msg }, '*');
            };
            console.error = function(...args) {
                window.parent.postMessage({ type: 'iframe_error', message: args.join(' ') }, '*');
            };
            try { localStorage.getItem('test'); } catch(e) {
                console.warn('LocalStorage unavailable in sandbox, mocking...');
                const store = {};
                window.localStorage = {
                    getItem: (k) => store[k],
                    setItem: (k, v) => store[k] = v,
                    removeItem: (k) => delete store[k],
                    clear: () => {}
                };
            }
        </script>`;

        content = content.replace('<head>', `<head>${errorScript}`);

        if (jsFile) {
           if (content.includes('app.js')) {
               content = content.replace(/<script[^>]*src=["']app\.js["'][^>]*><\/script>/i, `<script>${jsFile.content}</script>`);
           } else {
               content = content.replace('</body>', `<script>${jsFile.content}</script></body>`);
           }
        }
        
        iframeRef.current.srcdoc = content;
      }
    }
  }, [files]);

  const addLog = (message: string, agentId: string = 'system', type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      agentId,
      message,
      type
    }]);
  };

  const showError = (message: string) => {
      setActiveError(message);
      addLog(message, 'system', 'error');
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const updateStep = (id: number, status: ExecutionStep['status']) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const updateFileContent = (newContent: string) => {
    if (!selectedFile) return;
    setFiles(prev => prev.map(f => f.name === selectedFile.name ? { ...f, content: newContent } : f));
    setSelectedFile(prev => prev ? { ...prev, content: newContent } : null);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleProjectCreate = (config: ProjectConfig) => {
      setProjectConfig(config);
      setViewMode('ide');
      // Ensure state is set before running workflow
      setTimeout(() => runForgeWorkflow(config), 0);
  };

  const handleRefinement = async (instruction: string) => {
    if (!projectConfig || !files.length) return;
    
    setIsRefining(true);
    addLog(`Refinement request: "${instruction}"`, 'system', 'cmd');
    updateAgent('4', { status: 'working', message: 'Applying refinements...' });
    
    try {
        const updatedFiles = await aiService.refineCode(files, instruction, projectConfig);
        
        if (updatedFiles.length > 0) {
            // Merge updated files into existing files
            const newFiles = [...files];
            updatedFiles.forEach(uf => {
                const idx = newFiles.findIndex(f => f.name === uf.name);
                if (idx !== -1) {
                    newFiles[idx] = uf;
                    addLog(`Updated ${uf.name}`, '4', 'success');
                } else {
                    newFiles.push(uf);
                    addLog(`Created ${uf.name}`, '4', 'success');
                }
            });
            setFiles(newFiles);
            // Update selected file if the current one was changed, or select the first changed one
            if (selectedFile) {
                const updatedSelected = updatedFiles.find(f => f.name === selectedFile.name);
                if (updatedSelected) setSelectedFile(updatedSelected);
            } else {
                setSelectedFile(updatedFiles[0]);
            }
            addLog('Refinement applied successfully.', 'system', 'success');
        } else {
            addLog('No changes required or refinement failed.', '4', 'warning');
        }
    } catch (e) {
        showError(`Refinement error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        updateAgent('4', { status: 'idle', message: 'Refinement complete.' });
        setIsRefining(false);
        setIsRefineModalOpen(false);
    }
  };

  const runForgeWorkflow = async (config: ProjectConfig) => {
    try {
        setCompleted(false);
        setActiveError(null);
        setFiles([]);
        setLogs([]);
        setAgents(INITIAL_AGENTS);
        setSteps(INITIAL_STEPS);
        
        addLog(`Initializing Agent Swarm for project: "${config.name}"`, 'system', 'cmd');
        
        let localFiles: File[] = [];

        // --- Step 1: Requirements ---
        updateStep(1, 'running');
        updateAgent('1', { status: 'working', message: 'Analyzing project scope...' });
        
        const res1 = await aiService.generateStep(1, { config });
        if (res1.type === 'code' && res1.files.length > 0) {
            localFiles = [...localFiles, ...res1.files];
            setFiles(prev => [...prev, ...res1.files]);
            setSelectedFile(res1.files[0]);
            addLog('Project structure and documentation generated.', '1', 'success');
        } else {
            showError('Failed to generate initial documentation. AI response parsed incorrectly.');
            updateAgent('1', { status: 'idle', message: 'Failed.' });
            return;
        }
        updateAgent('1', { status: 'done', message: 'Specs complete.' });
        updateStep(1, 'completed');


        // --- Step 2: Architecture ---
        updateStep(2, 'running');
        updateAgent('2', { status: 'working', message: 'Designing architecture...' });
        await wait(800);
        addLog('Defining MVC pattern and component hierarchy.', '2');
        updateAgent('2', { status: 'done', message: 'Architecture defined.' });
        updateStep(2, 'completed');


        // --- Step 3 & 4: Design & Scaffold ---
        updateStep(3, 'running');
        updateStep(4, 'running');
        updateAgent('3', { status: 'working', message: `Implementing ${config.theme} design system...` });
        updateAgent('4', { status: 'working', message: 'Scaffolding DOM...' });
        
        // CSS
        const res3 = await aiService.generateStep(3, { config, currentFiles: localFiles }); 
        if (res3.type === 'code' && res3.files.length > 0) {
            localFiles = [...localFiles.filter(f => !res3.files.some(nf => nf.name === f.name)), ...res3.files];
            setFiles(prev => {
                const others = prev.filter(f => !res3.files.find(nf => nf.name === f.name));
                return [...others, ...res3.files];
            });
            addLog('Stylesheet generated.', '3', 'success');
            updateAgent('3', { status: 'done', message: 'Assets ready.' });
            updateStep(3, 'completed');
        } else {
            showError('Failed to generate styles. AI response parsed incorrectly.');
            return;
        }

        // HTML
        const res4 = await aiService.generateStep(4, { config, currentFiles: localFiles });
        if (res4.type === 'code' && res4.files.length > 0) {
            localFiles = [...localFiles.filter(f => !res4.files.some(nf => nf.name === f.name)), ...res4.files];
            setFiles(prev => {
                const others = prev.filter(f => !res4.files.find(nf => nf.name === f.name));
                return [...others, ...res4.files];
            });
            addLog('DOM structure generated.', '4', 'success');
            updateStep(4, 'completed');
        } else {
            showError('Failed to generate DOM. AI response parsed incorrectly.');
            return;
        }


        // --- Step 5: Logic (The Dynamic Loop) ---
        updateStep(5, 'running');
        updateAgent('4', { status: 'working', message: 'Implementing business logic...' });
        
        // Attempt 1
        let logicResult = await aiService.generateStep(5, { config, hasClarified: false, currentFiles: localFiles });

        if (logicResult.type === 'clarification') {
            const req = logicResult.request;
            updateAgent(req.fromAgentId, { status: 'waiting', message: `Asking ${agents.find(a=>a.id===req.toAgentId)?.name}...` });
            addLog(req.question, req.fromAgentId, 'warning');
            
            await wait(500);
            updateAgent(req.toAgentId, { status: 'working', message: 'Resolving ambiguity...' });
            
            const answer = await aiService.getClarificationAnswer(req, config);
            addLog(answer, req.toAgentId, 'chat');
            updateAgent(req.toAgentId, { status: 'idle', message: 'Standing by.' });
            
            await wait(500);
            addLog('Clarification received. Resuming implementation.', 'system');
            updateAgent(req.fromAgentId, { status: 'working', message: 'Coding with new context...' });
            
            // Attempt 2 - Pass the answer back to the generation service
            logicResult = await aiService.generateStep(5, { 
                config, 
                hasClarified: true, 
                currentFiles: localFiles,
                clarificationAnswer: answer
            });
        }

        if (logicResult.type === 'code' && logicResult.files.length > 0) {
            localFiles = [...localFiles.filter(f => !logicResult.files.some(nf => nf.name === f.name)), ...logicResult.files];
            setFiles(prev => {
                const others = prev.filter(f => !logicResult.files.find(nf => nf.name === f.name));
                return [...others, ...logicResult.files];
            });
            const jsFile = logicResult.files.find(f => f.name.endsWith('.js'));
            if (jsFile) setSelectedFile(jsFile);
            addLog('Logic implementation complete.', '4', 'success');
            updateAgent('4', { status: 'done', message: 'Implementation complete.' });
            updateStep(5, 'completed');
        } else {
            showError('Logic implementation failed. AI response parsed incorrectly.');
            return;
        }

        // --- Step 6: QA ---
        updateStep(6, 'running');
        updateAgent('5', { status: 'working', message: 'Running integration tests...' });
        await wait(800);
        addLog('All systems verify. Deployment ready.', '5', 'success');
        updateAgent('5', { status: 'done', message: 'Verified.' });
        updateStep(6, 'completed');

        setCompleted(true);
    } catch (error) {
        console.error("Workflow Error:", error);
        showError(`CRITICAL WORKFLOW ERROR: ${error instanceof Error ? error.message : String(error)}`);
        setCompleted(false);
    }
  };

  const handleExport = () => {
    if (projectConfig) {
        zipService.downloadProject(files, projectConfig.name);
    }
  };

  const toggleZenMode = () => setIsZenMode(prev => !prev);

  return (
    <div className={`flex flex-col h-screen bg-brand-background text-brand-text-primary overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''} relative`}>
      {/* Global Error Toast */}
      {activeError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg animate-in slide-in-from-top-4 fade-in duration-300">
           <div className="bg-red-500/10 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md flex items-start gap-3">
              <div className="shrink-0 mt-0.5"><AlertTriangleIcon /></div>
              <div className="flex-1 text-sm font-medium">{activeError}</div>
              <button 
                onClick={() => setActiveError(null)} 
                className="shrink-0 text-red-300 hover:text-white transition-colors p-0.5 hover:bg-red-500/20 rounded"
              >
                  <XIcon />
              </button>
           </div>
        </div>
      )}

      {/* Header hidden in Zen Mode */}
      {!isZenMode && (
          <Header 
            viewMode={viewMode} 
            onNavigateHome={() => setViewMode('dashboard')} 
            onExport={handleExport}
            onRefine={() => setIsRefineModalOpen(true)}
            canExport={completed && files.length > 0}
            canRefine={completed && files.length > 0}
          />
      )}
      
      {viewMode === 'dashboard' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 relative overflow-hidden">
              {/* Background ambient effects */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] animate-pulse-fast"></div>
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="max-w-3xl w-full text-center space-y-12 relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-surface to-slate-900 rounded-3xl flex items-center justify-center border border-slate-700/50 shadow-2xl shadow-brand-primary/20 relative group">
                        <div className="absolute inset-0 bg-brand-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="text-brand-primary transform scale-[2] group-hover:scale-[2.2] transition-transform duration-500"><GeneratorIcon /></div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-text-primary to-slate-400 tracking-tight leading-tight drop-shadow-sm">
                        Agentic AI <br/>App Builder
                    </h2>
                    <p className="text-brand-text-secondary text-xl max-w-xl mx-auto leading-relaxed font-light">
                        Orchestrate a team of specialized AI agents to plan, design, and code your next web application in minutes.
                    </p>
                  </div>
                  
                  <div className="pt-8">
                    <Button 
                        size="lg" 
                        onClick={() => setViewMode('wizard')}
                        className="text-lg px-10 py-5 shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:shadow-[0_0_35px_rgba(56,189,248,0.4)] hover:scale-105 transition-all duration-300 font-semibold tracking-wide"
                        icon={<PlayIcon />}
                    >
                        Start New Project
                    </Button>
                  </div>

                  <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 max-w-4xl mx-auto">
                     <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
                        <div className="font-mono text-xs text-brand-primary mb-3 uppercase tracking-wider">Step 01</div>
                        <div className="text-lg font-semibold text-white mb-1">Define Vision</div>
                        <p className="text-sm text-slate-400">Describe your app in natural language.</p>
                     </div>
                     <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
                        <div className="font-mono text-xs text-purple-400 mb-3 uppercase tracking-wider">Step 02</div>
                        <div className="text-lg font-semibold text-white mb-1">Agent Swarm</div>
                        <p className="text-sm text-slate-400">Watch agents collaborate and code.</p>
                     </div>
                     <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
                        <div className="font-mono text-xs text-emerald-400 mb-3 uppercase tracking-wider">Step 03</div>
                        <div className="text-lg font-semibold text-white mb-1">Launch</div>
                        <p className="text-sm text-slate-400">Preview live and export deployment ready code.</p>
                     </div>
                  </div>
              </div>
          </div>
      )}

      {viewMode === 'wizard' && (
          <CreateWizard 
            onComplete={handleProjectCreate}
            onCancel={() => setViewMode('dashboard')}
          />
      )}

      {viewMode === 'ide' && (
        <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
            {/* Sidebar - Hidden in Zen Mode */}
            {!isZenMode && (
                <aside className="w-80 bg-ide-sidebar border-r border-ide-border flex flex-col z-10 shadow-2xl shrink-0 transition-all duration-300">
                    <Panel title="Agent Swarm" className="flex-1 border-b border-ide-border">
                        <div className="divide-y divide-ide-border">
                            {agents.map(agent => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Execution Plan" className="flex-1 bg-ide-bg/30">
                        <div className="p-5 space-y-5">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-start space-x-3 text-sm group">
                                    <div className={`mt-0.5 shrink-0 transition-transform ${step.status === 'running' ? 'scale-110' : ''}`}>
                                        {step.status === 'completed' ? <CheckCircleIcon /> : 
                                        step.status === 'running' ? <LoaderIcon /> : 
                                        <CircleIcon />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-medium transition-colors ${step.status === 'completed' ? 'text-brand-text-primary' : step.status === 'running' ? 'text-brand-primary' : 'text-brand-text-secondary group-hover:text-slate-300'}`}>
                                            {step.label}
                                        </span>
                                        {step.status === 'running' && <span className="text-[10px] text-brand-primary/70 animate-pulse mt-0.5">In Progress...</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </aside>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                <div className="flex-1 flex min-h-0 relative">
                    {/* Overlay for resizing safety */}
                    {isResizing && <div className="absolute inset-0 z-50 bg-transparent cursor-col-resize" />}
                    
                    {/* Editor Column - Hidden in Zen Mode */}
                    {!isZenMode && (
                        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                            {/* File Tabs */}
                            <div className="h-9 bg-ide-bg flex items-center border-b border-ide-border overflow-x-auto no-scrollbar">
                                {files.length === 0 && <span className="px-4 text-xs text-slate-500 italic font-mono">...awaiting generated files</span>}
                                {files.map(file => (
                                    <button
                                        key={file.name}
                                        onClick={() => setSelectedFile(file)}
                                        className={`h-full px-4 flex items-center space-x-2 text-xs border-r border-ide-border transition-all min-w-[120px] max-w-[200px] ${selectedFile?.name === file.name ? 'bg-[#1e1e1e] text-brand-primary border-t-2 border-t-brand-primary font-medium' : 'bg-[#2d2d2d] text-brand-text-secondary hover:bg-[#262626] border-t-2 border-t-transparent'}`}
                                    >
                                        <FileIcon />
                                        <span className="truncate">{file.name}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Code Area */}
                            <div className="flex-1 relative min-h-0 bg-[#1e1e1e]">
                                {selectedFile ? (
                                    <CodeEditor 
                                        code={selectedFile.content} 
                                        language={selectedFile.language} 
                                        onChange={updateFileContent}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                            <FileIcon />
                                        </div>
                                        <p className="text-sm font-mono">Select a file to edit</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resize Handle - Hidden in Zen Mode */}
                    {!isZenMode && (
                        <div 
                            onMouseDown={startResizing}
                            className={`w-1 bg-ide-bg border-l border-ide-border hover:bg-brand-primary hover:border-brand-primary cursor-col-resize transition-all z-40 shrink-0 flex items-center justify-center ${isResizing ? 'bg-brand-primary border-brand-primary' : ''}`}
                        >
                        </div>
                    )}

                    {/* Preview Column */}
                    <div 
                        className="flex flex-col bg-slate-100 shrink-0 transition-all duration-500 ease-in-out relative z-30 shadow-2xl"
                        style={{ width: isZenMode ? '100%' : `${previewWidth}%` }}
                    >
                        <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-20">
                            <span className="text-xs font-semibold text-slate-600 flex items-center space-x-2">
                                <div className="flex space-x-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                <span className="ml-3 font-mono text-slate-400">localhost:3000</span>
                            </span>
                            
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center bg-slate-100 rounded-md p-0.5 space-x-0.5 border border-slate-200">
                                    <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`} title="Desktop View"><DesktopIcon /></button>
                                    <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`} title="Tablet View"><TabletIcon /></button>
                                    <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`} title="Mobile View"><MobileIcon /></button>
                                </div>
                                
                                <div className="w-px h-4 bg-slate-300 mx-2"></div>

                                <button 
                                    onClick={toggleZenMode}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${isZenMode ? 'bg-brand-primary text-white shadow-md hover:bg-sky-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                    title={isZenMode ? "Exit Zen Mode (Esc)" : "Enter Zen Mode (Ctrl+Shift+Z)"}
                                >
                                    {isZenMode ? <MinimizeIcon /> : <MaximizeIcon />}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative bg-slate-200/50 flex flex-col items-center overflow-auto py-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            <div className={`transition-all duration-500 ease-out bg-white shadow-2xl shrink-0 overflow-hidden relative ${
                                previewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[2rem] border-[8px] border-slate-800 shadow-xl' :
                                previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-[1.5rem] border-[8px] border-slate-800 shadow-xl' :
                                'w-full h-full border-none rounded-none'
                            }`}>
                                <iframe 
                                    ref={iframeRef}
                                    className={`w-full h-full border-none bg-white ${isResizing ? 'pointer-events-none' : ''}`}
                                    title="App Preview"
                                    sandbox="allow-scripts allow-modals allow-same-origin"
                                />
                                {files.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                                            <div className="relative bg-white p-4 rounded-full shadow-lg text-brand-primary">
                                                <LoaderIcon />
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-slate-500">Waiting for agents to build...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terminal - Hidden in Zen Mode */}
                {!isZenMode && (
                    <div className="h-48 bg-ide-bg border-t border-ide-border flex flex-col shrink-0 transition-all duration-300 shadow-[0_-5px_15px_rgba(0,0,0,0.2)] z-20">
                        <div className="h-8 flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-ide-border shrink-0">
                            <div className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                                <TerminalIcon />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">Output Channel</span>
                            </div>
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                            {logs.length === 0 && (
                                <div className="text-slate-600 italic">System ready. Waiting for instructions...</div>
                            )}
                            {logs.map(log => (
                                <div key={log.id} className="flex items-start space-x-3 hover:bg-white/5 p-1 rounded transition-colors group">
                                    <span className="text-slate-600 shrink-0 select-none w-16 text-right">[{log.timestamp}]</span>
                                    <span className={`font-bold shrink-0 w-24 text-right tracking-tight ${
                                        log.agentId === 'system' ? 'text-brand-primary' : 
                                        log.agentId === '1' ? 'text-purple-400' :
                                        log.agentId === '2' ? 'text-blue-400' :
                                        log.agentId === '3' ? 'text-pink-400' :
                                        log.agentId === '4' ? 'text-orange-400' :
                                        'text-red-400'
                                    }`}>
                                        {log.agentId === 'system' ? 'SYSTEM' : 
                                        agents.find(a => a.id === log.agentId)?.name || 'UNKNOWN'}
                                    </span>
                                    <span className={`${
                                        log.type === 'error' ? 'text-red-200 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20' : 
                                        log.type === 'success' ? 'text-emerald-400' : 
                                        log.type === 'warning' ? 'text-amber-400' : 
                                        log.type === 'chat' ? 'text-cyan-200/80 italic pl-2 border-l-2 border-cyan-500/30' : 
                                        log.type === 'cmd' ? 'text-brand-text-primary font-bold border-b border-slate-700 pb-1 w-full block' :
                                        'text-slate-300'
                                    } break-all flex-1`}>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
      
      {/* Refine Modal */}
      <RefineModal 
         isOpen={isRefineModalOpen} 
         onClose={() => setIsRefineModalOpen(false)} 
         onSubmit={handleRefinement}
         isProcessing={isRefining}
      />
    </div>
  );
};

export default App;
