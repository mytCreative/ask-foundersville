import React, { useEffect } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { ReviewCard } from './ReviewCard';

export const ReviewList: React.FC = () => {
  const { reviews, isLoading, error, fetchReviews } = useReviewStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (isLoading && reviews.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={fetchReviews}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Real feedback from real partners who have experienced the mytCreative difference.
        </p>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};