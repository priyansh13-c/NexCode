const API_URL = 'http://localhost:5000/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  auth: {
    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    register: (userData) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    getMe: () => api.request('/auth/me', {
      method: 'GET',
    }),
  },
  code: {
    execute: (data) => api.request('/code/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  ai: {
    evaluate: (data) => api.request('/ai/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    history: () => api.request('/ai/history', {
      method: 'GET',
    }),
    interview: (data) => api.request('/ai/interview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  }
};
