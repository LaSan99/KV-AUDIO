import express from 'express';
import { addProduct, getProducts, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",addProduct)
productRouter.get("/",getProducts) 
productRouter.put("/:key",updateProduct) 


export default productRouter;