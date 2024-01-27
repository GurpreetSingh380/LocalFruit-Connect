import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { fabric } from "fabric";
import image from "../images/Banana.jpg";
import { TileLayer, Popup, Marker, MapContainer, useMapEvents } from "react-leaflet";
import "../src/App.css";

const Canvas = () => {
    const [photo, setPhoto] = useState(image);
    const [location, setLocation] = useState([0,0]);
    const fruits = [
      { fruit: "Banana", url: "../images/Banana.jpg" },
      { fruit: "Cabbage", url: "../images/Cabbage.jpg" },
      { fruit: "Potato", url: "../images/Potato.jpg" },
      { fruit: "Radish", url: "../images/Radish.jpg" },
      { fruit: "Capsicum", url: "../images/Capsicum.jpg" },
    ];
    const [id, setId] = useState(0);
  
    useEffect(() => {
      getId();
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#f0ece1",
        width: 448,
        height: 448,
      });
      setCanvas(newCanvas);
      // Cleanup on unmount
      return () => {
        newCanvas.dispose();
      };
    }, []);
  
  
  
    const getId = async() => { 
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/upload_image"
      );
      setId(data?.file_id);
    }
    const handleSubmit = async () => {
      try {
        const photoData = new FormData();
        photoData.append("file", photo);
        photoData.append("file_id", id);
        await axios.post(
          "http://localhost:5000/api/v1/replace_image", photoData
        );
      } catch (error) {
        console.log(error.message);
      }
    };
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const addImageToCanvas = (e) => {
      const imageUrl = e.target.value;
      fabric.Image.fromURL(imageUrl, (img) => {
        img.set({
          left: 224, // Set left offset (default to 0)
          top: 224, // Set top offset (default to 0)
        });
        canvas.add(img);
        canvas.renderAll();
      });
    };
    const handleDeleteImage = () => {
      const selectedObject = canvas.getActiveObject();
  
      if (selectedObject) {
        canvas.remove(selectedObject);
      }
    };
    const handleExportToJpg = async () => {
      if (canvas) {
        const dataUrl = canvas.toDataURL({ format: "jpeg", quality: 0.8 });
        // You can download or use the dataUrl as needed
        setPhoto((prevPhoto) => dataURLtoBlob(dataUrl));
        await handleSubmit();
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
  
    return (
      <div className="main" >
        <div className="d-flex justify-content-center align-items-center flex-column sub-main">
          <h1 className="my-2">Virtual Cart</h1>
          <p><span>Location:</span> {location.map((e)=>e+'  ')}</p>
          <select
            onChange={(e) => {
              addImageToCanvas(e);
            }}
            className="form-select bg-light w-50"
            aria-label="Default select example"
          >
            {fruits.map((f) => {
              return (
                <option key={f.url} value={f.url}>
                  {f.fruit}
                </option>
              );
            })}
          </select>
          <div className="dropdown-menu"></div>
          {/* <button onClick={handleAddImage} className="my-1 mx-1">Add Image</button> */}
          <button onClick={handleDeleteImage} className="btn btn-dark my-1 mx-1">
            Unrack from Cart
          </button>
          <button onClick={handleExportToJpg} className="btn btn-dark my-1">
            Send
          </button>
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
        <div className="d-flex justify-content-center flex-column sub-main">
          <canvas ref={canvasRef} /> 
      </div>
      </div>
    );
}

export default Canvas;

{/* <input
          type="text"
          name={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Filename..."
          className="m-2"
        />{" "}
        <br />
        <label className="btn btn-secondary">
          Upload Photo
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            hidden
          ></input>
        </label>
        {photo && (
          <div className="m-3">
            <button
              onClick={() => {
                handleSubmit();
              }}
              className="btn btn-success"
            >
              Send!
            </button>
          </div>
        )} */}
