import React, { useState } from 'react';
import { Star, Upload, User, Mail, MessageSquare } from 'lucide-react';

function ReviewSubmissionForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    reviewMessage: '',
    photo: null as File | null
  });

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex: number) => {
    setHoverRating(starIndex);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      photo: file
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Review submitted:', { ...formData, rating });
    // Handle form submission here
  };

  const StarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 rounded"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
          >
            <Star
              size={32}
              className={`transition-colors duration-200 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-3 text-sm font-medium" style={{ color: '#273F4F' }}>
          {rating > 0 ? `${rating}/5 stars` : 'Rate your experience'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-lg mx-auto">
        <div 
          className="rounded-2xl shadow-lg p-6 sm:p-8"
          style={{ backgroundColor: '#D7D7D7' }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: '#273F4F' }}
            >
              Share Your Experience
            </h1>
            <p 
              className="text-base opacity-80"
              style={{ color: '#273F4F' }}
            >
              We'd love to hear about your experience with us
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <label 
                className="block text-base font-semibold"
                style={{ color: '#273F4F' }}
              >
                How would you rate your experience?
              </label>
              <StarRating />
            </div>

            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label 
                  htmlFor="fullName"
                  className="flex items-center text-base font-semibold"
                  style={{ color: '#273F4F' }}
                >
                  <User size={18} className="mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none text-gray-700 placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label 
                  htmlFor="email"
                  className="flex items-center text-base font-semibold"
                  style={{ color: '#273F4F' }}
                >
                  <Mail size={18} className="mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none text-gray-700 placeholder-gray-400"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Review Message */}
            <div className="space-y-2">
              <label 
                htmlFor="reviewMessage"
                className="flex items-center text-base font-semibold"
                style={{ color: '#273F4F' }}
              >
                <MessageSquare size={18} className="mr-2" />
                Your Review
              </label>
              <textarea
                id="reviewMessage"
                name="reviewMessage"
                value={formData.reviewMessage}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none text-gray-700 placeholder-gray-400 resize-vertical"
                placeholder="Tell us about your experience... What did you like? How can we improve?"
              />
            </div>

            {/* Optional Photo Upload */}
            <div className="space-y-2">
              <label 
                className="flex items-center text-base font-semibold"
                style={{ color: '#273F4F' }}
              >
                <Upload size={18} className="mr-2" />
                Optional Photo Upload
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-4 py-6 rounded-lg border-2 border-dashed border-gray-300 bg-white transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer">
                  <div className="text-center">
                    <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600 font-medium">
                      {formData.photo ? formData.photo.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg font-bold text-base text-white transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200 active:scale-[0.98]"
                style={{ backgroundColor: '#FE7743' }}
              >
                Submit Review
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-300">
            <p 
              className="text-center text-sm opacity-70"
              style={{ color: '#273F4F' }}
            >
              Your review helps us improve our service and helps other customers make informed decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSubmissionForm;