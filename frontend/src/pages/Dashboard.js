import * as monaco from 'monaco-editor';
import { marked } from 'marked';
import { createIcons, Moon, Sun, Monitor, Clock, Bot, Play, Sparkles } from 'lucide';
import { api } from '../utils/api.js';

export function DashboardPage(renderApp) {
  const container = document.createElement('div');
  container.className = 'dashboard-container';

  container.innerHTML = `
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <span>AI Coding Mentor</span>
        <button id="theme-toggle" class="btn btn-outline" style="padding: 0.25rem 0.5rem; display: flex; align-items: center; justify-content: center;">
          <i data-lucide="moon" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
      <div class="sidebar-content">
        <h4 style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">MENU</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem;">
          <li style="padding: 0.5rem; cursor: pointer; border-radius: 0.25rem; background: var(--border-color); font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="monitor" style="width: 16px; height: 16px;"></i> Workspace
          </li>
          <li style="padding: 0.5rem; cursor: pointer; border-radius: 0.25rem; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="clock" style="width: 16px; height: 16px;"></i> History
          </li>
          <li style="padding: 0.5rem; cursor: pointer; border-radius: 0.25rem; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="bot" style="width: 16px; height: 16px;"></i> Mock Interview
          </li>
        </ul>
      </div>
      <div style="padding: 1rem; border-top: 1px solid var(--border-color);">
        <button id="logout-btn" class="btn btn-outline" style="width: 100%;">Logout</button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="main-workspace">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-controls">
          <select id="language-select" class="input-group" style="margin: 0; padding: 0.25rem 0.5rem; width: 120px;">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button class="btn btn-outline" id="format-btn">Format</button>
        </div>
        <div class="toolbar-controls">
          <button class="btn btn-outline" id="run-btn" style="color: #10b981; border-color: #10b981; display: flex; align-items: center; gap: 0.25rem;">
            <i data-lucide="play" style="width: 16px; height: 16px;"></i> Run
          </button>
          <button class="btn btn-primary" id="submit-btn" style="display: flex; align-items: center; gap: 0.25rem;">
            <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i> Submit to Mentor
          </button>
        </div>
      </div>

      <!-- Editor -->
      <div id="editor-container" class="editor-container"></div>

      <!-- Output Panel -->
      <div class="output-panel">
        <div class="output-header">
          <span>Console Output</span>
          <button class="btn btn-outline" id="clear-console-btn" style="padding: 0.1rem 0.5rem; font-size: 0.75rem;">Clear</button>
        </div>
        <div id="output-content" class="output-content">Welcome to the AI Coding Mentor workspace! Select a language and start coding.</div>
      </div>
    </div>

    <!-- AI Mentor Panel -->
    <div class="mentor-panel">
      <div class="mentor-header" style="display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="bot" style="width: 18px; height: 18px; color: var(--primary-color);"></i> AI Mentor Feedback
      </div>
      <div id="mentor-content" class="mentor-content">
        <p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">
          Click "Submit to Mentor" to receive an AI evaluation of your code.
        </p>
      </div>
    </div>
  `;

  // Initialize Lucide icons
  createIcons({
    icons: { Moon, Sun, Monitor, Clock, Bot, Play, Sparkles },
    nameAttr: 'data-lucide',
    root: container
  });

  const logoutBtn = container.querySelector('#logout-btn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    renderApp();
  });

  const themeToggle = container.querySelector('#theme-toggle');
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    
    // Update theme toggle icon
    themeToggle.innerHTML = isDark ? '<i data-lucide="moon" style="width: 16px; height: 16px;"></i>' : '<i data-lucide="sun" style="width: 16px; height: 16px;"></i>';
    createIcons({
      icons: { Moon, Sun },
      nameAttr: 'data-lucide',
      root: themeToggle
    });

    if (editor) {
      monaco.editor.setTheme(isDark ? 'vs' : 'vs-dark');
    }
  });

  // Editor initialization
  let editor = null;
  setTimeout(() => {
    const editorEl = container.querySelector('#editor-container');
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    
    editor = monaco.editor.create(editorEl, {
      value: '// Write your code here\\nconsole.log("Hello World!");',
      language: 'javascript',
      theme: isDark ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'Inter', monospace",
    });

    const langSelect = container.querySelector('#language-select');
    langSelect.addEventListener('change', (e) => {
      monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
    });

    container.querySelector('#format-btn').addEventListener('click', () => {
      editor.getAction('editor.action.formatDocument').run();
    });

    container.querySelector('#clear-console-btn').addEventListener('click', () => {
      container.querySelector('#output-content').textContent = '';
    });
    
    container.querySelector('#run-btn').addEventListener('click', async () => {
      const outputContent = container.querySelector('#output-content');
      outputContent.textContent = 'Executing...';
      
      try {
        const language = langSelect.value;
        const sourceCode = editor.getValue();
        
        const result = await api.code.execute({ language, sourceCode });
        
        if (result.stderr) {
          outputContent.innerHTML = `<span style="color: var(--danger-color);">${result.stderr}</span>`;
        } else {
          outputContent.textContent = result.stdout || 'Program exited with no output.';
        }
      } catch (err) {
        outputContent.innerHTML = `<span style="color: var(--danger-color);">Error: ${err.message}</span>`;
      }
    });

    container.querySelector('#submit-btn').addEventListener('click', async () => {
      const mentorContent = container.querySelector('#mentor-content');
      mentorContent.innerHTML = '<div style="text-align: center; margin-top: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"><i data-lucide="sparkles" style="width: 24px; height: 24px; color: var(--primary-color);"></i> Evaluating your code...</div>';
      createIcons({ icons: { Sparkles }, nameAttr: 'data-lucide', root: mentorContent });
      
      try {
        const language = langSelect.value;
        const sourceCode = editor.getValue();
        
        const result = await api.ai.evaluate({ language, sourceCode });
        mentorContent.innerHTML = marked.parse(result.feedback);
      } catch (err) {
        mentorContent.innerHTML = `<span style="color: var(--danger-color);">AI Mentor Error: ${err.message}</span>`;
      }
    });
  }, 0);

  return container;
}
