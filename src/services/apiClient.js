import axios from 'axios';

// Configure axios instance with base URL
const apiClient = axios.create({
  // Use the Vite environment variable
  baseURL: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api`, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging in development
apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// API functions
export const getReviews = async () => {
  try {
    const response = await apiClient.get('/reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const submitReview = async (reviewData) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('author_name', reviewData.author_name);
    formData.append('author_email', reviewData.author_email);
    formData.append('rating', reviewData.rating.toString());
    formData.append('review_text', reviewData.review_text);
    
    if (reviewData.photo) {
      formData.append('photo', reviewData.photo);
    }

    const response = await apiClient.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export default apiClient;