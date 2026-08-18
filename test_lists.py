from cloud.storage.storage import getFile, createDir, createFile, getFileRaw, pathToString
import json

user = "LULI@gmail.com"
list_name = "Default"
user_root_path = ["home", user]
list_path = user_root_path + [list_name]

print(f"Checking root: {user_root_path}")
root = getFile(user_root_path)
if root:
    print(f"Root files: {[f.fname for f in root.files]}")
else:
    print("Root not found!")

print(f"Checking list: {list_path}")
lst = getFile(list_path)
if lst:
    print("List exists.")
else:
    print("List NOT found. Creating...")
    success = createDir(list_path)
    print(f"createDir result: {success}")

    # Re-check root listing
    root_raw = getFileRaw(user_root_path)
    print(f"Root raw data after create: {root_raw}")

    # Check list existence again
    lst = getFile(list_path)
    if lst:
        print("List newly created and found.")
    else:
        print("List still not found after creation.")
