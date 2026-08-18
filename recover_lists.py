from cloud.storage.storage import getFileRaw, putItem, pathToString
from pymongo import MongoClient
import os
import json
from dotenv import load_dotenv

load_dotenv()
mongo_client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
mongo_db = mongo_client[os.getenv("MONGO_DB", "c4gt_storage")]
collection = mongo_db["storage"]

def recover_orphans():
    print("Scanning for orphaned lists...")
    # Find all possible user root directories first
    # Or just iterate over all documents that look like user root items?
    # Harder to guess users.
    # Let's target the known session user if possible, or just look for pattern ["home", USER, LISTNAME]
    
    all_docs = collection.find({})
    
    users = set()
    
    # Naive scan to find users from paths
    for doc in all_docs:
        try:
            path = json.loads(doc["_id"])
            if isinstance(path, list) and len(path) >= 2 and path[0] == "home":
                users.add(path[1])
        except:
            pass
            
    print(f"Found users: {users}")
    
    for user in users:
        print(f"Checking user: {user}")
        user_root_path = ["home", user]
        root_raw = getFileRaw(user_root_path)
        
        if not root_raw:
            print(f"  Root not found for {user}")
            continue
            
        root_data = json.loads(root_raw.decode('utf-8'))
        known_children = set(json.loads(root_data["data"]))
        
        # Now find all actual children in DB
        actual_children = set()
        
        # Query for children of this user
        # We look for keys that are ["home", user, "SOME_CHILD"]
        # This is regex search on string key, slightly expensive but okay for repair
        regex_pattern = f'^\\["home", "{user}", "[^"]+"\\]$'
        
        child_docs = collection.find({"_id": {"$regex": regex_pattern}})
        
        updated = False
        for child in child_docs:
            try:
                child_path = json.loads(child["_id"])
                child_name = child_path[-1]
                
                # Verify it is a directory (List)
                child_content = json.loads(child["data"])
                if child_content.get("type") == "dir":
                    if child_name not in known_children:
                        print(f"  Functions ORPHAN LIST found: {child_name}")
                        known_children.add(child_name)
                        updated = True
            except Exception as e:
                print(e)

        if updated:
            print(f"  Updating root for {user} with new list: {list(known_children)}")
            root_data["data"] = json.dumps(list(known_children))
            putItem(pathToString(user_root_path), json.dumps(root_data))
            print("  Recovered successfully.")
        else:
            print("  No orphans found.")

if __name__ == "__main__":
    recover_orphans()
