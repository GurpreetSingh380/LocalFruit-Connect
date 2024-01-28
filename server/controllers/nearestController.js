import {locations, fruits, fruit} from '../services.js'
import { distance } from "@turf/turf"
import axios from 'axios'

const print = (fruits) => {
    for(let i=0; i<5; i++){
        console.log(i);
        fruits[i].forEach(element => {
            console.log(element);
        });
    }
    console.log('\n');
}

const apiKey = '5b3ce3597851110001cf62481ef60d247e734872a246c96548cfbd76';
const url= 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
const headers = {
'Authorization': apiKey
}
// const route = object['features'][0]['geometry']['coordinates'];
// const distDur = object['features'][0]['properties']['summary'];  // dictionary

const getLocationData = async(client_location, vendor_location) => {
    try{
    let locs = [client_location, vendor_location];
    locs = reverse(locs);
    const body = {"coordinates": locs};
      const {data} = await axios.post(url, body, {headers});
      if (data){
        const revCoords = data['features'][0]['geometry']['coordinates'];
        const routes = reverse(revCoords);
        const distanceDuration = data['features'][0]['properties']['summary'];
        return [routes, distanceDuration];
      }
    }
    catch(error){
      console.log(error.message);
    }
}
const reverse = (r) =>{
    const ans=[];
        for(let i of r){
            const a = [i[1], i[0]];
            ans.push(a);
    }
    return ans;
}

export const nearestController = async(req, res) => { 
    try{
        let {client_location, fruitsList} = req.body;
        fruitsList = fruitsList.map(str => str.toLowerCase());
        const vendors = [];
        for (let [key, _] of locations) {
            const distanceKm = distance(client_location, [...locations.get(key)]);
            if (distanceKm<=5) vendors.push([distanceKm, key]);
        }
        vendors.sort((a, b) => a[0] - b[0]);
        const ans = []; 
        for(let [distance, vendor_id] of vendors){
            if (distance!==-1){
                const put = {vendor_id, fruit_stocks: [], distance, position: locations.get(vendor_id), location_info: []};
                for(let f of fruitsList){
                    if (fruits[fruit[f]].has(vendor_id) === true){
                        put.fruit_stocks.push(f);
                    }
                }
                const size=put.fruit_stocks.length;
                if (size !== 0){
                    const location_info = await getLocationData(client_location, put.position);
                    put.location_info = location_info;
                    ans.push(put);
                } 
            }
        }
        return res.status(200).send({
            success: true,
            fruitsList: ans
        });
    }
    catch(error){
        console.log(error.message);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error!',
            error: error.message
        })
    }
} 
