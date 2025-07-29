import React, { useState, useEffect } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { StarRating } from './StarRating';
import { PhotoUpload } from './PhotoUpload';
import { ReviewFormData } from '../types/review';

export const ReviewForm: React.FC = () => {
  const [formData, setFormData] = useState<ReviewFormData>({
    author_name: '',
    author_email: '',
    rating: 0,
    review_text: '',
    photo: null
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  
  const { submitReview, isSubmitting, error, clearError } = useReviewStore();

  useEffect(() => {
    if (error) {
      setMessage(error);
      setMessageType('error');
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setMessage('Please select a star rating.');
      setMessageType('error');
      return;
    }
    
    setMessage('');
    setMessageType('');
    
    const result = await submitReview(formData);
    
    if (result.success) {
      setMessage(result.message || 'Thank you! Your review has been submitted for approval.');
      setMessageType('success');
      setFormData({
        author_name: '',
        author_email: '',
        rating: 0,
        review_text: '',
        photo: null
      });
    } else {
      setMessage(result.error || 'Sorry, there was an error submitting your review. Please try again.');
      setMessageType('error');
    }
  };

  const handleInputChange = (field: keyof ReviewFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (photo: File | null) => {
    setFormData(prev => ({ ...prev, photo }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">Share Your Experience</h2>
        <p className="text-gray-600 text-lg">We value your feedback and would love to hear how we did!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <label className="block text-gray-700 text-sm font-bold mb-4">Your Rating</label>
          <div className="flex justify-center">
            <StarRating 
              rating={formData.rating} 
              setRating={(rating) => handleInputChange('rating', rating)}
              size="lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.author_name}
              onChange={(e) => handleInputChange('author_name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.author_email}
              onChange={(e) => handleInputChange('author_email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
              required
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="review" className="block text-gray-700 text-sm font-bold mb-2">
            Your Review *
          </label>
          <textarea
            id="review"
            rows={5}
            value={formData.review_text}
            onChange={(e) => handleInputChange('review_text', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 resize-none"
            required
            placeholder="Tell us about your experience..."
          />
        </div>

        <div>
          <PhotoUpload 
            onPhotoSelect={handlePhotoSelect}
            selectedPhoto={formData.photo}
          />
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-12 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Review'
            )}
          </button>
          
          {message && (
            <div className={`text-center p-4 rounded-xl max-w-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};