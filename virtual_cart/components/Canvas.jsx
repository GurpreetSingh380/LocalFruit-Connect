import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { fabric } from "fabric";
import {
  TileLayer,
  Popup,
  Marker,
  MapContainer,
  useMapEvents,
} from "react-leaflet";
import { fruits } from "../fruit_data/data";
import "../src/App.css";

const Canvas = () => {
  const [photo, setPhoto] = useState();
  const [location, setLocation] = useState([0, 0]);
  const [id, setId] = useState(0);
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);
  const host_url = '192.168.1.5:5000';

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

  const getId = async () => {
    const { data } = await axios.post(
      `http://${host_url}/api/v1/upload_image`
    );
    setId(data?.file_id);
  };

  const handleSubmit = async () => {
    try {
      const photoData = new FormData();
      photoData.append("file", photo);
      photoData.append("file_id", id);
      await axios.post(`http://${host_url}/api/v1/replace_image`, photoData);
    } catch (error) {
      console.log(error.message);
    }
  };

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

  const sendLocation = async () => {
    const { data } = await axios.post(
      `http://${host_url}/api/v1/update_location`,
      { name: location.toString(), file_id: id }
    );
    console.log(data?.message);
  };

  useEffect(() => {
    if (location.toString() !== "0,0") {
      sendLocation();
    }
  }, [location]);

  return (
    <div className="main">
      <div className="sub-main">
        <h1 className="my-2">Virtual Cart</h1>
        <p>
          <span>Location:</span> {location.map((e) => e + "  ")}
        </p>
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
        <button onClick={handleDeleteImage} className="btn btn-dark my-1 mx-1">
          Unrack from Cart
        </button>
        <button onClick={handleExportToJpg} className="btn btn-dark my-1">
          Send
        </button>
        <MapContainer
          center={[28.560268, 77.096308]}
          zoom={9}
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
          {/* Use custom component with useMapEvents hook for click events */}
          <ClickEventHandler />
        </MapContainer>
      </div>
      <div className="sub-main">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Canvas;