import {locations, fruits, fruit} from '../services.js'
import { distance } from "@turf/turf"

const print = (fruits) => {
    for(let i=0; i<5; i++){
        console.log(i);
        fruits[i].forEach(element => {
            console.log(element);
        });
    }
    console.log('\n');
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
                const put = {vendor_id, fruit_stocks: [], distance, position: locations.get(vendor_id)};
                for(let f of fruitsList){
                    if (fruits[fruit[f]].has(vendor_id) === true){
                        put.fruit_stocks.push(f);
                    }
                }
                const size=put.fruit_stocks.length;
                if (size !== 0) ans.push(put);
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
