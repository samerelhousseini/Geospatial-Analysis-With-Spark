import yaml
import json
import requests
import kafka as kf
import time


producer = kf.KafkaProducer(bootstrap_servers=['localhost:9092'], api_version=(0, 10))

url = 'https://api-v3.mbta.com/vehicles'
headers = {'accept': 'text/event-stream', 'x-api-key': 'YOUR_MBTA_ACCESS_KEY_HERE'}

r = requests.get(url, headers=headers, stream=True)

ev = ""

total_bytes = 0

print("Starting ...")
for line in r.iter_lines():
    # filter out keep-alive new lines
    if line:
        decoded_line = line.decode('utf-8')
        total_bytes = total_bytes + len(decoded_line)
        if decoded_line.startswith('event:'):
            ev = yaml.load(decoded_line, Loader=yaml.FullLoader)
        else:
            try:
                d = {'event':ev['event'], 'data':yaml.load(decoded_line, Loader=yaml.FullLoader)['data']}
                print("Bytes Received:", total_bytes, end='\r')
                producer.send("mbta_msgs", key=bytes(str(int(time.time())), encoding='utf-8'), 
                            value=bytes(json.dumps(d), encoding='utf-8'))
                producer.flush()
            except:
                print("Error")