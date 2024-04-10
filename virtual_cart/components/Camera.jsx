import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { TileLayer, Popup, Marker, MapContainer, useMapEvents } from "react-leaflet";
import Webcam from 'react-webcam'
import "../src/App.css";

const Camera = () => {
    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState([0,0]);
    const [id, setId] = useState(0);
  
    useEffect(() => {
      getId();
    }, []);

  const webcamRef = useRef(null);
  const [intervalId, setIntervalId] = useState(null);

  // useEffect(() => {
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [intervalId]);

  const startCapture = () => {
    const id = setInterval(() => {
      handleSubmit();
    }, 10000); // Interval in milliseconds (e.g., 5000 ms = 5 seconds)
    setIntervalId(id);
  };

  const stopCapture = () => {
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const captureScreenshot = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      // Do something with the screenshot (e.g., send it to server, display it)
      // console.log(screenshot);
      setPhoto(screenshot);
    }
  };

    // setInterval(() => {
    //   capture();
    // }, 30000);
  
    // const webcamRef = useRef(null);
    // const capture = useCallback(
    //     () => {
    //       const imageSrc = webcamRef.current.getScreenshot();
    //       const blob = dataURLtoBlob(imageSrc);
    //       setPhoto(blob); handleSubmit();
    //     },
    //     [webcamRef]
    // );

    const getId = async() => { 
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/upload_image"
      );
      setId(data?.file_id);
    }

    const handleSubmit = async () => {
      try {
        const screenshot = webcamRef.current.getScreenshot();
        console.log(screenshot);
        const photoData = new FormData();
        photoData.append("file", dataURLtoBlob(screenshot));
        photoData.append("file_id", id);
        await axios.post(
          "http://localhost:5000/api/v1/replace_image", photoData, 
          {
            headers: {
              "Content-Type": "multipart/form-data" // Ensure correct Content-Type header
            }
          }
        );
      } catch (error) {
        console.log(error.message);
      }
    };
  
    const dataURLtoBlob = (dataURL) => {
      const byteString = atob(dataURL.split(",")[1]);
      const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
  
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
  
      return new Blob([ab], { type: mimeString });
    };
  
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
    const sendLocation = async() => {
      const {data} = await axios.post("http://localhost:5000/api/v1/update_location", {name: location.toString(), file_id: id});
      console.log(data?.message);
    }
  
    useEffect(()=>{
      if (location.toString()!=='0,0'){
        sendLocation();
      }
    }, [location]);
    
    // const videoConstraints = {
    //     width: 512,
    //     height: 512,
    //     facingMode: "user"
    //   };

    return (
      <div className="main" >
        <div className="d-flex justify-content-center align-items-center flex-column sub-main">
          <h1 className="my-2">Virtual Cart</h1>
          <p><span>Location:</span> {location.map((e)=>e+'  ')}</p>
          <button onClick={()=>capture()}>Send</button>
          <MapContainer
            center={[28.560268, 77.096308]}
            zoom={9} 
            style={{ height: "40vh", width: "40vw", border: "1px solid black", borderRadius: "8px" }}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={location}>
              <Popup>Your Current Location</Popup>
            </Marker>
          {/* Use custom component with useMapEvents hook for click events */}
          <ClickEventHandler />
          </MapContainer>
         
        </div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: '100%', maxWidth: '400px' }}
        />
         <div>
          <button onClick={startCapture}>Start Capture</button>
          <button onClick={stopCapture}>Stop Capture</button>
        </div> 
        {/* <div className="d-flex justify-content-center flex-column sub-main">
            <Webcam
            audio={false}
            height={512}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={512}
            videoConstraints={videoConstraints}
        />
      </div>  */}
      </div>
    );
}

export default Camera;
