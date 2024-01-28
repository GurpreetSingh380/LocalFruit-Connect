import { useState, useEffect, useRef } from "react";
import "./App.css";
import  Canvas  from "../components/Canvas.jsx"
import Camera from "../components/Camera.jsx"
import cam from '../images/camera.png'
import noCam from '../images/withoutcamera.png'

// ROUTE_API: 5b3ce3597851110001cf62481ef60d247e734872a246c96548cfbd76

function App() {
  const [camUse, setCamUse] = useState(null);
  return (
    <div>
      {camUse===null && (
        <>
        <div className="vertical-main">
          <h1>Choose Mode</h1>
          <div className="app-main">
            <div className="icon-bound" onClick={()=>setCamUse(true)}>
              <img src={cam} alt="With Camera" />
            </div>
            <div className="icon-bound" onClick={()=>setCamUse(false)}>
              <img src={noCam} alt="Without Camera" />
            </div>
          </div>
        </div>
        </>
      )}
      {camUse===true && <Camera/>}
      {camUse===false && <Canvas/>}
    </div>

  );
}

export default App;

