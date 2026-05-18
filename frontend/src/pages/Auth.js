import { api } from '../utils/api.js';

export function AuthPage(renderApp) {
  const container = document.createElement('div');
  container.className = 'auth-container';

  let isLogin = true;
  let isLoading = false;

  function render() {
    container.innerHTML = `
      <div class="auth-card">
        <h2>${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <div id="error-message" class="auth-error" style="display: none;"></div>
        
        <form id="auth-form">
          ${!isLogin ? `
            <div class="input-group">
              <label for="username">Username</label>
              <input type="text" id="username" required placeholder="Enter username" />
            </div>
          ` : ''}
          
          <div class="input-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" required placeholder="you@example.com" />
          </div>
          
          <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="••••••••" />
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" ${isLoading ? 'disabled' : ''}>
            ${isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div class="toggle-auth">
          ${isLogin ? "Don't have an account? " : "Already have an account? "}
          <a id="toggle-mode">${isLogin ? 'Sign up' : 'Sign in'}</a>
        </div>
      </div>
    `;

    // Attach Event Listeners
    const form = container.querySelector('#auth-form');
    const toggleBtn = container.querySelector('#toggle-mode');
    const errorEl = container.querySelector('#error-message');

    toggleBtn.addEventListener('click', () => {
      isLogin = !isLogin;
      render();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.style.display = 'none';
      
      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;
      const username = !isLogin ? form.querySelector('#username').value : null;

      isLoading = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      try {
        let res;
        if (isLogin) {
          res = await api.auth.login({ email, password });
        } else {
          res = await api.auth.register({ username, email, password });
        }

        // Store token
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        
        // Re-render entire app
        renderApp();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        isLoading = false;
        submitBtn.textContent = isLogin ? 'Sign In' : 'Sign Up';
        submitBtn.disabled = false;
      }
    });
  }

  // Initial render
  render();

  return container;
}
