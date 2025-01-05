import Review from "../models/review.js";

export function addReview(req, res) {
  if (req.user == null) {
    res
      .status(401)
      .json({ message: "You need to be logged in to add a review" });
    return;
  }

  const data = req.body;    

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
        res.status(400).json({ message: error.message });
    })
}

export function getReviews(req, res) {
    const user = req.user;

    if(user == null || user.role != "admin"){
        Review.find({isApproved: true})
        .then((reviews) => {
            res.json(reviews);
        });
        return;
    }

    if(user.role == "admin"){
        Review.find()
        .then((reviews) => {
            res.json(reviews);
        });
    }
}

export function deleteReview(req, res) {
    const email = req.user.email;

    if(req.user==null){
        res.status(401).json({message: "You need to be logged in to delete a review"});
        return;
    }

    if(rew.user.role == "admin"){
        Review.deleteOne({email: email})
        .then(() => {
            res.json({message: "Review deleted successfully"});
        }).catch((error) => {
            res.status(400).json({message: error.message});
        });
        return;
    }

    if(req.user.role == "customer"){
        if(req.user.email == email){
            Review.deleteOne({email: email})
            .then(() => {
                res.json({message: "Review deleted successfully"});
            }).catch((error) => {
                res.status(400).json({message: error.message});
            });
        }else{
            res.status(401).json({message: "You can only delete your own reviews"});
        }
       
    }
}

export function approveReview(req, res) {
    const email = req.body.email;

    if(req.user == null){
        res.status(401).json({message: "You need to be logged in to approve a review"});
        return;
    }

    if(req.user.role == "admin"){
        Review.updateOne({email: email}, {isApproved: true})
        .then(() => {
            res.json({message: "Review approved successfully"});
        }).catch((error) => {
            res.status(400).json({message: error.message});
        });
    }else{
        res.status(401).json({message: "You need to be an admin to approve a review"});
    }
}