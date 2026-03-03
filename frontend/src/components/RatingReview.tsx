import React, { useEffect, useState } from 'react';
import reviewService, { Review } from '../services/reviewService';

interface RatingReviewProps {
  productId: string;
}

const RatingReview: React.FC<RatingReviewProps> = ({ productId }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<string>('0');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getReviews(productId);
      setReviews(data);
      calculateAverage(data);
    } catch (error) {
      console.error('Error fetching reviews', error);
    }
  };

  const calculateAverage = (data: Review[]) => {
    if (data.length === 0) {
      setAverage('0');
      return;
    }
    const total = data.reduce((sum, r) => sum + r.rating, 0);
    setAverage((total / data.length).toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment) {
      alert('Please provide rating and comment');
      return;
    }

    try {
      await reviewService.addReview(productId, { rating, comment });
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (error) {
      console.error('Error adding review', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>⭐ Rating & Reviews</h2>

      <h3>Average Rating: {average} / 5</h3>
      <p>Total Reviews: {reviews.length}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Rating (1-5): </label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Comment: </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button type="submit">Submit Review</button>
      </form>

      <hr />

      <h3>All Reviews</h3>

      {reviews.map((review) => (
        <div key={review._id} style={{ marginBottom: '10px' }}>
          <p>⭐ {review.rating}</p>
          <p>{review.comment}</p>
          <small>
            {new Date(review.createdAt).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default RatingReview;
