import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== Request Interceptor ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== Response Interceptor ====================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== FILE API ====================
const fileAPI = {
  getFiles: async () => {
    try {
      const response = await api.get('/api/files');
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  uploadFiles: async (formData) => {
    try {
      if (!(formData instanceof FormData)) {
        throw new Error('Invalid form data format');
      }
      
      const response = await api.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  downloadFile: async (fileId, fileName) => {
    try {
      const response = await api.get(`/api/files/${fileId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  login: (data) => api.post("/api/auth/login", data),
  signup: (data) => api.post("/api/auth/signup", data),
  logout: () => api.post("/api/auth/logout"),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, password, confirmPassword) => api.post("/api/reset-password", { token, password, confirmPassword }),
  getCurrentUser: () => api.get("/api/auth/me"),
};

// ==================== TEAM API ====================
export const teamAPI = {
  sendInvites: async ({ emails, role = 'member', name }) => {
    try {
      if (!emails || !Array.isArray(emails)) {
        throw new Error('Emails must be provided as an array');
      }

      const validEmails = emails
        .map(email => typeof email === 'string' ? email.trim() : '')
        .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

      if (validEmails.length === 0) {
        throw new Error('At least one valid email is required');
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new Error('Name is required');
      }

      const response = await api.post("/api/send-invites", {
        emails: validEmails,
        role: ['member', 'manager', 'admin'].includes(role) ? role : 'member',
        name: name.trim()
      });

      const data = response.data || {};
      if (!data.success && !data.failedCount && !data.successfulInvites && !data.failedInvites) {
        throw new Error(data.message || 'Unexpected response from server');
      }

      return {
        success: data.success || false,
        successfulInvites: data.successfulInvites || [],
        failedCount: data.failedCount || 0,
        failedInvites: data.failedInvites || [],
        message: data.message || 'Invitation process completed'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.details || 
                          error.message || 
                          'Failed to send invitations';
      console.error('Send invites error:', error);
      return {
        success: false,
        successfulInvites: [],
        failedCount: 0,
        failedInvites: [],
        message: errorMessage
      };
    }
  },

  acceptInvite: async ({ name, password, token }) => {
    try {
      if (!name || !password || !token) {
        throw new Error('Name, password, and token are required');
      }

      const response = await api.post("/api/accept-invite", {
        name,
        password,
        token
      });

      return response.data;
    } catch (error) {
      console.error('Accept invite error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getInvitations: async () => {
    try {
      const response = await api.get("/api/team/invitations");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invitations');
    }
  },
  getTeamMembers: async () => {
    try {
      const response = await api.get("/api/team/members");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team members');
    }
  }
};


// ==================== CALENDAR API ====================
export const calendarAPI = {
  getCalendarEvents: () => api.get("/api/calendar-events").then(res => res.data),
  
  createAgenda: (data) => api.post("/api/agendas", data).then(res => res.data),
  
  getAgendas: (params = {}) => api.get("/api/agendas", { params }).then(res => res.data),
  
  getAgendaById: (id) => api.get(`/api/agendas/${id}`).then(res => res.data),
  
  updateAgenda: (id, data) => api.patch(`/api/agendas/${id}`, data).then(res => res.data),
  
  deleteAgenda: (id) => api.delete(`/api/agendas/${id}`).then(res => res.data),
  
  getAgendasByDateRange: (startDate, endDate) => 
    api.get("/api/agendas/range", { 
      params: { startDate, endDate } 
    }).then(res => res.data)
};

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getAnalyticsData: () => api.get("/api/analytics-data").then(res => res.data),
};

// ==================== TASK API ====================
const taskAPI = {
  getAllTasks: async (filters = {}) => {
    try {
      const response = await api.get('/tasks', {
        params: {
          search: filters.searchTerm,
          status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
          priority: filters.priorityFilter !== 'all' ? filters.priorityFilter : undefined,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      let response;
      if (taskData.isBlockchain) {
        response = await api.post('/createTask', { content: taskData.title });
        const dbResponse = await api.post('/createTasks', {
          ...taskData,
          txHash: response.data.txHash
        });
        return dbResponse.data;
      } else {
        response = await api.post('/tasks', taskData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await api.patch(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },

  getBlockchainTask: async (txHash) => {
    try {
      const response = await api.get(`/blockchain/tasks/${txHash}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blockchain task ${txHash}:`, error);
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id} status:`, error);
      throw error;
    }
  },

  bulkUpdateTasks: async (taskIds, updates) => {
    try {
      const response = await api.patch('/tasks/bulk-update', { taskIds, updates });
      return response.data;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }
};

// ==================== EXPORTS ====================
export { taskAPI, fileAPI };
export default api;