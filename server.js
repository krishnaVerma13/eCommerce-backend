import "dotenv/config"
import express, { json } from 'express';
import cookieParser from 'cookie-parser';

import connectDB from './config/dbConnection.js';
import cors from 'cors';
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000'];
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js'
import userRout from './routes/userRoutes.js'
import mongoose from "mongoose";
import userModel from "./models/userModel.js";


const app = express();
const port = process.env.PORT || 5000 ;
app.use(cors({
    origin: 'http://localhost:5173', // your frontend, no trailing slash
    credentials: true,
  }));

connectDB();


app.use(json());
app.use(cookieParser());

app.use('/api/user', userRout);

app.use(errorHandler)
app.use(notFoundHandler)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});