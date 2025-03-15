import Review from "../models/review.js";

export function addReview(req, res) {
  if (req.user == null) {
    res
      .status(401)
      .json({ message: "You need to be logged in to add a review" });
    return;
  }

  const data = req.body;

  // Validate rating
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    res.status(400).json({ message: "Rating must be between 1 and 5" });
    return;
  }

  // Validate comment
  if (!data.comment || data.comment.trim().length === 0) {
    res.status(400).json({ message: "Comment is required" });
    return;
  }

  data.name = req.user.firstName + " " + req.user.lastName;
  data.email = req.user.email;
  data.profilePicture = req.user.profilePicture;

  const newReview = new Review(data);

  newReview
    .save()
    .then(() => {
      res.status(201).json({ message: "Review added successfully" });
    })
    .catch((error) => {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: "You have already submitted a review" });
      } else {
        res.status(400).json({ message: error.message });
      }
    });
}

export async function getReviews(req, res) {
  const user = req.user;
  try {
    if (user.role == "admin") {
      const reviews = await Review.find();
      res.json(reviews);
    } else {
      const reviews = await Review.find({ isApproved: true });
      res.json(reviews);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
}

export function deleteReview(req, res) {
  const email = req.user.email;

  if (req.user == null) {
    res
      .status(401)
      .json({ message: "You need to be logged in to delete a review" });
    return;
  }

  if (req.user.role == "admin") {
    Review.deleteOne({ email: email })
      .then(() => {
        res.json({ message: "Review deleted successfully" });
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
      });
    return;
  }

  if (req.user.role == "customer") {
    if (req.user.email == email) {
      Review.deleteOne({ email: email })
        .then(() => {
          res.json({ message: "Review deleted successfully" });
        })
        .catch((error) => {
          res.status(400).json({ message: error.message });
        });
    } else {
      res.status(401).json({ message: "You can only delete your own reviews" });
    }
  }
}

export function approveReview(req, res) {
  const email = req.params.email;

  if (req.user == null) {
    res.status(401).json({ message: "Please login and try again" });
    return;
  }

  if (req.user.role == "admin") {
    Review.updateOne(
      {
        email: email,
      },
      {
        isApproved: true,
      }
    )
      .then(() => {
        res.json({ message: "Review approved successfully" });
      })
      .catch(() => {
        res.status(500).json({ error: "Review approval failed" });
      });
  } else {
    res.status(403).json({
      message: "You are not an admin. Only admins can approve reviews",
    });
  }
}
