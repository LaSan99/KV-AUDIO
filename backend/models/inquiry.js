import { response } from "express";
import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  id:{
    type : Number,
    required : true,
    unique : true
  },
  name: {
    type: String,
    required: false // Optional for backward compatibility with existing inquiries
  },
  email : {
    type : String,
    required : true
  },
  message : {
    type : String,
    required : true
  },
  phone : {
    type : String,
    required : true
  },
  date : {
    type : Date,
    required : true,
    default : Date.now()
  },
  response : {
    type : String,
    required : false,
    default : ""
  },
  isResolved : {
    type : Boolean,
    required : true,
    default : false
  }
})

const Inquiry = mongoose.model("Inquiries",inquirySchema);

export default Inquiry;