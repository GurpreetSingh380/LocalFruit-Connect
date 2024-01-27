import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import {Server} from 'socket.io'
import { setPredictions, setLocation } from './services.js'
import nearestRoutes from './routes/nearestRoutes.js'

// Configuring .env file
dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(cors());
// Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/v2/nearest_vendors', nearestRoutes);

io.on('connection', (socket)=>{
    console.log("What is socket_id: ", socket.id);
    socket.on("backend", async(payload)=>{
      switch (payload.type) {
        case 'update_image':
          await setPredictions(payload.vendor_id);
          break;

        case 'update_location':
          await setLocation(payload.vendor_id);
          break;

        default:
          break;
      }
    })
});


server.listen(process.env.PORT || 5002, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});