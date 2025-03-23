import express from "express";
import { 
    blockOrUnblockUser, 
    getAllUsers, 
    getUser, 
    loginUser, 
    loginWithGoogle, 
    registerUser, 
    sendOTP, 
    verifyOTP,
    getUserProfile,
    updateUserProfile,
    getUserBookings
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/all",getAllUsers)
userRouter.put("/block/:email",blockOrUnblockUser)
userRouter.post("/google",loginWithGoogle)
userRouter.get("/sendOTP",sendOTP)
userRouter.post("/verifyEmail",verifyOTP)
userRouter.get("/",getUser)

// New profile routes
userRouter.get("/profile", getUserProfile)
userRouter.put("/profile", updateUserProfile)
userRouter.get("/bookings", getUserBookings)

export default userRouter;