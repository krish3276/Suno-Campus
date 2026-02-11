// API Base URL - Update this based on your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, try to get text
      const text = await response.text();
      data = { message: text || 'Server error' };
    }

    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
    }
    
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register new student
  register: async (data) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (credentials) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token and user data
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },

  // Logout
  logout: async () => {
    const response = await apiCall('/auth/logout', {
      method: 'POST',
    });
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiCall(`/auth/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    // Store token and user data if verification successful
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Resend OTP
  resendOTP: async (email) => {
    return apiCall('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// Posts API
export const postsAPI = {
  // Get posts by scope
  getPosts: async (scope = 'campus', search = '') => {
    const queryParams = new URLSearchParams({ scope });
    if (search) queryParams.append('search', search);
    return apiCall(`/posts?${queryParams.toString()}`);
  },

  // Create a new post
  createPost: async (postData) => {
    return apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Like a post
  likePost: async (postId) => {
    return apiCall(`/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // Unlike a post
  unlikePost: async (postId) => {
    return apiCall(`/posts/${postId}/unlike`, {
      method: 'POST',
    });
  },

  // Get comments for a post
  getComments: async (postId) => {
    return apiCall(`/posts/${postId}/comments`);
  },

  // Add comment to a post
  addComment: async (postId, content) => {
    return apiCall(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Upload image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    return response.json();
  },
};

// Events API
export const eventsAPI = {
  // Get events with filters
  getEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });
    
    return apiCall(`/events?${queryParams.toString()}`);
  },

  // Get single event
  getEventById: async (id) => {
    return apiCall(`/events/${id}`);
  },

  // Get trending events
  getTrendingEvents: async () => {
    return apiCall('/events/trending');
  },

  // Get event statistics
  getEventStats: async () => {
    return apiCall('/events/stats');
  },

  // Get upcoming deadlines
  getUpcomingDeadlines: async () => {
    return apiCall('/events/deadlines');
  },

  // Register for event
  registerForEvent: async (eventId) => {
    return apiCall(`/events/${eventId}/register`, {
      method: 'POST',
    });
  },

  // Create event (for contributors/admins)
  createEvent: async (eventData) => {
    return apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
};

// Contributor Application API
export const contributorAPI = {
  // Submit application
  submitApplication: async (formData) => {
    const data = new FormData();
    data.append('reasonForApplying', formData.reasonForApplying);
    if (formData.experience) {
      data.append('experience', formData.experience);
    }
    data.append('collegeIdCard', formData.collegeIdCard);
    data.append('authorityLetter', formData.authorityLetter);

    return apiCall('/contributor/apply', {
      method: 'POST',
      body: data,
    });
  },

  // Get my application
  getMyApplication: async () => {
    return apiCall('/contributor/my-application');
  },

  // Admin: Get all applications
  getAllApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/contributor/applications${queryString ? '?' + queryString : ''}`);
  },

  // Admin: Get application by ID
  getApplicationById: async (id) => {
    return apiCall(`/contributor/applications/${id}`);
  },

  // Admin: Approve application
  approveApplication: async (id, comments = '') => {
    return apiCall(`/contributor/applications/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  },

  // Admin: Reject application
  rejectApplication: async (id, rejectionReason, comments = '') => {
    return apiCall(`/contributor/applications/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason, comments }),
    });
  },

  // Admin: Delete application
  deleteApplication: async (id) => {
    return apiCall(`/contributor/applications/${id}`, {
      method: 'DELETE',
    });
  },
};

export default { postsAPI, authAPI, eventsAPI, contributorAPI };
