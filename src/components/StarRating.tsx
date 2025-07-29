import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  setRating, 
  size = 'md' 
}) => {
  const [hover, setHover] = useState(0);
  const isInteractive = !!setRating;
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={`${sizeClasses[size]} transition-all duration-200 ${
              ratingValue <= (hover || rating) 
                ? 'text-yellow-400 transform scale-110' 
                : 'text-gray-300'
            } ${isInteractive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
            onClick={() => isInteractive && setRating(ratingValue)}
            onMouseEnter={() => isInteractive && setHover(ratingValue)}
            onMouseLeave={() => isInteractive && setHover(0)}
            disabled={!isInteractive}
            aria-label={`${isInteractive ? 'Rate' : 'Rating:'} ${ratingValue} star${ratingValue !== 1 ? 's' : ''}`}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
};