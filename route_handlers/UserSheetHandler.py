from flask import render_template, request, redirect, session, jsonify
import logging
from cloud.storage.storage import deleteFile, getFile, createFile, createDir, getFileMetadata

import string
import random


def get_random_string(size):
    char_set = string.ascii_uppercase + string.digits
    return ''.join(random.sample(char_set, size))


# Default empty spreadsheet content
DEFAULT_SHEET_CONTENT = "version:1.5\n"


class UserSheetHandler:
    @staticmethod
    def post():
        if 'user' not in session:
            return redirect('/')
        user = session['user']

        fname = request.form.get("pagename")
        # Default to 'Default' if not provided (backward compatibility/safety)
        list_name = request.form.get("listname", "Default")
        logging.info(f"Opening {fname} from list {list_name}")
        logging.info(request.form)

        path = ["home", user, list_name, fname]

        # Check if delete parameter is set to delete the file
        if request.form.get("delete") == "yes":
            logging.info(f"Deleting {fname} from {list_name}")
            deleteFile(path)
            return redirect('save')

        session_id = get_random_string(6)
        logging.info(f"Session ID is {session_id}")

        fileobj = getFile(path)

        if fileobj is None:
            # File doesn't exist - create it for edit mode
            if request.form.get("edit") == "yes":
                logging.info(f"File not found: {fname}, creating new file")

                # Ensure the list directory exists
                list_path = ["home", user, list_name]
                if not getFileMetadata(list_path):
                    createDir(list_path)
                    logging.info(f"Created list directory: {list_name}")

                # Create the file with default empty spreadsheet content
                createFile(path, DEFAULT_SHEET_CONTENT)
                fileobj = getFile(path)

                if fileobj is None:
                    logging.error(f"Failed to create file: {fname}")
                    return redirect('/save')
            else:
                logging.info(f"File not found: {fname}")
                return redirect('/save')

        # Fetch all lists for the save dropdown
        root_dir = getFile(["home", user])
        all_lists = []
        if root_dir and hasattr(root_dir, 'files'):
            for f in root_dir.files:
                if hasattr(getFile(["home", user, f.fname]), 'files'):  # Check if directory
                    all_lists.append(f.fname)

        if "Default" not in all_lists:
            all_lists.append("Default")

        # Log the appMapping and metadata being loaded
        logging.info(
            f"Loading file {fname} - appMapping: {fileobj.app_mapping}")
        logging.info(f"Loading file {fname} - metadata: {fileobj.metadata}")

        entry = {
            'fname': fname,
            'list': list_name,  # Pass list name to editor so it knows where to save back
            'sheetstr': fileobj.data,
            'sheetmscestr': "",
            'session': session_id,
            # Include appMapping and metadata as separate fields (not inside sheetstr)
            'appMapping': fileobj.app_mapping,  # Can be None
            'metadata': fileobj.metadata  # Can be None
        }

        # Render template with entry data and list options
        return render_template("importcollabload.html", entry=entry, all_lists=all_lists)
