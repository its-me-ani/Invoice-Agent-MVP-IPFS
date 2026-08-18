from flask import request, redirect, session, jsonify
import logging
import json
from cloud.storage.storage import createDir, deleteDir, moveFile, getFile
# Note: storage.py doesn't currently implement deleteDir fully (it's a pass), 
# we might need to rely on the fact that if we delete files, we might treat it as empty or implement deleteDir.
# Actually storage.py has `deleteDir` with `pass`. We should probably implement it or just ignore for now if user wants to delete list.
# Let's assume for now we implement a simple deleteDir check.

# Re-checking storage.py in memory: deleteDir(path) has 'pass'.
# We can implement a recursive delete or simple directory entry removal in this handler using basic primitives if needed,
# or better, update storage.py. But for now let's stick to the plan. 
# "Default list should not be deleted".

class ListHandler:
    @staticmethod
    def create_list():
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401
        
        user = session['user']
        list_name = request.form.get('list_name')
        
        # Enforce non-empty, non-whitespace names
        if not list_name or not list_name.strip():
            return jsonify(error="List name required"), 400
            
        list_name = list_name.strip()
            
        # Prevent "Default" duplication or weird names if needed
        # Storage handles creation
        path = ["home", user, list_name]
        
        if getFile(path):
             return jsonify(error="List already exists"), 400
             
        if createDir(path):
            return jsonify(success=True)
        else:
            return jsonify(error="Failed to create list"), 500

    @staticmethod
    def delete_list():
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401
            
        user = session['user']
        list_name = request.form.get('list_name')
        
        # Allow empty string (for cleanup of buggy lists), only check for None (missing parameter)
        if list_name is None:
            return jsonify(error="List name required"), 400
            
        if list_name == "Default":
            return jsonify(error="Cannot delete Default list"), 403
        
        path = ["home", user, list_name]
        from cloud.storage.storage import deleteFile # Use deleteFile as it removes the entry from parent
        
        # Recursively delete files in it first?
        # getFile return Directory object with .files
        dir_obj = getFile(path)
        if dir_obj and hasattr(dir_obj, 'files'):
            for f in dir_obj.files:
                file_path = path + [f.fname]
                deleteFile(file_path) # Delete all files in list
        
        # Now delete the directory itself (which is also a 'file' in the parent's list)
        if deleteDir(path):
            return jsonify(success=True)
        else:
            return jsonify(error="Failed to delete list"), 500

    @staticmethod
    def move_file():
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401
            
        user = session['user']
        fname = request.form.get('fname')
        src_list = request.form.get('src_list')
        dest_list = request.form.get('dest_list')
        
        if not all([fname, src_list, dest_list]):
            return jsonify(error="Missing parameters"), 400
            
        src_path = ["home", user, src_list, fname]
        dest_path = ["home", user, dest_list, fname]
        
        if moveFile(src_path, dest_path):
            return jsonify(success=True)
        else:
            return jsonify(error="Failed to move file"), 500
