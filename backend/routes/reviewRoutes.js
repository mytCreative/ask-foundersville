const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation rules for review submission
const reviewValidation = [
  body('author_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('author_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review_text')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review text must be between 10 and 1000 characters'),
];

// Validation rules for status update
const statusUpdateValidation = [
  body('status')
    .isIn(['publish', 'pending', 'draft', 'trash'])
    .withMessage('Status must be one of: publish, pending, draft, trash'),
];

// Test WordPress connection endpoint
router.get('/test-connection', reviewController.testWordPressConnection);

// GET /api/reviews - Fetch all approved reviews
router.get('/', reviewController.getReviews);

// POST /api/reviews - Submit a new review
router.post('/', reviewController.upload.single('photo'), reviewValidation, validateRequest, reviewController.submitReview);

// GET /api/reviews/:id - Get a specific review (for admin purposes)
router.get('/:id', reviewController.getReviewById);

// PUT /api/reviews/:id/status - Update review status (admin operation)
router.put('/:id/status', statusUpdateValidation, validateRequest, reviewController.updateReviewStatus);
module.exports = router;