import json
import os

from threading import Lock

USERS_JSON = "data/users.json"

file_lock = Lock()

def load_json(path):
    try:
        with file_lock:
            if not os.path.exists(path):
                return {}
            with open(path, "r") as f:
                return json.load(f)
    except json.decoder.JSONDecodeError:
        return {}

def save_json(path, data):
    with file_lock:
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

#TODO: Have users load as objects populated by json for future-proof save if future fields added
def load_users():
    return load_json(USERS_JSON)

def save_users(users):
    save_json(USERS_JSON, users)

