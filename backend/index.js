import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken";

const app = express();  

app.use(bodyParser.json());
app.use((req, res, next) => {
  let token = req.header("Authorization");
  if (token != null) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, "kv-secret-89!", (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  next();
});

let mongoUrl =
    "mongodb+srv://lasannavodya:DelLCS5EiIBT3jFu@course.uf2pi.mongodb.net/kv-audio?retryWrites=true&w=majority&appName=Course";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("Error connecting to MongoDB:", err);
});

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);


app.listen(3000, () => {
  console.log("Server started on port 3000");
});