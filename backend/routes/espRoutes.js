import express from "express";
import fs from "fs";
import { google } from "googleapis";
import {espReplaceController, updateLocationController} from '../controllers/image_upload.js'
const router = express.Router();

const CLIENT_ID =
    "534827030960-v4si5kctopvog12lkiumo8dug1hoe1qe.apps.googleusercontent.com",
  CLIENT_SECRET = "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",
  REDIRECT_URI = "https://developers.google.com/oauthplayground",
  REFRESH_TOKEN =
    "1//04uYMZN1j0_1tCgYIARAAGAQSNwF-L9IruDy9Xykg-UBhZyfGHAv8rvjNxSl3GclSBiuaWRcNhsEZx-ZyCFBObSG-7IBUEkBOvE4";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

router.post("/image", espReplaceController);
router.post("/location", updateLocationController);
export default router;
