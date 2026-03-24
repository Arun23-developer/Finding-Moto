import React, { useEffect, useState } from "react";
import reviewService, { Review } from "../services/reviewService";

interface RatingReviewProps {
  productId: string;
}

const RatingReview: React.FC<RatingReviewProps> = ({ productId }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<string>("0");

  useEffect(() => {
    fetchReviews();
  }, []);

  //  Fetch reviews
  const fetchReviews = async () => {
    try {
      const data = await reviewService.getReviews(productId);
      setReviews(data.reviews);
      setAverage(data.averageRating.toFixed(1));
    } catch (error) {
      console.error("Error fetching reviews", error);
    }
  };

  // Add review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment) {
      alert("Please provide rating and comment");
      return;
    }

    try {
      await reviewService.addReview(productId, {
        rating,
        comment,
        userId: "user123", // temp user
        userName: "Siva",
      });

      setRating(0);
      setComment("");
      fetchReviews();
    } catch (error) {
      console.error("Error adding review", error);
    }
  };

  //  Delete review
  const handleDelete = async (id: string) => {
    try {
      await reviewService.deleteReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review", error);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2> Rating & Reviews</h2>

      <h3>Average Rating: {average} / 5</h3>
      <p>Total Reviews: {reviews.length}</p>

      {/*  FORM */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Rating: </label>

          {/*  Star UI */}
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  cursor: "pointer",
                  fontSize: "24px",
                  color: star <= rating ? "gold" : "gray",
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div>
          <label>Comment: </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
          />
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          Submit Review
        </button>
      </form>

      <hr />

      <h3>All Reviews</h3>

      {/* SHOW REVIEWS */}
      {reviews.map((review) => (
        <div
          key={review._id}
          style={{
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
            background: "#f9f9f9",
          }}
        >
          <p><b>{review.userName}</b></p>
          <p> {review.rating}</p>
          <p>{review.comment}</p>

          <small>
            {new Date(review.createdAt).toLocaleDateString()}
          </small>

          <br />

          <button onClick={() => handleDelete(review._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default RatingReview;