import { imageUploadController, replaceImageController, updateLocationController } from '../controllers/image_upload.js'
import express from 'express'
import multer from 'multer'

// Router object:
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload_image',  imageUploadController);
router.post('/replace_image', upload.single('file'), replaceImageController);
router.post('/update_location', updateLocationController);



export default router;