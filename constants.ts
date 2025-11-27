
import { Agent, File, ExecutionStep } from './types';

export const INITIAL_AGENTS: Agent[] = [
  { id: '1', name: 'Atlas', role: 'planner', status: 'idle', message: 'Ready to plan.' },
  { id: '2', name: 'Nexus', role: 'architect', status: 'idle', message: 'Standing by.' },
  { id: '3', name: 'Pixel', role: 'designer', status: 'idle', message: 'Awaiting specs.' },
  { id: '4', name: 'Spark', role: 'engineer', status: 'idle', message: 'Ready to code.' },
  { id: '5', name: 'Bugsy', role: 'qa', status: 'idle', message: 'Tests ready.' },
];

export const INITIAL_STEPS: ExecutionStep[] = [
  { id: 1, label: 'Analyze Requirements', status: 'pending' },
  { id: 2, label: 'Design Architecture', status: 'pending' },
  { id: 3, label: 'Scaffold Project', status: 'pending' },
  { id: 4, label: 'Generate UI Assets', status: 'pending' },
  { id: 5, label: 'Implement Logic', status: 'pending' },
  { id: 6, label: 'Verify & Deploy', status: 'pending' },
];

export const AGENT_PROMPTS = {
  CODER: `You are an expert full-stack developer. 
CRITICAL DIRECTIVE: If you encounter any ambiguity in the requirements or architecture (e.g., missing persistence strategy, undefined API endpoints), DO NOT guess. 
Instead, output a JSON object with type "clarification_request" specifying the question and the target agent (usually the Architect).`,
  
  ARCHITECT: `You are a software architect. You may receive clarification requests from other agents. 
When answering:
1. Be direct and concise.
2. Reference the original project intent.
3. Provide a definitive technical decision.`
};

export const DEMO_FILES: File[] = [
  {
    name: 'README.md',
    language: 'markdown',
    content: `# TaskMaster 2.0

## Overview
A high-performance, responsive task management application built with vanilla JavaScript and CSS Grid.

## Features
- ✨ Real-time task addition
- 🗑️ Task deletion with animation
- 🎨 Beautiful glassmorphism UI
- 💾 LocalStorage persistence
- 📱 Fully mobile responsive

## Setup
Simply open index.html in any modern browser. No build step required.`
  },
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskMaster Pro</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="background-gradient"></div>
    <div class="app-wrapper">
        <header class="app-header">
            <div class="logo-area">
                <div class="logo-icon">✓</div>
                <h1>TaskMaster</h1>
            </div>
            <div class="status-pill">
                <span id="taskCount">0</span> tasks
            </div>
        </header>
        
        <main>
            <div class="input-container">
                <input type="text" id="taskInput" placeholder="What needs to be done?" autocomplete="off">
                <button id="addBtn" aria-label="Add Task">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            <ul id="taskList" class="task-list">
                <!-- Tasks injected via JS -->
            </ul>
            
            <div id="emptyState" class="empty-state">
                <p>All caught up! 🎉</p>
                <span>Add a task to get started</span>
            </div>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>`
  },
  {
    name: 'style.css',
    language: 'css',
    content: `:root {
    --primary: #8b5cf6;
    --primary-hover: #7c3aed;
    --bg-dark: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.7);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --border: rgba(255, 255, 255, 0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.background-gradient {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, #312e81, transparent 40%),
                radial-gradient(circle at bottom left, #4c1d95, transparent 40%);
    z-index: -1;
}

.app-wrapper {
    width: 100%;
    max-width: 420px;
    height: 85vh;
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.logo-area { display: flex; align-items: center; gap: 0.75rem; }
.logo-icon {
    width: 32px; height: 32px;
    background: var(--primary);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold;
}
h1 { font-size: 1.25rem; font-weight: 600; }

.status-pill {
    background: rgba(255,255,255,0.05);
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.input-container {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

input {
    flex: 1;
    background: rgba(0,0,0,0.2);
    border: 1px solid var(--border);
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
}
input:focus { border-color: var(--primary); background: rgba(0,0,0,0.3); }

button#addBtn {
    background: var(--primary);
    border: none;
    width: 48px;
    border-radius: 12px;
    color: white;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
}
button#addBtn:hover { background: var(--primary-hover); }

.task-list {
    list-style: none;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}
.task-list::-webkit-scrollbar { width: 4px; }
.task-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.task-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
    margin-bottom: 0.75rem;
    border: 1px solid transparent;
    transition: all 0.2s;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.task-item:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-1px); }

@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.checkbox {
    width: 20px; height: 20px;
    border: 2px solid var(--text-muted);
    border-radius: 6px;
    margin-right: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}
.task-item.completed .checkbox {
    background: var(--accent-success);
    border-color: var(--accent-success);
}
.task-item.completed span {
    text-decoration: line-through;
    color: var(--text-muted);
}

.delete-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    opacity: 0;
    transition: all 0.2s;
}
.task-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { color: #ef4444; }

.empty-state {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    text-align: center;
}
.empty-state p { font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--text-main); }
.empty-state span { font-size: 0.85rem; }
`
  },
  {
    name: 'app.js',
    language: 'javascript',
    content: `const state = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || []
};

const dom = {
    input: document.getElementById('taskInput'),
    addBtn: document.getElementById('addBtn'),
    list: document.getElementById('taskList'),
    empty: document.getElementById('emptyState'),
    count: document.getElementById('taskCount')
};

function save() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    render();
}

function createTask(text) {
    return { id: Date.now(), text, completed: false };
}

function addTask() {
    const text = dom.input.value.trim();
    if (!text) return;
    state.tasks.unshift(createTask(text));
    dom.input.value = '';
    save();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        save();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
}

function render() {
    dom.list.innerHTML = '';
    dom.count.textContent = state.tasks.length;
    
    if (state.tasks.length === 0) {
        dom.empty.style.display = 'flex';
    } else {
        dom.empty.style.display = 'none';
        state.tasks.forEach(task => {
            const el = document.createElement('li');
            el.className = \`task-item \${task.completed ? 'completed' : ''}\`;
            el.innerHTML = \`
                <div class="checkbox" onclick="window.app.toggle(\${task.id})"></div>
                <span>\${task.text}</span>
                <button class="delete-btn" onclick="window.app.del(\${task.id})">×</button>
            \`;
            dom.list.appendChild(el);
        });
    }
}

// Expose methods for inline handlers
window.app = {
    toggle: toggleTask,
    del: deleteTask
};

dom.addBtn.addEventListener('click', addTask);
dom.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

render();`
  }
];
