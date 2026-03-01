const API_URL = "http://localhost:5000/api/reviews";

const getReviews = async (productId) => {
  const response = await fetch(`${API_URL}/${productId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }
  return await response.json();
};

const addReview = async (productId, reviewData) => {
  const response = await fetch(`${API_URL}/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    throw new Error("Failed to add review");
  }

  return await response.json();
};

export default {
  getReviews,
  addReview,
};