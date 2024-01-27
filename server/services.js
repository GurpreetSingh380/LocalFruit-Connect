import FormData from 'form-data'
import {google} from 'googleapis'
import  fs  from 'fs'
import axios from 'axios'


// Locations: 
export const locations = new Map();
// Fruits Data:
export const fruit = {'banana': 0, 'cabbage': 1, 'radish': 2, 'potato': 3, 'capsicum': 4};
const idxToFruits = ['Banana', 'Cabbage', 'Radish', 'Potato', 'Capsicum'];
export const fruits = [];
for(let i=0; i<5; i++){
    fruits.push(new Set());
}


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

const print = (fruits) => {
    for(let i=0; i<5; i++){
        console.log(idxToFruits[i]);
        fruits[i].forEach(element => {
            console.log(element);
        });
    }
}

const assignFruits = (vendor_id, prediction) => {
    const dp = [0, 0, 0, 0, 0];
    console.log(prediction);
    for(let f of prediction){
        let idx=fruit[f];
        dp[idx]=1; 
        if (fruits[idx].has(vendor_id)===false) fruits[idx].add(vendor_id);
    }
    for(let i=0; i<5; i++){
        if (dp[i]===0){
            if (fruits[i].has(vendor_id)) fruits[i].delete(vendor_id);
        }
    }
    print(fruits);
}

const assignLocation = (vendor_id, ans) => {
    locations.set(vendor_id, [...ans]);
    for (let [key, _] of locations) {
        console.log(`${key} => ${locations.get(key)}`);
      }
}

export const setPredictions = async(vendor_id) => {
    try{
        const fileId = vendor_id;
        const localFilePath = './file.jpg';
        const fileContent = await drive.files.get({ fileId, alt: 'media' }, {responseType: 'stream'});
        const dest=fs.createWriteStream(localFilePath);
        fileContent?.data?.pipe(dest);
        console.log('File downloaded successfully.');
        await new Promise((resolve, reject) => {
            dest.on('finish', resolve);
            dest.on('error', reject);
          });
        const prediction = await predictions();
        fs.unlink(localFilePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('File permanently deleted');
        }
        });
        assignFruits(vendor_id, prediction);     
    }
    catch(error){
        console.log(error.message);
    }
}

const predictions = async() => {
    try{
        const fileStream = fs.createReadStream('./file.jpg');
        const formData = new FormData();
        formData.append('file', fileStream);
        const res = await axios.post('http://127.0.0.1:8080/', formData, {headers: {
            'Content-Type': 'multipart/form-data'
            }, timeout: 5000});
        
        return res?.data.prediction;
    }
    catch(error){
        console.log(error);
    }
}

export const setLocation = async(vendor_id) => {
    try {
        const response = await drive.files.get({
          fileId: vendor_id,
          fields: 'name', // Specify the fields you want to retrieve, in this case, 'name'
        });
        const fileName = response?.data.name;
        const ans = fileName.split(',').map(parseFloat);
        assignLocation(vendor_id, ans);
    } 
    catch(error){
        console.log(error.message);        
    }
}