const multer = require('multer');
const path = require('path');
const wordpressService = require('../services/wordpressService');
const ghlService = require('../services/ghlService');
const { asyncHandler } = require('../middleware/asyncHandler');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * Get all approved reviews from WordPress
 * GET /api/reviews
 */
const getReviews = asyncHandler(async (req, res) => {
  console.log('Fetching reviews from WordPress...');
  
  try {
    // Test WordPress connection first
    const connectionTest = await wordpressService.testConnection();
    if (!connectionTest && !wordpressService.mockMode) {
      console.warn('WordPress connection failed, but continuing with request...');
    }
    
    // Fetch approved reviews from WordPress
    const reviews = await wordpressService.getApprovedReviews();
    
    console.log(`Successfully fetched ${reviews.length} reviews`);
    
    res.status(200).json({
      success: true,
      data: reviews,
      count: reviews.length,
      message: reviews.length > 0 ? 'Reviews loaded successfully' : 'No reviews found',
      source: wordpressService.mockMode ? 'mock' : 'wordpress'
    });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    
    // Provide detailed error information
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews from WordPress',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      } : 'Internal server error'
    });
  }
});

/**
 * Submit a new review to WordPress
 * POST /api/reviews
 */
const submitReview = asyncHandler(async (req, res) => {
  const { author_name, author_email, rating, review_text } = req.body;
  const photo = req.file;

  console.log('Submitting new review:', {
    author_name,
    author_email: author_email ? '[REDACTED]' : 'Not provided',
    rating,
    review_text_length: review_text?.length || 0,
    has_photo: !!photo
  });

  // Validate required fields
  if (!author_name || !author_email || !rating || !review_text) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: author_name, author_email, rating, and review_text are required'
    });
  }

  // Validate rating range
  const numericRating = parseInt(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a number between 1 and 5'
    });
  }

  // Validate photo if provided
  if (photo && !photo.mimetype.startsWith('image/')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed for photos'
    });
  }

  try {
    console.log('Creating review in WordPress...');
    
    // Step 1: Create review in WordPress
    const wordpressResult = await wordpressService.createReview({
      author_name,
      author_email,
      rating,
      review_text,
      photo,
    });

    console.log('Review created in WordPress:', wordpressResult);

    // Step 2: Update GHL contact (non-blocking)
    if (author_email) {
      ghlService.updateContactWithReviewTag(author_email).catch(error => {
        console.error('Non-critical GHL update failed:', error.message);
      });
    }

    res.status(201).json({
      success: true,
      message: wordpressService.mockMode 
        ? 'Thank you! Your review has been submitted (demo mode).'
        : 'Thank you! Your review has been submitted and is pending approval.',
      data: {
        id: wordpressResult.id,
        status: wordpressResult.status || 'pending',
        title: wordpressResult.title
      }
    });

  } catch (error) {
    console.error('Error submitting review:', error.message);
    
    res.status(500).json({
      success: false,
      message: error.message.includes('WordPress') 
        ? error.message 
        : 'Failed to submit review. Please try again.',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.constructor.name
      } : undefined
    });
  }
});

/**
 * Get a specific review by ID from WordPress
 * GET /api/reviews/:id
 */
const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(`Fetching review with ID: ${id}`);

  // Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review ID provided'
    });
  }

  try {
    const review = await wordpressService.getReviewById(parseInt(id));
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review with ID ${id} not found`
      });
    }

    console.log(`Successfully fetched review: ${review.id}`);
    res.status(200).json({
      success: true,
      data: review,
      message: 'Review retrieved successfully'
    });
  } catch (error) {
    console.error(`Error fetching review ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: `Failed to fetch review with ID ${id}`,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.constructor.name
      } : undefined
    });
  }
});

/**
 * Update review status (admin operation)
 * PUT /api/reviews/:id/status
 */
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Updating review ${id} status to: ${status}`);

  // Validate parameters
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review ID provided'
    });
  }

  const validStatuses = ['publish', 'pending', 'draft', 'trash'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    const result = await wordpressService.updateReviewStatus(parseInt(id), status);

    console.log(`Review ${id} status updated successfully`);

    res.status(200).json({
      success: true,
      data: result,
      message: `Review status updated to ${status}`
    });
  } catch (error) {
    console.error(`Error updating review ${id} status:`, error.message);
    res.status(500).json({
      success: false,
      message: `Failed to update review status`,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.constructor.name
      } : undefined
    });
  }
});

/**
 * Test WordPress connection
 * GET /api/reviews/test-connection
 */
const testWordPressConnection = asyncHandler(async (req, res) => {
  console.log('Testing WordPress connection...');

  try {
    const isConnected = await wordpressService.testConnection();
    
    res.status(200).json({
      success: true,
      connected: isConnected,
      mockMode: wordpressService.mockMode,
      message: isConnected 
        ? 'WordPress connection successful' 
        : 'WordPress connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WordPress connection test error:', error.message);
    res.status(500).json({
      success: false,
      connected: false,
      mockMode: wordpressService.mockMode,
      message: 'WordPress connection test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getReviews,
  submitReview,
  getReviewById,
  updateReviewStatus,
  testWordPressConnection,
  upload,
};