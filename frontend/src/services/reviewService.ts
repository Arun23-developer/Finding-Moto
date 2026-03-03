import api from './api';

export interface ReviewData {
  rating: number;
  comment: string;
}

export interface Review {
  _id: string;
  productId: string;
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

export default {
  getReviews,
  addReview,
};
