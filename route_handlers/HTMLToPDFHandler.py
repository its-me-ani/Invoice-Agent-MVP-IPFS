from flask import request, jsonify, send_file, make_response
import logging
import os
import random
import string
import json
import time
import subprocess
import re
from cloud.storage.storage import existsItem, getItem


class HtmlToPdfHandler:
    def __init__(self):
        self.base_path = "excelinterop/tmp/tmp"
        self.preview_path = os.path.join(self.base_path, "preview")

    def exists_in_storage(self, fname):
        return existsItem(fname, "aspiring-pdf-files")

    def get_from_storage(self, fname):
        return getItem(fname, "aspiring-pdf-files")

    def get_random_string(self, size):
        char_set = string.ascii_uppercase + string.digits
        return ''.join(random.sample(char_set, size))

    def ensure_unicode_support(self, html_content):
        """
        Ensures the HTML content has proper UTF-8 charset meta tag and
        emoji-supporting fonts for proper PDF rendering.
        """
        # CSS for emoji and Unicode font support using system fonts
        # These font families support emojis and are commonly available on Linux/Windows/Mac
        unicode_css = '''
        <style>
            * {
                font-family: 'Noto Sans', 'Noto Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 
                             'Apple Color Emoji', 'Twemoji Mozilla', 'EmojiOne Color', 
                             'Android Emoji', sans-serif !important;
            }
        </style>
        '''

        # UTF-8 meta charset tag
        utf8_meta = '<meta charset="UTF-8">'

        # Check if HTML has a <head> tag
        if '<head>' in html_content.lower():
            # Insert after <head> tag
            import re
            head_pattern = re.compile(r'(<head[^>]*>)', re.IGNORECASE)
            if not re.search(r'<meta[^>]*charset[^>]*utf-8[^>]*>', html_content, re.IGNORECASE):
                html_content = head_pattern.sub(
                    r'\1\n' + utf8_meta, html_content, count=1)
            # Insert unicode CSS after charset meta or at start of head
            html_content = head_pattern.sub(
                r'\1\n' + unicode_css, html_content, count=1)
        elif '<html>' in html_content.lower():
            # Insert <head> with meta and CSS after <html>
            import re
            html_pattern = re.compile(r'(<html[^>]*>)', re.IGNORECASE)
            head_insert = f'<head>\n{utf8_meta}\n{unicode_css}\n</head>'
            html_content = html_pattern.sub(
                r'\1\n' + head_insert, html_content, count=1)
        else:
            # Wrap content with proper HTML structure
            html_content = f'''<!DOCTYPE html>
<html>
<head>
{utf8_meta}
{unicode_css}
</head>
<body>
{html_content}
</body>
</html>'''

        return html_content

    def get(self):
        logging.info("in htmltopdf converter get")
        fname = request.args.get('fname')
        action = request.args.get('action', default=None)

        if action == "preview":
            fullfname = os.path.join(self.preview_path, fname)
            inpfile = fullfname + ".pdf"
            logging.info(f"fname={inpfile}")

            if os.path.exists(inpfile):
                logging.info(f"found {fname} on disk")
                return send_file(inpfile, mimetype="application/pdf")
            else:
                return "Not Found", 404

        fullfname = os.path.join(self.base_path, fname)
        inpfile = fullfname + ".pdf"
        logging.info(f"fname={inpfile}")

        if os.path.exists(inpfile):
            logging.info(f"found {fname} on disk")
            return send_file(inpfile, mimetype="application/pdf")
        else:
            data = self.get_from_storage(fname)
            if data:
                logging.info(f"found {fname} in s3")
                response = make_response(data)
                response.headers.set('Content-Type', 'application/pdf')
                return response
            else:
                return "Not Found", 404

    def post(self):
        logging.info("in htmltopdf converter post")
        action = request.form.get('action', default=None)

        if action == "preview":
            while True:
                fname = self.get_random_string(20)
                fullfname = os.path.join(self.preview_path, fname)
                if not os.path.exists(fullfname):
                    break
        else:
            while True:
                fname = self.get_random_string(20)
                fullfname = os.path.join(self.base_path, fname)
                if not os.path.exists(fullfname) and not self.exists_in_storage(fname):
                    break

        if action == "send":
            uuid = request.form.get('uuid', default=None)
            appname = request.form.get('appname', default=None)
            filename = request.form.get('filename', default=None)
            created = time.strftime("%Y:%m:%d %H:%M:%S")
            jsondata = {"uuid": uuid, "appname": appname,
                        "filename": filename, "created": created}
            jsonstr = json.dumps(jsondata)
            jsonfile = fullfname + ".json"
            with open(jsonfile, "w") as f:
                f.write(jsonstr)

        inpfile = fullfname + ".html"
        content = request.form.get('content')

        # Ensure proper UTF-8 encoding and emoji font support in the HTML
        content = self.ensure_unicode_support(content)

        with open(inpfile, "w", encoding="utf-8") as f:
            f.write(content)

        outfile = fullfname + ".pdf"
        logging.info(outfile)
        logging.info(inpfile)
        cmdname = "wkhtmltopdf"
        # Add encoding and other options for proper Unicode/emoji support
        wkhtmltopdf_options = "--encoding UTF-8 --enable-local-file-access"
        subprocess_output = subprocess.getoutput(
            f"{cmdname} {wkhtmltopdf_options} {inpfile} {outfile}")

        pdfurl = f"http://{request.host}/htmltopdf?fname={fname}&action={action}" if action else f"http://{request.host}/htmltopdf?fname={fname}"
        return jsonify(pdfurl=pdfurl, result="ok")
