import requests

url = "http://127.0.0.1:8080/"
path = 'C:/Users/compaq4/Documents/Intern_Placement/Project/LocalFruit/prediction/your_file.jpg'
files = {'file': open(path, 'rb')}

response = requests.post(url, files=files)

print(response.text)