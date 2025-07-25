import React from 'react';
import { Star, User } from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  title: string;
  message: string;
  customerName: string;
  photoUrl?: string;
}

interface CustomerReviewsProps {
  reviews: Review[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating 
              ? 'text-custom-orange fill-custom-orange' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <StarRating rating={review.rating} />
      
      <h3 className="font-merriweather font-bold text-custom-blue text-lg mb-3 leading-tight">
        {review.title}
      </h3>
      
      <p className="font-open-sans text-custom-blue text-sm leading-relaxed mb-4">
        {review.message}
      </p>
      
      {review.photoUrl && (
        <div className="mb-4">
          <img 
            src={review.photoUrl} 
            alt="Customer photo" 
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-custom-blue" />
        <span className="font-open-sans font-medium text-custom-blue text-sm">
          {review.customerName}
        </span>
      </div>
    </div>
  );
};

const CustomerReviews: React.FC<CustomerReviewsProps> = ({ reviews }) => {
  return (
    <section className="bg-custom-gray py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-merriweather font-bold text-custom-blue text-3xl md:text-4xl text-center mb-12">
          What Our Customers Say
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;