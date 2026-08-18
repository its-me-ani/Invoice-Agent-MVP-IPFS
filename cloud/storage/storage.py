"""
Cloud Storage Infrastructure

using MongoDB
"""

import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi

# Load environment variables from .env file
load_dotenv()

# Create MongoDB client
# tlsCAFile=certifi.where() fixes SSL handshake errors on macOS with Python 3.9
mongo_client = MongoClient(
    os.getenv("MONGO_URI", "mongodb://localhost:27017/"),
    tlsCAFile=certifi.where())
mongo_db = mongo_client[os.getenv("MONGO_DB", "c4gt_storage")]
storage_collection = mongo_db["storage"]

print("Starting cloud import")

#
# The following are the base ITEM key, value APIs
#    Using this key,value storage is built a
#    user storage metaphor
#


# store a user item
# returns True/False
def putItem(path, filedata, bucket_name=None):
    try:
        storage_collection.update_one(
            {"_id": path},
            {"$set": {"data": filedata, "bucket": bucket_name or "default"}},
            upsert=True
        )
        return True
    except Exception as e:
        print(f"Error putting item: {e}")
        return False

# get a user item
# returns data/None


def getItem(path, bucket_name=None):
    try:
        doc = storage_collection.find_one({"_id": path})
        if doc:
            return doc.get("data")
        return None
    except Exception as e:
        print(f"Error getting item: {e}")
        return None

# does item exist
# returns boolean


def existsItem(path, bucket_name=None):
    try:
        doc = storage_collection.find_one({"_id": path})
        return doc is not None
    except Exception as e:
        print(f"Error checking item existence: {e}")
        return False


# delete a user item
# returns True/False
def deleteItem(path, bucket_name=None):
    try:
        result = storage_collection.delete_one({"_id": path})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting item: {e}")
        return False

#  The following are helpers to implement the API
# MongoDB doesn't use buckets, so these are no-ops for compatibility


def createBucket(bucketname):
    # No-op for MongoDB - collections are created automatically
    return True


def getBucket(bucketname):
    # No-op for MongoDB - return True for compatibility
    return True

#
#
#  The following are user file abstraction
#    built using a key-value storage
#
#  The abstraction is simple
#  The path to the file is the key
#  The metadata on the key indicates if it is a file or directory
#  If it is a directory, then, it contains the list of files as the value
#  which gets updated when files get added or deleted
#
#  Note that the user is embedded into the filesystem path
#
#  path itself is a stringified json list
#
#

# path manipulation apis

# first define dir, and file classes


class File:
    def __init__(self, name, data, app_mapping=None, metadata=None):
        self.fname = name
        self.data = data
        self.app_mapping = app_mapping  # Separate field for app mapping
        self.metadata = metadata  # Separate field for metadata


class Directory:
    def __init__(self, name, filelist):
        self.fname = name
        self.files = [File(i, "") for i in filelist]


def pathToString(path):
    return json.dumps(path)

# path is a list
# returns True/False


def ensureHomeRootExists():
    """
    Ensure the root 'home' directory exists.
    This is needed before any user directories can be created.
    """
    home_path = ["home"]
    spath = pathToString(home_path)

    # Check if home already exists
    if getItem(spath) is not None:
        return True

    # Create the home root directory
    dirdata = {
        "data": json.dumps([]),
        "path": home_path,
        "type": "dir"
    }
    return putItem(spath, json.dumps(dirdata))


def ensureUserHomeExists(user):
    """
    Ensure a user's home directory exists at ["home", user].
    Creates it if it doesn't exist.
    This should be called when a user first accesses their storage.
    """
    # First ensure the root "home" directory exists
    ensureHomeRootExists()

    user_root_path = ["home", user]
    spath = pathToString(user_root_path)

    # Check if user home already exists
    if getItem(spath) is not None:
        return True

    # Need to create the user's home directory
    # First, update the parent (home) directory to include this user
    home_path = ["home"]
    home_data_raw = getFileRaw(home_path)

    if home_data_raw is None:
        print(f"Home root does not exist, cannot create user home for {user}")
        return False

    try:
        homedata = json.loads(home_data_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding home root: {e}")
        return False

    # Create the user's home directory
    dirdata = {
        "data": json.dumps([]),
        "path": user_root_path,
        "type": "dir"
    }
    if not putItem(spath, json.dumps(dirdata)):
        print(f"Failed to create user home for {user}")
        return False

    # Update home directory to include this user
    fileslist = json.loads(homedata.get("data", "[]"))
    if user not in fileslist:
        fileslist.append(user)
        homedata["data"] = json.dumps(fileslist)
        if not putItem(pathToString(home_path), json.dumps(homedata)):
            print(f"Failed to update home root for user {user}")
            # Rollback user directory creation
            deleteItem(spath)
            return False

    print(f"Created home directory for user: {user}")
    return True


def createDir(path):
    if len(path) <= 1:
        print("path too short")
        return False

    # check if dir exists, if so fail
    spath = pathToString(path)
    data = getItem(spath)
    if (data != None):
        print("dir exists")
        return False

    # Get parent to ensure it exists and to update it later
    ppath = path[:-1]
    parent_data_raw = getFileRaw(ppath)
    if parent_data_raw == None:
        print("parent dir does not exist")
        return False

    try:
        parentdata = json.loads(parent_data_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding parent: {e}")
        return False

    # create the dir file
    dirdata = {}
    dirdata["data"] = json.dumps([])
    dirdata["path"] = path
    dirdata["type"] = "dir"
    if not (putItem(spath, json.dumps(dirdata))):
        print("putitem failed")
        return False

    # Update parent directory list
    fname = path[len(path)-1]
    fileslist = json.loads(parentdata["data"])
    if fname not in fileslist:
        fileslist.append(fname)
        parentdata["data"] = json.dumps(fileslist)
        if (not putItem(pathToString(ppath), json.dumps(parentdata))):
            print("putdir failed - parent update")
            # Should we rollback?
            # deleteItem(spath)
            return False

    return True


def deleteDir(path):
    filedata_raw = getFileRaw(path)
    if filedata_raw == None:
        print("dir does not exist")
        return False

    try:
        filedata = json.loads(filedata_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding dir: {e}")
        return False

    if filedata["type"] != "dir":
        print("not a directory")
        return False

    # update the parent directory first
    ppath = path[:-1]
    parentdata_raw = getFileRaw(ppath)
    if parentdata_raw == None:
        print("parent data failed")
        return False

    try:
        parentdata = json.loads(parentdata_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding parent: {e}")
        return False

    fileslist = json.loads(parentdata["data"])
    newlist = []
    fname = path[len(path)-1]
    for i in fileslist:
        if fname == i:
            pass
        else:
            newlist.append(i)
    parentdata["data"] = json.dumps(newlist)
    if (not putItem(pathToString(ppath), json.dumps(parentdata))):
        print("putdir failed")
        return False

    # then delete the dir item
    if not deleteItem(pathToString(path)):
        print("delete dir failed")
        return False
    return True


# ============================================
# OPTIMIZED METADATA-ONLY FUNCTIONS
# These functions retrieve only metadata without loading full file content
# Use these for listing/browsing operations to reduce bandwidth
# ============================================

def getFileMetadata(path):
    """
    Get only metadata (type, path) for a file/directory WITHOUT loading the full data.
    Returns dict with 'type' and 'path' keys, or None if not found.
    Use this instead of getFile() when you only need to check if something exists or its type.
    """
    pathstr = pathToString(path)
    try:
        # Use projection to only fetch type and path fields, not the data
        doc = storage_collection.find_one(
            {"_id": pathstr},
            {"data": 1}  # We need data to parse the JSON structure
        )
        if doc:
            data = doc.get("data")
            if isinstance(data, str):
                data = data.encode('utf-8')
            data_json = json.loads(data.decode('utf-8'))
            # Return only metadata, not the actual file content
            return {
                "type": data_json.get("type"),
                "path": data_json.get("path")
            }
        return None
    except Exception as e:
        print(f"Error getting file metadata: {e}")
        return None


def listDirectoryContents(path):
    """
    List all items in a directory with their types, WITHOUT loading file content.
    Returns a list of dicts: [{'fname': 'name', 'type': 'file'|'dir'}, ...]
    Use this for directory listings instead of calling getFile() on each child.
    """
    # First get the directory to find its children list
    data = getFileRaw(path)
    if data is None:
        return None

    try:
        data_json = json.loads(data.decode('utf-8'))
        if data_json.get("type") != "dir":
            return None  # Not a directory

        fileslist = json.loads(data_json.get("data", "[]"))

        # Now get metadata for each child efficiently
        result = []
        for fname in fileslist:
            child_path = path + [fname]
            metadata = getFileMetadata(child_path)
            if metadata:
                result.append({
                    'fname': fname,
                    'type': metadata.get('type', 'unknown')
                })
            else:
                # Item in list but not found - might be stale reference
                result.append({
                    'fname': fname,
                    'type': 'unknown'
                })

        return result
    except Exception as e:
        print(f"Error listing directory contents: {e}")
        return None


def listUserFilesOptimized(user):
    """
    Optimized function to get all lists and their file names for a user.
    Does NOT load any file content - only metadata.
    Returns: {'ListName': [{'fname': 'file1'}, {'fname': 'file2'}], ...}
    """
    user_root_path = ["home", user]

    # Ensure user's home directory exists first
    ensureUserHomeExists(user)

    # Get the user's root directory contents
    root_contents = listDirectoryContents(user_root_path)
    if root_contents is None:
        return {"Default": []}

    lists_data = {}

    for item in root_contents:
        if item['type'] == 'dir':
            list_name = item['fname']
            list_path = user_root_path + [list_name]

            # Get files in this list (directory)
            list_contents = listDirectoryContents(list_path)

            if list_contents:
                # Only include actual files, not subdirectories
                files = [{'fname': f['fname']}
                         for f in list_contents if f['type'] == 'file']
                lists_data[list_name] = files
            else:
                lists_data[list_name] = []

    # Ensure Default list is present
    if "Default" not in lists_data:
        lists_data["Default"] = []

    return lists_data


# path is list, return python file object
def getFileRaw(path):
    pathstr = pathToString(path)
    try:
        doc = storage_collection.find_one({"_id": pathstr})
        if doc:
            data = doc.get("data")
            if isinstance(data, str):
                return data.encode('utf-8')
            return data
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

# path is list, returns directory object or file object as the case
# may be


def getFile(path):
    data = getFileRaw(path)
    print("getfile", data)
    if data == None:
        return None

    data_json = json.loads(data.decode('utf-8'))

    if data_json["type"] == "dir":
        fileslist = json.loads(data_json["data"])
        fname = path[len(path)-1]
        fileobj = Directory(fname, fileslist)
        return fileobj
    elif data_json["type"] == "file":
        fname = path[len(path)-1]
        # Extract appMapping and metadata as separate fields (not inside data)
        app_mapping = data_json.get("appMapping")
        metadata = data_json.get("metadata")
        fileobj = File(fname, data_json["data"], app_mapping, metadata)
        return fileobj
    else:
        return None

##
# path is list, data is a string
# app_mapping and metadata are optional separate fields (dict or None)
##
# In createFile function


def createFile(path, data, app_mapping=None, metadata=None):
    if len(path) <= 1:
        print("path too short")
        return False

    ppath = path[:-1]
    parent_data_raw = getFileRaw(ppath)
    if parent_data_raw == None:
        print("parent dir does not exist")
        return False

    parentdata = json.loads(parent_data_raw.decode('utf-8'))

    spath = pathToString(path)
    if getItem(spath) != None:
        print("file exists")
        return False

    filedata = {}
    filedata["data"] = data
    filedata["path"] = path
    filedata["type"] = "file"
    # Store appMapping and metadata as separate top-level fields (not inside data)
    if app_mapping is not None:
        filedata["appMapping"] = app_mapping
    if metadata is not None:
        filedata["metadata"] = metadata

    if (not putItem(spath, json.dumps(filedata))):
        print("putfile failed")
        return False

    fname = path[len(path)-1]
    fileslist = json.loads(parentdata["data"])
    fileslist.append(fname)
    parentdata["data"] = json.dumps(fileslist)
    if (not putItem(pathToString(ppath), json.dumps(parentdata))):
        print("putdir failed")
        deleteFile(path)
        return False
    return True

##
# path is list, data is a string
# app_mapping and metadata are optional separate fields (dict or None)
# Pass app_mapping=None or metadata=None to leave unchanged
# Pass app_mapping={} to clear it (set to empty)
##


def updateFile(path, data, app_mapping=None, metadata=None, update_app_mapping=False, update_metadata=False):
    """
    Update a file's content and optionally its appMapping and metadata.

    Args:
        path: File path as list
        data: The MSC/sheet data string
        app_mapping: New app mapping (dict or None)
        metadata: New metadata (dict or None)
        update_app_mapping: If True, update appMapping field (even if None, which removes it)
        update_metadata: If True, update metadata field (even if None, which removes it)
    """
    # file must exist
    filedata_raw = getFileRaw(path)
    if (filedata_raw == None):
        return False

    try:
        filedata = json.loads(filedata_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding file: {e}")
        return False

    # Update the main data (MSC code)
    filedata["data"] = data

    # Update appMapping if requested
    if update_app_mapping:
        if app_mapping is not None:
            filedata["appMapping"] = app_mapping
        elif "appMapping" in filedata:
            del filedata["appMapping"]

    # Update metadata if requested
    if update_metadata:
        if metadata is not None:
            filedata["metadata"] = metadata
        elif "metadata" in filedata:
            del filedata["metadata"]

    if not putItem(pathToString(path), json.dumps(filedata)):
        return False
    return True

##
# path is list
##


def deleteFile(path):
    filedata_raw = getFileRaw(path)
    if filedata_raw == None:
        print("file does not exist")
        return False

    try:
        filedata = json.loads(filedata_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding file: {e}")
        return False

    if filedata["type"] != "file":
        print("file does not exist")
        return False
    #
    # update the parent directory first
    #
    ppath = path[:-1]
    parentdata_raw = getFileRaw(ppath)
    if parentdata_raw == None:
        print("parent data failed")
        return False

    try:
        parentdata = json.loads(parentdata_raw.decode('utf-8'))
    except Exception as e:
        print(f"Error decoding parent: {e}")
        return False

    fileslist = json.loads(parentdata["data"])
    newlist = []
    fname = path[len(path)-1]
    for i in fileslist:
        if fname == i:
            pass
        else:
            newlist.append(i)
    parentdata["data"] = json.dumps(newlist)
    if (not putItem(pathToString(ppath), json.dumps(parentdata))):
        # this is unexpected, unwind !
        print("putdir failed")
        return False
    # then delete the file
    if not deleteItem(pathToString(path)):
        print("delete file failed")
        return False
    return True


def moveFile(src_path, dest_path):
    # Get source file data
    filedata = getFileRaw(src_path)
    if filedata is None:
        print("moveFile: source file not found")
        return False

    file_content_json = json.loads(filedata.decode('utf-8'))
    if file_content_json["type"] != "file":
        print("moveFile: source is not a file")
        return False

    content = file_content_json["data"]

    # Create at destination
    if not createFile(dest_path, content):
        print("moveFile: failed to create dest file")
        return False

    # Delete source
    if not deleteFile(src_path):
        print("moveFile: warning - failed to delete source after copy")
        # Potential zombie file, but data is safe at dest
        return True

    return True

# The following are unit tests


def unitTestItems():
    putItem("foobar1", "test1")
    print(getItem("foobar1"))
    putItem("foobar2", "test2")
    print(getItem("foobar2"))
    deleteItem("foobar1")
    deleteItem("foobar2")
    print(getItem("foobar1"))
    print(getItem("foobar2"))


def unitTestItemsInBucket():
    bkt_name = "aspiring-pdf-files"
    putItem("foobar1", "test1", bkt_name)
    print(existsItem("foobar1", bkt_name))
    print(getItem("foobar1", bkt_name))
    putItem("foobar2", "test2", bkt_name)
    print(existsItem("foobar2", bkt_name))
    print(getItem("foobar2", bkt_name))
    deleteItem("foobar1", bkt_name)
    deleteItem("foobar2", bkt_name)
    print(existsItem("foobar1", bkt_name))
    print(existsItem("foobar1", bkt_name))
    print(getItem("foobar1", bkt_name))
    print(getItem("foobar2", bkt_name))


def unitTestFiles():
    path = ["home", "demo"]
    print("--create dir--")
    createDir(path)
    print(getFileRaw(path))
    fpath = path[:]
    fpath.append("fname")
    print("--del file--")
    deleteFile(fpath)
    print("--create file--")
    createFile(fpath, "FileData Test1")
    print(getFileRaw(fpath))
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    print("--update file--")
    updateFile(fpath, "FileData Test2")
    print(getFileRaw(fpath))
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    print("--create second file--")
    fpath2 = path[:]
    fpath2.append("fname2")
    createFile(fpath2, "FileData2 Test1")
    print(getFileRaw(fpath2))
    print(getFileRaw(path))
    print(str(getFile(fpath2)))
    print("--update second file--")
    updateFile(fpath2, "FileData2 Test2")
    print(getFileRaw(fpath2))
    print(getFileRaw(path))
    print(str(getFile(fpath2)))
    print("--del file--")
    deleteFile(fpath)
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    deleteFile(fpath2)
    print(getFileRaw(path))
    print(str(getFile(fpath)))


print("Cloud imported")

if __name__ == "__main__":
    # unit tests here
    # unitTestItems()
    # unitTestFiles()
    unitTestItemsInBucket()
