const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// POST /api/reviews/:productId
router.post("/:productId", reviewController.addReview);

// GET /api/reviews/:productId
router.get("/:productId", reviewController.getReviews);

// DELETE /api/reviews/delete/:id
router.delete("/delete/:id", reviewController.deleteReview);

module.exports = router;