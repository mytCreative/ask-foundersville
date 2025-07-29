const axios = require('axios');
const FormData = require('form-data');

class WordPressService {
  constructor() {
    // --- ADD THIS NEW DIAGNOSTIC BLOCK ---
    console.log('--- Inside WordPressService Constructor ---');
    console.log('Raw process.env.WORDPRESS_URL:', `"${process.env.WORDPRESS_URL}"`);
    console.log('Raw process.env.WORDPRESS_USER:', `"${process.env.WORDPRESS_USER}"`);
    console.log('Raw process.env.WORDPRESS_APP_PASSWORD:', `"${process.env.WORDPRESS_APP_PASSWORD ? 'Loaded' : 'Missing'}"`);
    console.log('-------------------------------------------');
    // ------------------------------------

    this.baseURL = process.env.WORDPRESS_URL;
    this.username = process.env.WORDPRESS_USER;
    this.password = process.env.WORDPRESS_APP_PASSWORD;
    
    if (!this.baseURL || !this.username || !this.password) {
      console.warn('!!! CREDENTIALS CHECK FAILED. Entering mock mode. !!!'); // Added a more visible warning
      console.warn('WordPress credentials not configured. Using mock mode.');
      this.mockMode = true;
    } else {
      console.log(`WordPress Service initialized for: ${this.baseURL}`);
      this.mockMode = false;
    }
    
    // Create base64 encoded auth token for WordPress Application Password
    this.authToken = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    
    // Configure axios instance for WordPress API
    this.wpClient = axios.create({
      baseURL: `${this.baseURL}/wp-json/wp/v2`,
      timeout: 10000,
      headers: {
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for logging
    this.wpClient.interceptors.request.use(
      (config) => {
        console.log(`WordPress API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('WordPress API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.wpClient.interceptors.response.use(
      (response) => {
        console.log(`WordPress API Response: ${response.status} - ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('WordPress API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch all approved reviews from WordPress
   * @returns {Promise<Array>} Array of formatted review objects
   */
  async getApprovedReviews() {
    if (this.mockMode) {
      return this.getMockReviews();
    }

    try {
      const response = await this.wpClient.get('/reviews', {
        params: {
          status: 'publish',
          per_page: 100, // Adjust as needed
          orderby: 'date',
          order: 'desc',
          _fields: 'id,date,status,title,acf,meta' // Only fetch needed fields for performance
        }
      });

      console.log(`Fetched ${response.data.length} reviews from WordPress`);
      
      return response.data.map(this.formatReviewFromWordPress.bind(this));
    } catch (error) {
      console.error('Failed to fetch reviews from WordPress:', error.message);
      
      // Provide specific error messages based on error type
      if (error.response?.status === 401) {
        throw new Error('WordPress authentication failed. Please check your credentials.');
      } else if (error.response?.status === 404) {
        throw new Error('Reviews endpoint not found. Please ensure the Reviews custom post type is properly configured.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to WordPress. Please check the WordPress URL.');
      } else {
        throw new Error(`WordPress API error: ${error.message}`);
      }
    }
  }

  /**
   * Create a new review in WordPress
   * @param {Object} reviewData - Review data object
   * @returns {Promise<Object>} Created review response
   */
  async createReview(reviewData) {
    if (this.mockMode) {
      return this.createMockReview(reviewData);
    }

    try {
      let photoUrl = null;
      
      // Upload photo to WordPress media library if provided
      if (reviewData.photo) {
        console.log('Uploading photo to WordPress media library...');
        photoUrl = await this.uploadPhoto(reviewData.photo);
        console.log('Photo uploaded successfully:', photoUrl);
      }
      
      // Prepare the review payload for WordPress
      const payload = {
        title: `Review from ${reviewData.author_name}`,
        status: 'pending', // Reviews start as pending for moderation
        content: reviewData.review_text, // Store review text in post content as well
        acf: {
          customer_name: reviewData.author_name,
          customer_email: reviewData.author_email,
          star_rating: parseInt(reviewData.rating),
          review_message: reviewData.review_text,
          experience_photo_url: photoUrl,
        }
      };

      console.log('Creating review in WordPress with payload:', {
        ...payload,
        acf: { ...payload.acf, author_email: '[REDACTED]' } // Don't log email
      });

      const response = await this.wpClient.post('/reviews', payload);

      console.log(`Review created successfully with ID: ${response.data.id}`);

      return {
        id: response.data.id,
        status: response.data.status,
        title: response.data.title?.rendered || payload.title
      };
    } catch (error) {
      console.error('Failed to create review in WordPress:', error.message);
      
      // Provide specific error messages
      if (error.response?.status === 401) {
        throw new Error('WordPress authentication failed. Cannot create review.');
      } else if (error.response?.status === 403) {
        throw new Error('Permission denied. User may not have rights to create reviews.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Invalid review data';
        throw new Error(`WordPress validation error: ${errorMsg}`);
      } else {
        throw new Error(`Failed to create review: ${error.message}`);
      }
    }
  }

  /**
   * Upload photo to WordPress media library
   * @param {Buffer} photoBuffer - Photo buffer from multer
   * @returns {Promise<string|null>} URL of uploaded photo or null if failed
   */
  async uploadPhoto(photoBuffer) {
    if (this.mockMode) {
      return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400';
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      const filename = `review-photo-${Date.now()}.jpg`;
      
      formData.append('file', photoBuffer.buffer, {
        filename: filename,
        contentType: photoBuffer.mimetype,
      });

      // Set proper headers for file upload
      const uploadResponse = await axios.post(
        `${this.baseURL}/wp-json/wp/v2/media`,
        formData,
        {
          headers: {
            'Authorization': `Basic ${this.authToken}`,
            ...formData.getHeaders(),
          },
          timeout: 30000, // Longer timeout for file uploads
        }
      );

      console.log(`Photo uploaded to WordPress media library: ${uploadResponse.data.source_url}`);
      return uploadResponse.data.source_url;
    } catch (error) {
      console.error('WordPress photo upload failed:', error.message);
      
      // Don't fail the entire review submission if photo upload fails
      if (error.response?.status === 413) {
        console.warn('Photo too large, skipping upload');
      } else if (error.response?.status === 415) {
        console.warn('Unsupported photo format, skipping upload');
      }
      
      return null; // Return null if upload fails, review can still be created without photo
    }
  }

  /**
   * Get a specific review by ID
   * @param {number} id - Review ID
   * @returns {Promise<Object|null>} Formatted review object or null if not found
   */
  async getReviewById(id) {
    if (this.mockMode) {
      return this.getMockReviewById(id);
    }

    try {
      const response = await this.wpClient.get(`/reviews/${id}`, {
        params: {
          _fields: 'id,date,status,title,acf,meta'
        }
      });

      return this.formatReviewFromWordPress(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`Review with ID ${id} not found`);
        return null;
      }
      
      console.error(`Failed to fetch review ${id}:`, error.message);
      throw new Error(`Failed to fetch review: ${error.message}`);
    }
  }

  /**
   * Update review status (for admin operations)
   * @param {number} id - Review ID
   * @param {string} status - New status ('publish', 'pending', 'draft', 'trash')
   * @returns {Promise<Object>} Updated review response
   */
  async updateReviewStatus(id, status) {
    if (this.mockMode) {
      console.log(`Mock: Updating review ${id} status to ${status}`);
      return { id, status };
    }

    try {
      const response = await this.wpClient.post(`/reviews/${id}`, {
        status: status
      });

      console.log(`Review ${id} status updated to: ${status}`);
      return {
        id: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error(`Failed to update review ${id} status:`, error.message);
      throw new Error(`Failed to update review status: ${error.message}`);
    }
  }

  /**
   * Format WordPress review data to our application format
   * @param {Object} wpReview - Raw WordPress review object
   * @returns {Object} Formatted review object
   */
  formatReviewFromWordPress(wpReview) {
    // Handle both ACF and meta field formats
    const acfData = wpReview.acf || {};

    // NEW: Safely get the photo URL from the photo_upload object
    const photoUrl = acfData.photo_upload && acfData.photo_upload.url ? acfData.photo_upload.url : null;
    
    return {
      id: wpReview.id,
      // --- Core Fields FROM WordPress FOR Frontend Display ---
      author_name: acfData.customer_name || 'Anonymous',
      rating: parseInt(acfData.star_rating || 5),
      review_text: acfData.review_message || wpReview.content?.rendered || '',
      experience_photo_url: photoUrl,
      submission_date: wpReview.date?.split('T')[0],

      // --- Fields for Backend Use & Data Completeness ---
      author_email: acfData.customer_email || '',
      status: wpReview.status === 'publish' ? 'approved' : wpReview.status,
      wordpress_id: wpReview.id,
      created_at: wpReview.date,
      title: wpReview.title?.rendered || `Review from ${acfData.customer_name || 'Anonymous'}`
    };
  }

  /**
   * Test WordPress connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    if (this.mockMode) {
      console.log('WordPress service in mock mode - connection test skipped');
      return true;
    }

    try {
      // Test basic WordPress API connectivity
      const response = await this.wpClient.get('/', {
        params: { _fields: 'name,description' }
      });
      
      console.log(`WordPress connection successful: ${response.data.name}`);
      
      // Test reviews endpoint specifically
      await this.wpClient.get('/reviews', {
        params: { per_page: 1, _fields: 'id' }
      });
      
      console.log('Reviews endpoint accessible');
      return true;
    } catch (error) {
      console.error('WordPress connection test failed:', error.message);
      return false;
    }
  }

  // Mock methods for development
  getMockReviews() {
    console.log('Using mock reviews data');
    return [
      {
        id: 1,
        author_name: 'Dr. Pamela Bynum',
        author_email: 'pamela@example.com',
        rating: 5,
        review_text: 'The team at mytCreative is truly dedicated to their mission. Their innovative approach to technology and education is making a real impact in the community.',
        submission_date: '2025-01-16',
        status: 'approved',
        photo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        wordpress_id: 1,
        created_at: '2025-01-16T10:00:00Z',
        title: 'Review from Dr. Pamela Bynum'
      },
      {
        id: 2,
        author_name: 'Denzel The Intern',
        author_email: 'denzel@example.com',
        rating: 5,
        review_text: 'Working here has been an amazing learning experience. I get to work on real projects that help businesses and learn about cutting-edge technology.',
        submission_date: '2025-01-15',
        status: 'approved',
        photo_url: null,
        wordpress_id: 2,
        created_at: '2025-01-15T14:30:00Z',
        title: 'Review from Denzel The Intern'
      },
      {
        id: 3,
        author_name: 'Sarah Johnson',
        author_email: 'sarah@example.com',
        rating: 4,
        review_text: 'Great service and professional team. They delivered exactly what we needed for our business. Highly recommend their expertise.',
        submission_date: '2025-01-14',
        status: 'approved',
        photo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
        wordpress_id: 3,
        created_at: '2025-01-14T09:15:00Z',
        title: 'Review from Sarah Johnson'
      }
    ];
  }

  createMockReview(reviewData) {
    console.log('Mock: Creating review in WordPress:', {
      ...reviewData,
      author_email: '[REDACTED]'
    });
    return {
      id: Date.now(),
      status: 'pending',
      title: `Review from ${reviewData.author_name}`
    };
  }

  getMockReviewById(id) {
    const mockReviews = this.getMockReviews();
    return mockReviews.find(review => review.id === parseInt(id)) || null;
  }
}

module.exports = new WordPressService();