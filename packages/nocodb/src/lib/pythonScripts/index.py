import sys
import json


def get_data(input_data):
    input_data = json.loads(input_data)

    for row in input_data:
        if row["Title"] is not None:
            row["Title"] = row["Title"] + " - UPDATED"

    return input_data


input_data = sys.argv[1]  # accessing args
data = get_data(input_data)

json_data = json.dumps(data)  # converting to json

print(json_data)
sys.stdout.flush()
