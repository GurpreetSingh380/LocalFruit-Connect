import express from "express";
import { createFolder, deleteFolder } from "../controllers/folderController.js";

const router = express.Router();

router.post('/create_folder', createFolder);
router.post('/delete_folder', deleteFolder);


export default router;