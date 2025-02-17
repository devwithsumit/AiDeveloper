import express from 'express';
// import dotenv from 'dotenv';
import cors from 'cors';
// to parse cookies
import cookieParser from 'cookie-parser';

// to access the env variables
import dotenv from 'dotenv/config.js';

// to execute mongoose connection
import dbConnect from './db/db.js';
dbConnect();

//to check https request in the console
import morgan from 'morgan'

const app = express();

//routes
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js'
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/user', userRoutes);
app.use('/project', projectRoutes);


export default app;