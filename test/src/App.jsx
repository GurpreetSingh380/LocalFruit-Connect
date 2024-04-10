import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

function App() {
  const webcamRef = useRef(null);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  const startCapture = () => {
    const id = setInterval(() => {
      captureScreenshot();
    }, 5000); // Interval in milliseconds (e.g., 5000 ms = 5 seconds)
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
      console.log('Screenshot captured:', screenshot);
    }
  };

  return (
    <div>
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
    </div>
  );
}

export default App;
