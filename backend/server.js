import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import imageRoutes from './routes/imageRoutes.js'
import folderRoutes from './routes/folderRoutes.js'
import cors from 'cors'
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

// Configuring .env file
dotenv.config();

const app = express();

app.use(cors());
// Middlewares
app.use(express.json());
app.use(morgan('dev'));


// Routes:
app.use('/api/v1', imageRoutes);
app.use('/api/v1', folderRoutes);

// Run/Listen
app.listen(process.env.PORT || 5001, ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
})

export default socket;