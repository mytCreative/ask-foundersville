import { create } from 'zustand';
import { Review, ReviewFormData, ApiResponse } from '../types/review';
import { getReviews as fetchReviewsFromAPI, submitReview as submitReviewToAPI } from '../services/apiClient';

interface ReviewStore {
  reviews: Review[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  submitReview: (reviewData: ReviewFormData) => Promise<ApiResponse<Review>>;
  clearError: () => void;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchReviews: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetchReviewsFromAPI();
      
      // Extract reviews from the API response
      const reviews = response.success ? response.data : [];
      set({ reviews, isLoading: false });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({ 
        error: 'Failed to load reviews. Please check your connection and try again.', 
        isLoading: false 
      });
    }
  },

  submitReview: async (reviewData: ReviewFormData): Promise<ApiResponse<Review>> => {
    set({ isSubmitting: true, error: null });
    
    try {
      const result = await submitReviewToAPI(reviewData);

      set({ isSubmitting: false });
      
      // Refresh reviews after successful submission
      get().fetchReviews();
      
      return { 
        success: true, 
        message: result.message || 'Review submitted successfully!',
        data: result.data 
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Extract error message from API response or use default
      let errorMessage = 'Failed to submit review. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        isSubmitting: false 
      });
      
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));