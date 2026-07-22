import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Authentication APIs =====
export const authAPI = {
  login: (username, password) =>
    api.post('/users/login', { username, password }),
  
  register: (data) =>
    api.post('/users/register/new', data),
  
  getProfile: () =>
    api.get('/users/profile'),
  
  getProfileMe: () =>
    api.get('/users/profile/me'),
  
  updateProfile: (data) =>
    api.put('/users/profile/update', data),
  
  changePassword: (userId, oldPassword, newPassword) =>
    api.post(`/users/${userId}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    }),

  getPendingRegistrations: () =>
    api.get('/users/registrations/pending'),

  approveRegistration: (registrationId, deptId) =>
    api.post(`/users/registrations/${registrationId}/approve`, { dept_id: deptId }),

  rejectRegistration: (registrationId, notes) =>
    api.post(`/users/registrations/${registrationId}/reject`, { approval_notes: notes }),
    
  getAdmins: () =>
    api.get('/users/admins')
};

// ===== Department APIs =====
export const departmentAPI = {
  getAll: () =>
    api.get('/departments'),
  
  getById: (id) =>
    api.get(`/departments/${id}`),
  
  create: (data) =>
    api.post('/departments', data),
  
  update: (id, data) =>
    api.put(`/departments/${id}`, data),
  
  delete: (id) =>
    api.delete(`/departments/${id}`)
};

// ===== Asset APIs =====
export const assetAPI = {
  getAll: (filters) =>
    api.get('/assets', { params: filters }),
  
  getById: (id) =>
    api.get(`/assets/${id}`),
  
  create: (data) =>
    api.post('/assets', data),
  
  update: (id, data) =>
    api.put(`/assets/${id}`, data),
  
  addPart: (assetId, partData) =>
    api.post(`/assets/${assetId}/parts`, partData),
  
  getStats: () =>
    api.get('/assets/stats/summary')
};

// ===== Repair APIs =====
export const assetAnalysisAPI = {
  getDuplicates: () =>
    api.get('/asset-analysis/duplicates')
};

export const repairAPI = {
  getAll: (filters) =>
    api.get('/repairs', { params: filters }),
  
  getById: (id) =>
    api.get(`/repairs/${id}`),
  
  create: (data) =>
    api.post('/repairs', data),  // CORRECTED: '/repairs' not '/repairstest'
  
  updateStatus: (id, data) =>
    api.put(`/repairs/${id}/status`, data),
  
  getStats: () =>
    api.get('/repairs/stats/summary')
};

// ===== Inspection APIs =====
export const inspectionAPI = {
  getAll: () =>
    api.get('/inspections'),
  
  getByRepairId: (repairId) =>
    api.get(`/inspections/repair/${repairId}`),
  
  create: (data) =>
    api.post('/inspections', data),
  
  update: (id, data) =>
    api.put(`/inspections/${id}`, data)
};

// ===== Approval APIs =====
export const approvalAPI = {
  getAll: () =>
    api.get('/approvals'),
  
  getPending: () =>
    api.get('/approvals/pending'),
  
  getByRepairId: (repairId) =>
    api.get(`/approvals/repair/${repairId}`),
  
  createPRO05: (data) =>
    api.post('/approvals/pro05', data),
  
  createDecision: (data) =>
    api.post('/approvals/decision', data),
  
  update: (id, data) =>
    api.put(`/approvals/${id}`, data)
};

// ===== User APIs =====
export const userAPI = {
  getAll: () =>
    api.get('/users'),
  
  create: (data) =>
    api.post('/users', data),
  
  update: (id, data) =>
    api.put(`/users/${id}`, data),
  
  deactivate: (id) =>
    api.put(`/users/${id}/deactivate`)
};

// ===== Profile APIs =====
export const profileAPI = {
  getProfile: () =>
    api.get('/users/profile/me'),
  
  updateProfile: (data) =>
    api.put('/users/profile/update', data),
  
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.post('/users/profile/upload-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  deletePicture: () =>
    api.delete('/users/profile/picture'),
  
  changePassword: (data) =>
    api.post('/users/profile/change-password', data),
  
  getSettings: () =>
    api.get('/users/settings'),
  
  updateSettings: (data) =>
    api.put('/users/settings', data),
  
  getTheme: () =>
    api.get('/users/theme'),
  
  updateTheme: (theme) =>
    api.put('/users/theme', { theme }),
  
  deleteAccount: (confirmPassword) =>
    api.delete('/users/account', { data: { confirmPassword } })
};

// ===== Message APIs =====
export const messageAPI = {
  getConversations: () =>
    api.get('/messages/conversations/all'),
  
  getMessages: (conversationId) =>
    api.get(`/messages/${conversationId}`),
  
  sendMessage: (data) =>
    api.post('/messages/messages/send', data),
  
  deleteMessage: (messageId) =>
    api.delete(`/messages/messages/${messageId}`),
  
  getUnreadCount: () =>
    api.get('/messages/unread/count')
};

export default api;