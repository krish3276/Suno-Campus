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
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
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

// Auth API
export const authAPI = {
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },
};

export default { postsAPI, authAPI };
