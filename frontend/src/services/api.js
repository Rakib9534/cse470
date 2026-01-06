// API service connecting to backend server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (error) {
      return null;
    }
  }
  return null;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If response is not JSON, create error object
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      // Create error with message from response
      const error = new Error(data.message || data.error || 'API request failed');
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Re-throw with more context
    if (error.message) {
      throw error;
    }
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

// Appointment API
const appointmentAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.email) queryParams.append('email', filters.email);
      if (filters.doctorId) queryParams.append('doctorId', filters.doctorId);
      if (filters.status) queryParams.append('status', filters.status);

      const queryString = queryParams.toString();
      const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(endpoint, { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('appointments');
      return {
        success: false,
        data: saved ? JSON.parse(saved) : [],
        error: error.message
      };
    }
  },

  create: async (appointmentData) => {
    try {
      const response = await apiCall('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await apiCall(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      await apiCall(`/appointments/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Doctor Slots API
const doctorSlotsAPI = {
  getSlots: async (doctorId, date) => {
    try {
      const response = await apiCall(`/doctor-slots/${doctorId}/${date}`, {
        method: 'GET'
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Fallback to default slots
      const defaultSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00'
      ];
      return {
        success: false,
        data: { availableSlots: defaultSlots, bookedSlots: [] },
        error: error.message
      };
    }
  },
  updateSlots: async (doctorId, date, availableSlots) => {
    try {
      const response = await apiCall(`/doctor-slots/${doctorId}/${date}`, {
        method: 'PUT',
        body: JSON.stringify({ availableSlots })
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error updating slots:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Lab Results API
const labResultAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.email) queryParams.append('email', filters.email);

      const queryString = queryParams.toString();
      const endpoint = `/lab-results${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(endpoint, { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching lab results:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  create: async (labResultData) => {
    try {
      const response = await apiCall('/lab-results', {
        method: 'POST',
        body: JSON.stringify(labResultData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error creating lab result:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Treatment API
const treatmentAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.email) queryParams.append('email', filters.email);
      if (filters.doctorId) queryParams.append('doctorId', filters.doctorId);

      const queryString = queryParams.toString();
      const endpoint = `/treatments${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(endpoint, { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  create: async (treatmentData) => {
    try {
      const response = await apiCall('/treatments', {
        method: 'POST',
        body: JSON.stringify(treatmentData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error creating treatment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Equipment API
const equipmentAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);

      const queryString = queryParams.toString();
      const endpoint = `/equipment${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(endpoint, { method: 'GET' });
      // Handle response structure: { success: true, data: [...] } or direct array
      const equipmentData = response.data || (Array.isArray(response) ? response : []);
      return {
        success: true,
        data: equipmentData
      };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  create: async (equipmentData) => {
    try {
      const response = await apiCall('/equipment', {
        method: 'POST',
        body: JSON.stringify(equipmentData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error creating equipment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await apiCall(`/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error updating equipment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  book: async (id, bookingData) => {
    try {
      const response = await apiCall(`/equipment/${id}/book`, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error booking equipment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Bill API
const billAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.email) queryParams.append('email', filters.email);
      if (filters.status) queryParams.append('status', filters.status);

      const queryString = queryParams.toString();
      const endpoint = `/bills${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(endpoint, { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching bills:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  create: async (billData) => {
    try {
      const response = await apiCall('/bills', {
        method: 'POST',
        body: JSON.stringify(billData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error creating bill:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await apiCall(`/bills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error updating bill:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// User API (for authentication)
const userAPI = {
  register: async (userData) => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      // Backend returns { success: true, data: {...} } format
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      
      // Extract error message from response if available
      let errorMessage = 'Registration failed. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage += 'Cannot connect to server. Please ensure the backend server is running on http://localhost:5000';
      } else {
        errorMessage += 'Please check your connection and ensure MongoDB is running.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  login: async (email, password, role) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error logging in:', error);
      // Extract error message from response
      let errorMessage = error.message;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on http://localhost:5000';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.role) queryParams.append('role', filters.role);

      const queryString = queryParams.toString();
      const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiCall(endpoint, { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await apiCall(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiCall(`/users/${id}`, {
        method: 'DELETE'
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Doctor API
const doctorAPI = {
  getAll: async () => {
    try {
      const response = await apiCall('/users/doctors', { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
};

// Notification API
const notificationAPI = {
  getAll: async () => {
    try {
      const response = await apiCall('/notifications', { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiCall('/notifications/unread-count', { method: 'GET' });
      return {
        success: true,
        count: response.count || 0
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        count: 0,
        error: error.message
      };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await apiCall(`/notifications/${id}/read`, {
        method: 'PUT'
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiCall('/notifications/read-all', {
        method: 'PUT'
      });
      return {
        success: true
      };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  create: async (notificationData) => {
    try {
      const response = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  delete: async (id) => {
    try {
      await apiCall(`/notifications/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Reminder API
const reminderAPI = {
  getUpcoming: async () => {
    try {
      const response = await apiCall('/reminders/upcoming', { method: 'GET' });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
};

export { appointmentAPI, doctorSlotsAPI, labResultAPI, treatmentAPI, equipmentAPI, billAPI, userAPI, doctorAPI, notificationAPI, reminderAPI };
