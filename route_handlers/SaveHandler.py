from flask import render_template, request, redirect, session, jsonify
import logging
from cloud.storage.storage import (
    getFile, createDir, createFile, updateFile,
    listUserFilesOptimized, getFileRaw, pathToString, putItem,
    getFileMetadata, listDirectoryContents, ensureUserHomeExists
)
import json


class SaveHandler:
    @staticmethod
    def get():
        if 'user' not in session:
            return redirect('/')

        user = session['user']
        user_root_path = ["home", user]

        # --- ENSURE USER HOME EXISTS ---
        # This is needed for new users who just registered
        ensureUserHomeExists(user)

        # --- MIGRATION & INIT ---
        # Ensure Default list exists (use metadata check - no full data load)
        default_list_path = user_root_path + ["Default"]
        default_meta = getFileMetadata(default_list_path)

        if not default_meta:
            createDir(default_list_path)
            logging.info("Created Default list")

        # Repair Root: Verify 'Default' is actually in root's children
        # Use listDirectoryContents for efficient check
        root_contents = listDirectoryContents(user_root_path)
        if root_contents:
            root_file_names = [item['fname'] for item in root_contents]

            if "Default" not in root_file_names:
                # It's missing from parent list! Repair it.
                logging.info("Repairing root: adding Default to parent list")
                parent_data_raw = getFileRaw(user_root_path)
                if parent_data_raw:
                    parent_data = json.loads(parent_data_raw.decode('utf-8'))
                    fileslist = json.loads(parent_data["data"])
                    if "Default" not in fileslist:
                        fileslist.append("Default")
                        parent_data["data"] = json.dumps(fileslist)
                        putItem(pathToString(user_root_path),
                                json.dumps(parent_data))

            # Migrate any loose files in root to Default (use metadata, not full data)
            for item in root_contents:
                # Skip directories (lists)
                if item['type'] == 'dir':
                    continue

                item_name = item['fname']
                item_path = user_root_path + [item_name]

                # It's a file in root, migrate to Default
                logging.info(f"Migrating {item_name} to Default")
                from cloud.storage.storage import moveFile
                moveFile(item_path, default_list_path + [item_name])

        # --- FETCH DATA ---
        # Use OPTIMIZED function that doesn't load file content
        # This significantly reduces database load and bandwidth
        lists_data = listUserFilesOptimized(user)

        # Ensure Default is present even if empty (should be created above)
        if "Default" not in lists_data:
            lists_data["Default"] = []

        logging.info(f"Lists data: {lists_data.keys()}")

        return render_template("allusersheets.html", lists=lists_data)

    @staticmethod
    def post():
        if 'user' not in session:
            return redirect('/')

        user = session['user']

        # Save Handler now allows saving to specific list
        fname = request.form.get('fname')
        # Default to 'Default' list
        list_name = request.form.get('list', 'Default')

        logging.info(f"Saving {fname} to list {list_name}")

        sheetstr = request.form.get("data", None)

        # Get appMapping and metadata as separate fields (not part of MSC data)
        app_mapping_str = request.form.get("appMapping", None)
        metadata_str = request.form.get("metadata", None)

        logging.info(
            f"appMapping received: {app_mapping_str[:100] if app_mapping_str else 'None'}")
        logging.info(
            f"metadata received: {metadata_str[:100] if metadata_str else 'None'}")

        # Parse JSON strings to dicts if provided
        app_mapping = None
        metadata = None
        update_app_mapping = False
        update_metadata = False

        if app_mapping_str is not None:
            update_app_mapping = True
            if app_mapping_str and app_mapping_str != 'null' and app_mapping_str != 'undefined':
                try:
                    app_mapping = json.loads(app_mapping_str)
                    logging.info(f"Parsed appMapping successfully")
                except json.JSONDecodeError:
                    logging.warning(
                        f"Failed to parse appMapping JSON: {app_mapping_str[:100]}")

        if metadata_str is not None:
            update_metadata = True
            if metadata_str and metadata_str != 'null' and metadata_str != 'undefined':
                try:
                    metadata = json.loads(metadata_str)
                    logging.info(f"Parsed metadata successfully: {metadata}")
                except json.JSONDecodeError:
                    logging.warning(
                        f"Failed to parse metadata JSON: {metadata_str[:100]}")

        path = ["home", user, list_name, fname]

        # Ensure list exists (just in case)
        list_path = ["home", user, list_name]
        if not getFile(list_path):
            createDir(list_path)

        if sheetstr is not None:
            fileobj = getFile(path)
            if fileobj is None:
                createFile(path, sheetstr, app_mapping, metadata)
            else:
                updateFile(path, sheetstr, app_mapping, metadata,
                           update_app_mapping, update_metadata)

        return jsonify(data="Done")
