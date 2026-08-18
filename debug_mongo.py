import os
from dotenv import load_dotenv
from pymongo import MongoClient
import json

load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
mongo_db_name = os.getenv("MONGO_DB", "c4gt_storage")

print(f"Connecting to {mongo_uri} DB: {mongo_db_name}")

try:
    client = MongoClient(mongo_uri)
    db = client[mongo_db_name]
    collection = db["storage"]

    count = collection.count_documents({})
    print(f"Total documents in 'storage' collection: {count}")

    print("\nListing some documents (first 10):")
    for doc in collection.find().limit(10):
        print(doc)

    print("\nChecking for 'users' directory:")
    users_path = json.dumps(["home", "users"])
    users_dir = collection.find_one({"_id": users_path})
    if users_dir:
        print("Users directory found:")
        print(users_dir)
    else:
        print("Users directory NOT found")

except Exception as e:
    print(f"Error: {e}")
