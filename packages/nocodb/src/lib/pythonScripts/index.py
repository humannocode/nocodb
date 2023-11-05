import sys
import json
import base64


def get_data(input_data):
    try:
        input_data = json.loads(input_data)
        with open("/Users/ruslan_kotliar/Downloads/testImg.tiff", "rb") as file:
            file_content = file.read()
            base64_data = convert_to_base64(file_content)
        return base64_data
    except Exception as e:
        return str(e)


def convert_to_base64(data):
    bytes_base64 = base64.b64encode(data)
    text_base64 = bytes_base64.decode()
    base64_str = "data:image/tiff;base64," + text_base64
    return base64_str


input_data = sys.argv[1]
data = get_data(input_data)

print(data)
sys.stdout.flush()
