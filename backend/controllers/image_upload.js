import fs from 'fs';
import {google} from 'googleapis'
import stream from 'stream'
import socket from '../server.js'


function createReadableStream(buffer) {
	const readable = new stream.Readable({
		read() {
		this.push(buffer);
		this.push(null); // Signal the end of the stream
		},
	});
	return readable;
}

const CLIENT_ID="534827030960-v4si5kctopvog12lkiumo8dug1hoe1qe.apps.googleusercontent.com",
	CLIENT_SECRET="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",
	REDIRECT_URI="https://developers.google.com/oauthplayground",
	REFRESH_TOKEN="1//04TtIQ7lADMeGCgYIARAAGAQSNwF-L9Ir_lhq3mhoegfWSUKSGX5EPgcTgoP4t6ONW9d1WyPkcx7n40hKv-ISpjw9_3DTtwbGnTY";

const oauth2Client = new google.auth.OAuth2(
	CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
	version: 'v3',
	auth: oauth2Client
});

export const imageUploadController = async(req, res) => {
	try{
		console.log("Inside");
		const response = await drive.files.create({
			requestBody: {
				name: 'file'
			}, 
			media: {
				mimeType: 'image/png',
				body: fs.createReadStream('controllers/images/white.png'),
			}
		});
		console.log(response?.data);
		// socket.emit("backend", {
		// 	type: "new_vendor",
		// 	vendor_id: response?.data.id
		// });
		return res.status(200).send({
			success: true,
			message: "Image Uploaded Successfully!",
			file_id: response?.data.id
		});
	}
	catch(error){
		console.log(error.message);
		return res.status(500).send({
			success: false,
			message: "Error in uploading image!"
		})
	}
}

export const replaceImageController = async(req, res) => {
	try{
		const fileBuffer=req.file.buffer;
		const {file_id} = req.body;
		const response=await drive.files.update({
            fileId: file_id,
			media: {
				mimeType: fileBuffer.mimeType, 
				body: createReadableStream(fileBuffer)
			}
        });
		socket.emit("backend", {
			type: "update_image",
			vendor_id: file_id
		});
		console.log(response?.data);
		return res.status(200).send({
			status: true,
			message: "Replaced Successfully!"
		});
	}
	catch(error){
		console.log(error.message);
		return res.status(500).send({
			success: false,
			message: "Error in replacing image!"
		})
	}
}

export const updateLocationController = async(req, res) => {
	try{
		const {name, file_id} = req.body;
		const response=await drive.files.update({
            fileId: file_id,
			resource: {name: name}
        });
		console.log(response?.data);
		socket.emit("backend", {
			type: "update_location",
			vendor_id: file_id
		});
		return res.status(200).send({
			status: true,
			message: `Updated to ${ name } Successfully!`
		});
	}
	catch(error){
		console.log(error.message);
		return res.status(500).send({
			success: false,
			message: "Error in updating location!"
		})
	}
}
