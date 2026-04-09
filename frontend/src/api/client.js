import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor: attach JWT token ────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('isp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 auto-logout ────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login')
        || requestUrl.includes('/admin-auth/login')
        || requestUrl.includes('/auth/forgot-password')
        || requestUrl.includes('/auth/reset-password')
        || requestUrl.includes('/admin-auth/forgot-password')
        || requestUrl.includes('/admin-auth/reset-password');

      if (!isAuthRequest) {
        const savedUser = JSON.parse(localStorage.getItem('isp_user') || 'null');
        const role = savedUser?.role;
        localStorage.removeItem('isp_token');
        localStorage.removeItem('isp_user');
        window.location.href = role === 'ADMIN' ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  adminLogin: (data) => api.post('/admin-auth/login', data),
  getAdminMe: () => api.get('/admin-auth/me'),
  adminForgotPassword: (data) => api.post('/admin-auth/forgot-password', data),
  adminResetPassword: (data) => api.post('/admin-auth/reset-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const chatAPI = {
  send: (data) => api.post('/chat', data),
};

export const adminAPI = {
  // Leaderboard
  getStudentLeaderboard: () => api.get('/admin/leaderboard'),

  // Aptitude Questions
  getAptitudeQuestions: () => api.get('/admin/questions/aptitude'),
  createAptitudeQuestion: (data) => api.post('/admin/questions/aptitude', data),
  updateAptitudeQuestion: (id, data) => api.put(`/admin/questions/aptitude/${id}`, data),
  deleteAptitudeQuestion: (id) => api.delete(`/admin/questions/aptitude/${id}`),
  clearAptitudeQuestions: () => api.delete('/admin/questions/aptitude'),
  generateAIQuestion: (topic, difficulty) => api.post('/admin/questions/aptitude/generate-ai', { topic, difficulty }),

  // Technical Questions
  getTechnicalQuestions: () => api.get('/admin/questions/technical'),
  createTechnicalQuestion: (data) => api.post('/admin/questions/technical', data),
  updateTechnicalQuestion: (id, data) => api.put(`/admin/questions/technical/${id}`, data),
  deleteTechnicalQuestion: (id) => api.delete(`/admin/questions/technical/${id}`),
  clearTechnicalQuestions: () => api.delete('/admin/questions/technical'),

  // Behavioral Questions
  getBehavioralQuestions: () => api.get('/admin/questions/behavioral'),
  createBehavioralQuestion: (data) => api.post('/admin/questions/behavioral', data),
  updateBehavioralQuestion: (id, data) => api.put(`/admin/questions/behavioral/${id}`, data),
  deleteBehavioralQuestion: (id) => api.delete(`/admin/questions/behavioral/${id}`),
  clearBehavioralQuestions: () => api.delete('/admin/questions/behavioral'),

  // Legacy
  addQuestion: (data) => api.post('/admin/questions', data),
  getSubmissions: () => api.get('/admin/submissions'),
  getBehavioralSubmissions: () => api.get('/admin/behavioral-submissions'),

  // Comments / feedback
  getComments: (candidateId, roundType) => api.get(`/comments?candidateId=${encodeURIComponent(candidateId)}&roundType=${encodeURIComponent(roundType)}`),
  addComment: (data) => api.post('/comments', data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

// ─── Aptitude API ─────────────────────────────────────────────
export const aptitudeAPI = {
  getQuestions: () => api.get('/aptitude/questions'),
  submit: (data) => api.post('/aptitude/submit', data),
};

// ─── Technical API ────────────────────────────────────────────
export const technicalAPI = {
  getProblems: () => api.get('/technical/problems'),
  runCode: (data) => api.post('/technical/run', data),
  submitAll: (data) => api.post('/technical/submit', data),
  evaluateCode: (data) => api.post('/user/evaluate', data),
};

export const userAPI = {
  uploadResume: (formData) => api.post('/user/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResume: () => api.get('/user/resume'),
  downloadResume: () => api.get('/user/resume/download', { responseType: 'blob' }),
};

// ─── Behavioral API ───────────────────────────────────────────
export const behavioralAPI = {
  getQuestions: () => api.get('/behavioral/questions'),
  submit: (data) => api.post('/behavioral/submit', data),
  submitVideo: (formData, onUploadProgress) => api.post('/user/behavioral-submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  }),
};

// ─── Leaderboard API ──────────────────────────────────────────
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
};

export default api;
