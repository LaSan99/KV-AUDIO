import express from "express";
import { addInquiry, deleteInquiry, getInquiries, updateInquiry, addPublicInquiry } from "../controllers/inquiryController.js";

const inquiryRouter = express.Router();

inquiryRouter.post("/contact", addPublicInquiry)
inquiryRouter.post("/",addInquiry)
inquiryRouter.get("/",getInquiries)
inquiryRouter.delete("/:id",deleteInquiry)
inquiryRouter.put("/:id",updateInquiry)

export default inquiryRouter;