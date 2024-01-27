import express from 'express'
import { nearestController } from '../controllers/nearestController.js';

const router = express.Router();

router.post('/sort_by_counts', nearestController);

export default router;