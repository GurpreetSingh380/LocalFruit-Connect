import { useEffect, useState } from "react";
import {
  TileLayer,
  Popup,
  Marker,
  MapContainer,
  useMapEvents,
  Polyline
} from "react-leaflet";
import axios from 'axios'
import L from 'leaflet'
import "../src/App.css";

function Main() {
  const [location, setLocation] = useState([0, 0]);
  const [fruits, setFruits] = useState(new Set());
  const [list, setList] = useState([]);
  const [route, setRoute] = useState([]);
  const host_url = '192.168.1.5:8000';
  const data = [
    { fruit: "Banana", url: "../images/Banana.jpg" },
    { fruit: "Cabbage", url: "../images/Cabbage.jpg" },
    { fruit: "Capsicum", url: "../images/capsicum.jpg" },
    { fruit: "Potato", url: "../images/potato.jpg" },
    { fruit: "Radish", url: "../images/radish.jpg" },
  ];
  const vendorIcon = new L.Icon({
    iconUrl: './images/icon.jpg',
    className: 'vendor-icon',
    iconSize: [32, 32]
  });

  
  // Custom component to handle click events
  function ClickEventHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        // console.log(`Clicked at LatLng: ${lat}, ${lng}`);
        setLocation([lat, lng]);
      },
    });

    return null;
  }

  const toggleFruits = (fruit) => {
    const copyfruits = new Set(fruits);
    if (copyfruits.has(fruit) === false) {
      copyfruits.add(fruit);
    } else copyfruits.delete(fruit);
    setFruits(copyfruits);
  };

  // useEffect(() => {
  //   fruits.forEach((val) => console.log(val));
  //   console.log("\n");
  // }, [fruits]);


  const handleSubmit = async() => {
    const send = [];
    fruits.forEach((value)=>{
      send.push(value);
    });
    setRoute([]);
    try{
      const {data} = await axios.post(`http://${host_url}/api/v2/nearest_vendors/sort_by_counts`, {client_location: location, fruitsList: send});
      if (data?.success){
        setList(data.fruitsList);
        console.log(data);
      }
    }catch(error){
      console.log(error.message);
    }
  }

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([ latitude, longitude ]);
      },
      (error) => {
        console.error('Error getting location:', error.message);
      }
    );
  }, []);
  
  return (
    <div className="main">
      <div className="sub-main left">
        <h2>Client</h2>
        <div><span>Location:</span> {`${location[0]}, ${location[1]}`}</div>
      <MapContainer 
        center={[28.5278208, 77.2538368]}
        zoom={12}
        style={{
          height: "100%",
          width: "100%",
          border: "1px solid black",
          borderRadius: "8px",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={location}>
          <Popup>Your Current Location</Popup>
        </Marker>
        
        <Polyline color="green" positions={route}></Polyline>
        {list?.map((e)=>{
          return (
            <Marker key={e.vendor_id} icon={vendorIcon} 
              eventHandlers={{
                click: () => {setRoute([...e.location_info[0]])},
              }} position={[...e.position]}>
              <Popup>
              {e.fruit_stocks.map((f, idx)=>(
                <><strong>{idx+1}. {f.charAt(0).toUpperCase() + f.slice(1)}</strong><br/> </>
                ))} 
              <br/>
              <span>Distance:</span> {(e.distance).toFixed(2)} km <br/>
              {/* <span>Time to Travel:</span> {(e.location_info[1]['duration']/60).toFixed(0)} mins */}
              </Popup>
            </Marker>
          )
        })}
        {/* Use custom component with useMapEvents hook for click events */}
        <ClickEventHandler />
      </MapContainer>
      </div>
      <div className="sub-main">
        <div className="fruits-container">
          {data?.map((element) => {
            return (
              <div
                key={element.fruit}
                className="fruit-baskets"
                onClick={() => toggleFruits(element.fruit)}
                style={
                  fruits.has(element.fruit)
                    ? { boxShadow: "2px 8px 15px #999790"}
                    : null
                }
              >
                <img src={element.url} alt={element.fruit} />
              </div>
            );
          })}
          <button onClick={handleSubmit}>Get Nearest Vendors</button>
        </div>
      </div>
    </div>
  );
}

export default Main;
