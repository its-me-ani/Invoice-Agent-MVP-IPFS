import os
from dotenv import load_dotenv
from pymongo import MongoClient
import json

load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
mongo_db_name = os.getenv("MONGO_DB", "c4gt_storage")

client = MongoClient(mongo_uri)
db = client[mongo_db_name]
collection = db["storage"]

def print_tree(path_list, level=0):
    indent = "  " * level
    path_str = json.dumps(path_list)
    doc = collection.find_one({"_id": path_str})
    
    if not doc:
        print(f"{indent}[MISSING] {path_list} (Key: {path_str})")
        return

    data_content = doc.get("data")
    try:
        data_json = json.loads(data_content)
        type_of = data_json.get("type", "unknown")
        
        print(f"{indent}- {path_list[-1] if path_list else 'ROOT'} [{type_of}]")
        
        if type_of == "dir":
            children = json.loads(data_json.get("data", "[]"))
            print(f"{indent}  Children: {children}")
            for child in children:
                print_tree(path_list + [child], level + 1)
        else:
            # File
            print(f"{indent}  (File content length: {len(data_json.get('data', ''))})")
            
    except Exception as e:
        print(f"{indent}[ERROR PARSING] {doc} : {e}")

print("--- User Storage Tree ---")
# Assuming user is 'anirudh-sharma' or similar based on session. 
# Let's inspect "home" first to find users.
print_tree(["home"])
