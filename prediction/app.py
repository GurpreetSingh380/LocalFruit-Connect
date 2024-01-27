import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.inception_v3 import preprocess_input, decode_predictions
import numpy as np
import cv2
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

model = keras.models.load_model("./recognition_model.h5")

app = Flask(__name__)
CORS(app)



def transform_image(i):
    image_size=(128, 128)
    img=cv2.resize(i, image_size)
    img_array = np.expand_dims(img, axis=0)
    img_array = img_array.astype('float32') / 255.0
    return img_array

def predict(img_array):
    predictions = model.predict(img_array)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class = class_labels[predicted_class_index]
    return predicted_class

class_labels=['banana', 'cabbage', 'capsicum', 'empty', 'potato', 'radish']

@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == "POST":
        file = request.files['file']
        if file is None or file.filename == "":
            return jsonify({"error": "no file!"})
        try:
            image_data = file.read()
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            # image_BGR = cv2.imread(file)
            # image=cv2.cvtColor(image_BGR, cv2.COLOR_BGR2RGB)
            height, width = img.shape[:2]
            # Calculate the center coordinates
            center_x, center_y = width // 2, height // 2

            # Divide the image into four parts
            top_left = img[:center_y, :center_x]
            top_right = img[:center_y, center_x:]
            bottom_left = img[center_y:, :center_x]
            bottom_right = img[center_y:, center_x:]

            images=[top_left, top_right, bottom_left, bottom_right]
            ans=[]
            print(center_x, center_y)
            for i in images:
                tensor = transform_image(i)
                prediction = predict(tensor)
                if prediction!='empty': 
                    ans.append(prediction)
            return jsonify({"prediction": ans})
        except Exception as e:
            return jsonify({"error": str(e)})
    return "OK"



if __name__ == "__main__":
    app.run(debug=True, port=8080)