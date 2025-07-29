import React from 'react';
import { Review } from '../types/review';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4 shadow-md">
          <span className="text-lg font-bold text-white">
            {getInitials(review.author_name)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg">{review.author_name}</h3>
          <p className="text-sm text-gray-500">{formatDate(review.submission_date)}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <StarRating rating={review.rating} size="sm" />
      </div>
      
      <blockquote className="text-gray-600 flex-grow leading-relaxed">
        "{review.review_text}"
      </blockquote>
      
      {review.experience_photo_url && ( 
        <div className="mt-4">
          <img
            src={review.experience_photo_url}
            alt="Review experience photo"
            className="w-full h-48 object-cover rounded-xl border border-gray-200"
          />
        </div>
      )}
      
      {review.status === 'pending' && (
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Approval
        </div>
      )}
    </div>
  );
};