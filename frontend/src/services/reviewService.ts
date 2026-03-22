import api from './api';

export interface ReviewData {
  rating: number;
  comment: string;
}

export interface Review {
  _id: string;
  productId: string;
  buyer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

const getReviews = async (productId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/${productId}`);
  return response.data;
};

const addReview = async (productId: string, reviewData: ReviewData): Promise<Review> => {
  const response = await api.post(`/reviews/${productId}`, reviewData);
  return response.data;
};

const getMyReviews = async (): Promise<Review[]> => {
  const response = await api.get('/reviews/my');
  return response.data;
};

export default {
  getReviews,
  addReview,
  getMyReviews,
};
