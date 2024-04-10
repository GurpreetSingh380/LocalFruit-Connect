import express from 'express'
import fs from 'fs'
// import { nearestController } from '../controllers/nearestController.js';

const router = express.Router();

router.post('/image', async(req, res)=>{
    try {
        // Extract the Base64-encoded data from the request body
        const base64EncodedData = req.body.image;
    
        // Decode the Base64 string to binary data
        const binaryData = Buffer.from(base64EncodedData, 'base64');
    
        // Specify the path where you want to save the file
        const filePath = "routes/uploads/image.jpg";
    
        // Write the binary data to the file
        fs.writeFileSync(filePath, binaryData);
    
        console.log('File saved successfully:', filename);
    
        res.status(200).send('Image saved successfully');
      } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
      }
});

export default router;