from flask import request, redirect, session, jsonify, Response
import logging
import json
import io
import zipfile
import os
from cloud.storage.storage import (
    createDir, createFile, updateFile, getFile, getFileRaw,
    listDirectoryContents, pathToString, deleteFile
)


class BulkHandler:
    """
    Handler for bulk upload and download operations
    """

    @staticmethod
    def get_list_files():
        """Get list of files in a specific list with their indices"""
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401

        user = session['user']
        list_name = request.args.get('list_name', 'Default')

        list_path = ["home", user, list_name]
        contents = listDirectoryContents(list_path)

        if contents is None:
            return jsonify(error="List not found"), 404

        # Filter only files and sort
        files = sorted([item['fname']
                       for item in contents if item['type'] == 'file'])

        return jsonify(files=files, count=len(files))

    @staticmethod
    def bulk_download():
        """
        Download files from a list within a specified range.
        If range contains 1 file, download single file.
        If range contains multiple files, download as ZIP.
        """
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401

        user = session['user']
        list_name = request.form.get('list_name', 'Default')
        start_index = int(request.form.get('start_index', 1))
        end_index = int(request.form.get('end_index', 1))

        list_path = ["home", user, list_name]
        contents = listDirectoryContents(list_path)

        if contents is None:
            return jsonify(error="List not found"), 404

        # Filter only files and sort
        files = sorted([item['fname']
                       for item in contents if item['type'] == 'file'])

        if not files:
            return jsonify(error="No files in list"), 400

        # Validate indices (1-based)
        total_files = len(files)
        start_index = max(1, min(start_index, total_files))
        end_index = max(1, min(end_index, total_files))

        if start_index > end_index:
            start_index, end_index = end_index, start_index

        # Get selected files (convert to 0-based index)
        selected_files = files[start_index - 1:end_index]

        if len(selected_files) == 0:
            return jsonify(error="No files selected"), 400

        # Single file download - now downloads as ZIP to include appMapping and metadata
        if len(selected_files) == 1:
            fname = selected_files[0]
            file_path = list_path + [fname]
            file_data_raw = getFileRaw(file_path)

            if file_data_raw is None:
                return jsonify(error="File not found"), 404

            try:
                file_json = json.loads(file_data_raw.decode('utf-8'))
                content = file_json.get('data', '')
                app_mapping = file_json.get('appMapping')
                metadata = file_json.get('metadata')

                # If no appMapping or metadata, just return the single file
                if not app_mapping and not metadata:
                    response = Response(content)
                    response.headers['Content-Type'] = 'application/octet-stream'
                    response.headers['Content-Disposition'] = f'attachment; filename="{fname}.msc"'
                    return response

                # Create ZIP with MSC, appMapping, and metadata
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    # Add MSC file
                    zip_file.writestr(f"{fname}.msc", content)

                    # Add appMapping if exists
                    if app_mapping:
                        zip_file.writestr(
                            f"{fname}.appMapping.json", json.dumps(app_mapping, indent=2))

                    # Add metadata if exists
                    if metadata:
                        zip_file.writestr(
                            f"{fname}.metadata.json", json.dumps(metadata, indent=2))

                zip_buffer.seek(0)
                response = Response(zip_buffer.getvalue())
                response.headers['Content-Type'] = 'application/zip'
                response.headers['Content-Disposition'] = f'attachment; filename="{fname}.zip"'
                return response
            except Exception as e:
                logging.error(f"Error reading file {fname}: {e}")
                return jsonify(error="Error reading file"), 500

        # Multiple files - create ZIP
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for fname in selected_files:
                file_path = list_path + [fname]
                file_data_raw = getFileRaw(file_path)

                if file_data_raw is None:
                    logging.warning(f"File {fname} not found, skipping")
                    continue

                try:
                    file_json = json.loads(file_data_raw.decode('utf-8'))
                    content = file_json.get('data', '')
                    app_mapping = file_json.get('appMapping')
                    metadata = file_json.get('metadata')

                    # Add MSC file
                    zip_file.writestr(f"{fname}.msc", content)

                    # Add appMapping if exists
                    if app_mapping:
                        zip_file.writestr(
                            f"{fname}.appMapping.json", json.dumps(app_mapping, indent=2))

                    # Add metadata if exists
                    if metadata:
                        zip_file.writestr(
                            f"{fname}.metadata.json", json.dumps(metadata, indent=2))
                except Exception as e:
                    logging.error(f"Error reading file {fname}: {e}")
                    continue

        zip_buffer.seek(0)
        response = Response(zip_buffer.getvalue())
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Disposition'] = f'attachment; filename="{list_name}_files.zip"'
        return response

    @staticmethod
    def check_duplicates():
        """
        Check which files from the upload list already exist in the target list.
        Returns list of duplicate filenames.
        """
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401

        user = session['user']
        data = request.get_json()

        if not data:
            return jsonify(error="No data provided"), 400

        list_name = data.get('list_name', 'Default')
        filenames = data.get('filenames', [])

        if not filenames:
            return jsonify(duplicates=[])

        list_path = ["home", user, list_name]
        contents = listDirectoryContents(list_path)

        if contents is None:
            # List doesn't exist, no duplicates
            return jsonify(duplicates=[])

        existing_files = set(item['fname']
                             for item in contents if item['type'] == 'file')

        # Check for duplicates (after removing extensions)
        duplicates = []
        for fname in filenames:
            # Remove .msc or .json extension
            clean_name = fname
            if clean_name.lower().endswith('.msc'):
                clean_name = clean_name[:-4]
            elif clean_name.lower().endswith('.json'):
                clean_name = clean_name[:-5]
            elif clean_name.lower().endswith('.msce'):
                clean_name = clean_name[:-5]

            if clean_name in existing_files:
                duplicates.append({'original': fname, 'clean': clean_name})

        return jsonify(duplicates=duplicates)

    @staticmethod
    def bulk_upload():
        """
        Upload multiple files (up to 300) to a list.
        Removes .msc or .json extensions from filenames.
        Handles duplicate files based on user decision (replace/skip).
        """
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401

        user = session['user']
        list_name = request.form.get('list_name', 'Default')
        duplicate_action = request.form.get(
            'duplicate_action', '{}')  # JSON string

        try:
            duplicate_actions = json.loads(duplicate_action)
        except:
            duplicate_actions = {}

        files = request.files.getlist('files')

        if not files:
            return jsonify(error="No files provided"), 400

        if len(files) > 300:
            return jsonify(error="Maximum 300 files allowed"), 400

        list_path = ["home", user, list_name]

        # Ensure list exists
        if not getFile(list_path):
            createDir(list_path)

        results = {
            'uploaded': [],
            'replaced': [],
            'skipped': [],
            'failed': []
        }

        for file in files:
            try:
                original_name = file.filename
                content = file.read().decode('utf-8')

                # Remove .msc or .json extension
                clean_name = original_name
                if clean_name.lower().endswith('.msc'):
                    clean_name = clean_name[:-4]
                elif clean_name.lower().endswith('.json'):
                    clean_name = clean_name[:-5]
                elif clean_name.lower().endswith('.msce'):
                    clean_name = clean_name[:-5]

                file_path = list_path + [clean_name]

                # Check if file exists
                existing_file = getFile(file_path)

                if existing_file:
                    # File exists, check user decision
                    action = duplicate_actions.get(original_name, 'skip')

                    if action == 'replace':
                        if updateFile(file_path, content):
                            results['replaced'].append(clean_name)
                        else:
                            results['failed'].append(clean_name)
                    else:  # skip
                        results['skipped'].append(clean_name)
                else:
                    # File doesn't exist, create it
                    if createFile(file_path, content):
                        results['uploaded'].append(clean_name)
                    else:
                        results['failed'].append(clean_name)

            except Exception as e:
                logging.error(f"Error uploading file {file.filename}: {e}")
                results['failed'].append(file.filename)

        return jsonify(
            success=True,
            results=results,
            total_uploaded=len(results['uploaded']),
            total_replaced=len(results['replaced']),
            total_skipped=len(results['skipped']),
            total_failed=len(results['failed'])
        )

    @staticmethod
    def bulk_delete():
        """
        Delete all files from a specific list.
        The list itself is preserved, only its contents are deleted.
        """
        if 'user' not in session:
            return jsonify(error="Unauthorized"), 401

        user = session['user']

        try:
            data = request.get_json()
            list_name = data.get('list_name', 'Default')
        except Exception:
            return jsonify(error="Invalid request data"), 400

        list_path = ["home", user, list_name]
        contents = listDirectoryContents(list_path)

        if contents is None:
            return jsonify(error="List not found"), 404

        # Filter only files (not directories)
        files = [item['fname'] for item in contents if item['type'] == 'file']

        if not files:
            return jsonify(success=True, deleted_count=0, message="No files to delete")

        deleted_count = 0
        failed_files = []

        for fname in files:
            try:
                file_path = list_path + [fname]
                if deleteFile(file_path):
                    deleted_count += 1
                else:
                    failed_files.append(fname)
            except Exception as e:
                logging.error(f"Error deleting file {fname}: {e}")
                failed_files.append(fname)

        if failed_files:
            logging.warning(
                f"Failed to delete {len(failed_files)} files: {failed_files}")

        return jsonify(
            success=True,
            deleted_count=deleted_count,
            failed_count=len(failed_files),
            failed_files=failed_files[:10]  # Only return first 10 failed files
        )
