export interface Review {
  id: number;
  author_name: string;
  author_email: string;
  rating: number;
  review_text: string;
  submission_date: string;
  status?: 'pending' | 'approved' | 'rejected';
  experience_photo_url?: string;
}

export interface ReviewFormData {
  author_name: string;
  author_email: string;
  rating: number;
  review_text: string;
  photo?: File | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}