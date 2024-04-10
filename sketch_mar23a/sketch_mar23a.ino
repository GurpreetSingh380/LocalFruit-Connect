#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include "base64.h" 
#include <ArduinoJson.h>

#define PI 3.14159265358979323846

// Function to convert degrees to radians
double deg2rad(double deg) {
    return (deg * PI / 180);
}

// Function to calculate distance between two GPS coordinates using Haversine formula
double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    double dlat = deg2rad(lat2 - lat1);
    double dlon = deg2rad(lon2 - lon1);
    double a = sin(dlat / 2) * sin(dlat / 2) + cos(deg2rad(lat1)) * cos(deg2rad(lat2)) * sin(dlon / 2) * sin(dlon / 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    double distance = 6371 * c; // Radius of the Earth in kilometers
    return distance;
}

const char *ssid = "Kainth";
const char *password = "Airtel@213";
const int capture_interval = 5;  // 5 seconds
String file_id;
double location[2]; // latitude, longitude
double prevLocation[2];

String urlEncode(String str) {
  String encodedString = "";
  char c;
  char code0;
  char code1;
  char code2;
  for (unsigned int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (c == ' ') {
      encodedString += '+';
    } else if (isalnum(c)) {
      encodedString += c;
    } else {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9) {
        code1 = (c & 0xf) - 10 + 'A';
      }
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9) {
        code0 = c - 10 + 'A';
      }
      code2 = '\0';
      encodedString += '%';
      encodedString += code0;
      encodedString += code1;
      //encodedString+=code2;
    }
    yield();
  }
  return encodedString;
}

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5;         // GPIO5
  config.pin_d1 = 18;        // GPIO18
  config.pin_d2 = 19;        // GPIO19
  config.pin_d3 = 21;        // GPIO21
  config.pin_d4 = 36;        // GPIO36
  config.pin_d5 = 39;        // GPIO39
  config.pin_d6 = 34;        // GPIO34
  config.pin_d7 = 35;        // GPIO35
  config.pin_xclk = 0;       // External clock not used
  config.pin_pclk = 22;      // GPIO22
  config.pin_vsync = 25;     // GPIO25
  config.pin_href = 23;      // GPIO23
  config.pin_sscb_sda = 26;  // GPIO26
  config.pin_sscb_scl = 27;  // GPIO27
  config.pin_pwdn = 32;      // GPIO32
  config.pin_reset = -1;     // Reset pin (set to -1 if not used)
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;  // JPEG format for image capture
  config.frame_size = FRAMESIZE_SVGA;    // UXGA resolution (1600x1200)
  config.jpeg_quality = 12;              // JPEG quality (0-63)
  config.fb_count = 2;                   // Number of frame buffers

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  HTTPClient http;
  String url = "http://192.168.1.5:5000/api/v1/upload_image";
  http.begin(url);
  int httpResponseCode = http.sendRequest("POST");
  if (httpResponseCode > 0) {
    size_t capacity = JSON_OBJECT_SIZE(2) + 30; // Adjust the size based on your JSON structure

    // Allocate memory for the JSON object
    DynamicJsonDocument doc(capacity);

    // Parse the JSON string into the JSON object
    DeserializationError error = deserializeJson(doc, http.getString());

    // Check for parsing errors
    if (error) {
      Serial.print(F("Failed to parse JSON: "));
      Serial.println(error.c_str());
      return;
    }

    // Access the JSON object
    file_id = doc["file_id"].as<String>();
    Serial.println("SetUp completed. Got FILE_ID (a.k.a. vendor_id)");
    Serial.println("id: "+ file_id);
  }
  else{
    Serial.println("SetUp failed!");
  }
  http.end();
  location[0]=10.0;
  location[1]=10.0;
  prevLocation[0]=0.0;
  prevLocation[1]=0.0;
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Capture an image
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Failed to capture image");
      return;
    }

  // Encode image data as base64
  String encodedImage = base64::encode(fb->buf, fb->len);
  Serial.println(encodedImage);
  // Create HTTPClient object
  HTTPClient http;

  // Your server address and endpoint to post the data
  String serverPath = "http://192.168.1.5:5000/api/v2/esp/image";

  // Send the POST request
  http.begin(serverPath);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  
  
  // Prepare the data to be send
  String postData = "file=" +  urlEncode(encodedImage) + "&file_id=" + file_id;

  // Send the POST request and get the response
  int httpResponseCode = http.POST(postData);

  // Check for a successful response
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    // Print the response payload
    String payload = http.getString();
    Serial.println(payload);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  // End the request
  http.end();

  if (haversineDistance(prevLocation[0], prevLocation[1], location[0], location[1]) >= 0.010) {
    String locationString = String(location[0], 6) + "," + String(location[1], 6);
    prevLocation[0]=location[0];
    prevLocation[1]=location[1];
    String server_url="http://192.168.1.5:5000/api/v2/esp/location";
    http.begin(server_url);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    String LocationPostData="name="+locationString+"&file_id="+file_id;
    httpResponseCode = http.POST(LocationPostData);
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);

      // Print the response payload
      String payload = http.getString();
      Serial.println(payload);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }


    // End the request
    http.end();
  }


    // Free the frame buffer
    esp_camera_fb_return(fb);

    // Send the encoded image data over network, save to SPIFFS, etc.
    // For demonstration, we'll just print it over Serial
    Serial.println("Encoded Image:");
    Serial.println(encodedImage);
    for(int i=capture_interval-1; i>=0; i--){
      Serial.println(String(i)+"s remain(s)!");
      delay(1000);  // Adjust for desired periodicity
    }
  }
}
