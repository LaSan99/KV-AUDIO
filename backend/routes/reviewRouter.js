import express from 'express';
import { addReview, getReviews, deleteReview, approveReview, getApprovedReviews } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post("/", addReview);
reviewRouter.get("/", getReviews);
reviewRouter.get("/approved", getApprovedReviews);
reviewRouter.delete("/:email", deleteReview);
reviewRouter.put("/approve/:email", approveReview);

export default reviewRouter;