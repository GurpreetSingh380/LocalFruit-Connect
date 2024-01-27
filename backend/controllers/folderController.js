import {google} from 'googleapis'
import {nanoid} from 'nanoid'


const CLIENT_ID="534827030960-v4si5kctopvog12lkiumo8dug1hoe1qe.apps.googleusercontent.com",
    CLIENT_SECRET="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",
    REDIRECT_URI="https://developers.google.com/oauthplayground",
    REFRESH_TOKEN="1//04ZK2lQhghFUUCgYIARAAGAQSNwF-L9Ir6o4k35Iq4yponRDbATxryqq40Cz3kBDGsyIXQTSIL3SWRIB7hacSCCXv-xPXBSARPZc";

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

export async function createFolder(req, res) {
    try{
        const folderName = nanoid(10);
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        return res.status(200).send({
            success: true,
            message: "Folder created!",
            folder_id: folder.data.id
        });
    }
    catch(error){
        return res.status(500).send({
            success: false,
            message: "Folder not created!"
        });
    }
  }

export async function deleteFolder(req, res) {
    try {
        const {folderId} = req.body;
        await drive.files.delete({
            fileId: folderId,
        });
        console.log(`Folder with ID ${folderId} deleted successfully.`);
        return res.status(200).send({
            success: true,
            message: "Folder deleted!"
        });
    } catch (error) {
        console.error('Error deleting folder:', error.message);
        return res.status(500).send({
            success: false,
            message: "Folder not deleted!"
        });
    }
  }