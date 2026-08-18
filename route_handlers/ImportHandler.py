from flask import request, render_template, make_response
import logging
import string
import random
import subprocess

channels = {}
sessionfileuploads = {}


def get_random_string(size):
    char_set = string.ascii_uppercase + string.digits
    return ''.join(random.sample(char_set, size))


class MessageMixin:
    def __init__(self, session, sheetstr, sheetmscestr):
        self.session = session
        self.sheetstr = sheetstr
        self.sheetmscestr = sheetmscestr


class ImportHandler:
    @staticmethod
    def get():
        session = get_random_string(6)
        logging.info(f"session is {session}")

        resp = make_response(render_template('importcollab.html', entry={
            'fname': 'test',
            'sheetstr': '',
            'sheetmscestr': '',
            'session': session
        }))
        resp.set_cookie('session', session)
        resp.set_cookie('idinsession', '1')

        channels[session] = MessageMixin(session, "", "")
        return resp

    def post():
        session = request.cookies.get('session')
        upload_file = request.files['upload']
        fname = upload_file.filename
        fcontent = upload_file.read()

        # Get file extension (lowercase for comparison)
        fname_lower = fname.lower()

        # Handle MSC, MSCE, and JSON files directly (they contain sheet data)
        if fname_lower.endswith('.msc') or fname_lower.endswith('.msce') or fname_lower.endswith('.json'):
            wbook = fcontent.decode('utf-8')
        else:
            # For other formats (Excel, CSV, etc.), use PHP converter
            fullfname = f"excelinterop/tmp/{fname}"
            with open(fullfname, 'wb') as f:
                f.write(fcontent)

            cmdname = "excelinterop/import.php"
            output = subprocess.getoutput(f"php {cmdname} {fullfname}")

            # Check if the PHP script returned the expected delimiter
            if "$---$" not in output:
                logging.error(
                    f"PHP import script failed for {fname}. Output: {output}")
                return make_response(render_template('importerror.html', entry={
                    'error': f"Failed to import file: {fname}. The file format may not be supported.",
                    'details': output[:500] if output else "No output from converter"
                }))

            i = output.index("$---$")
            wbook = output[i + 5:]

        sessionfileuploads[fname] = wbook

        # Determine if it's an MSCE format (workbook with multiple sheets)
        is_msce = fname_lower.endswith('.msce')

        resp = make_response(render_template('importcollabload.html', entry={
            'fname': fname,
            'sheetmscestr': wbook if is_msce else '',
            'sheetstr': '' if is_msce else wbook,
            'session': session
        }))
        resp.set_cookie('idinsession', '1')

        return resp
