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
          <li id="workspace-tab" class="sidebar-link active">
            <i data-lucide="monitor" style="width: 16px; height: 16px;"></i> Workspace
          </li>
          <li id="history-tab" class="sidebar-link">
            <i data-lucide="clock" style="width: 16px; height: 16px;"></i> History
          </li>
          <li id="interview-tab" class="sidebar-link">
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
          <select id="language-select" class="input-group language-select" style="margin: 0; padding: 0.25rem 0.5rem; width: 136px;">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button class="btn btn-outline" id="format-btn">Format</button>
        </div>
        <div class="toolbar-controls toolbar-divider-control">
          <label for="divider-range">Divider</label>
          <input id="divider-range" type="range" min="1" max="8" value="2" />
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
    const historyTab = container.querySelector('#history-tab');
    const interviewTab = container.querySelector('#interview-tab');
    const workspaceTab = container.querySelector('#workspace-tab');
    const dividerRange = container.querySelector('#divider-range');
    const mentorContent = container.querySelector('#mentor-content');
    const outputContent = container.querySelector('#output-content');

    const updateSidebarActive = (activeId) => {
      [workspaceTab, historyTab, interviewTab].forEach((tab) => {
        tab.classList.toggle('active', tab.id === activeId);
      });
    };

    const showWorkspaceView = () => {
      updateSidebarActive('workspace-tab');
      mentorContent.innerHTML = `
        <p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">
          Click "Submit to Mentor" to receive an AI evaluation of your code.
        </p>
      `;
      outputContent.textContent = 'Welcome to the AI Coding Mentor workspace! Select a language and start coding.';
    };

    const renderHistory = async () => {
      updateSidebarActive('history-tab');
      mentorContent.innerHTML = '<div class="panel-loading">Loading history...</div>';
      try {
        const submissions = await api.ai.history();
        if (!submissions.length) {
          mentorContent.innerHTML = '<p>No history found yet. Submit code to save feedback.</p>';
          return;
        }

        mentorContent.innerHTML = `
          <div class="history-list">
            <h3>Recent Activity</h3>
            ${submissions.map((item) => `
              <div class="history-item">
                <div class="history-meta">
                  <strong>${item.language.toUpperCase()}</strong>
                  <span>${new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div class="history-feedback">
                  <strong>Plagiarism Score:</strong> ${item.plagiarismScore}%
                </div>
                <details>
                  <summary>AI Feedback</summary>
                  <div class="history-code"><pre>${item.code.replace(/</g, '&lt;')}</pre></div>
                  <div class="history-response">${marked.parse(item.aiFeedback || 'No AI feedback available.')}</div>
                </details>
              </div>
            `).join('')}
          </div>
        `;
      } catch (err) {
        mentorContent.innerHTML = `<span style="color: var(--danger-color);">Failed to load history: ${err.message}</span>`;
      }
    };

    const showInterviewPanel = () => {
      updateSidebarActive('interview-tab');
      mentorContent.innerHTML = `
        <div class="interview-card">
          <div class="interview-status" id="interview-status">Press Start and speak into your microphone.</div>
          <div class="interview-controls">
            <button id="start-interview-btn" class="btn btn-primary">Start Interview</button>
            <button id="stop-interview-btn" class="btn btn-outline" disabled>Stop</button>
          </div>
          <div id="interview-transcript" class="interview-transcript"></div>
          <div id="interview-response" class="interview-response"></div>
        </div>
      `;

      const startBtn = container.querySelector('#start-interview-btn');
      const stopBtn = container.querySelector('#stop-interview-btn');
      const transcriptEl = container.querySelector('#interview-transcript');
      const responseEl = container.querySelector('#interview-response');
      const statusEl = container.querySelector('#interview-status');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        statusEl.textContent = 'Speech recognition is not available in this browser.';
        startBtn.disabled = true;
        return;
      }

      let recognition = null;
      let conversationHistory = [];

      const updateTranscript = (message, role) => {
        const line = document.createElement('div');
        line.className = `speaker-line speaker-${role}`;
        line.textContent = `${role === 'user' ? 'You:' : 'Interviewer:'} ${message}`;
        transcriptEl.appendChild(line);
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
      };

      const sendInterviewMessage = async (text) => {
        responseEl.innerHTML = '<div class="panel-loading">Listening... generating response...</div>';
        try {
          const aiResponse = await api.ai.interview({ transcript: text, language: langSelect.value, conversation: conversationHistory });
          conversationHistory.push({ role: 'assistant', content: aiResponse.response });
          responseEl.innerHTML = `<div class="ai-answer">${marked.parse(aiResponse.response)}</div>`;
        } catch (err) {
          responseEl.innerHTML = `<span style="color: var(--danger-color);">Interview AI error: ${err.message}</span>`;
        }
      };

      startBtn.addEventListener('click', () => {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        transcriptEl.innerHTML = '';
        responseEl.innerHTML = '';
        statusEl.textContent = 'Listening... speak clearly into your microphone.';
        startBtn.disabled = true;
        stopBtn.disabled = false;

        recognition.onresult = async (event) => {
          const spokenText = Array.from(event.results)
            .slice(event.resultIndex)
            .map(result => result[0].transcript)
            .join(' ')
            .trim();

          if (!spokenText) return;
          conversationHistory.push({ role: 'user', content: spokenText });
          updateTranscript(spokenText, 'user');
          await sendInterviewMessage(spokenText);
        };

        recognition.onerror = (event) => {
          statusEl.textContent = `Speech error: ${event.error}`;
          recognition.stop();
          startBtn.disabled = false;
          stopBtn.disabled = true;
        };

        recognition.onend = () => {
          statusEl.textContent = 'Interview paused. Press Start to continue or stop to end.';
          startBtn.disabled = false;
          stopBtn.disabled = true;
        };

        recognition.start();
      });

      stopBtn.addEventListener('click', () => {
        if (recognition) {
          recognition.stop();
          statusEl.textContent = 'Interview stopped. You can press Start again to continue.';
          stopBtn.disabled = true;
          startBtn.disabled = false;
        }
      });
    };

    const setDivider = (value) => {
      container.style.setProperty('--section-divider', `${value}px`);
    };

    langSelect.addEventListener('change', (e) => {
      monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
    });

    dividerRange.addEventListener('input', (e) => {
      setDivider(e.target.value);
    });

    historyTab.addEventListener('click', renderHistory);
    interviewTab.addEventListener('click', showInterviewPanel);
    workspaceTab.addEventListener('click', showWorkspaceView);

    setDivider(dividerRange.value);

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
