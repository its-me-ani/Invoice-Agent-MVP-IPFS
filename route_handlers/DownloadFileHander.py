from flask import request, Response
import codecs
import subprocess
import logging
import re
import json


def ensure_unicode_support_for_pdf(html_content):
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
        head_pattern = re.compile(r'(<head[^>]*>)', re.IGNORECASE)
        if not re.search(r'<meta[^>]*charset[^>]*utf-8[^>]*>', html_content, re.IGNORECASE):
            html_content = head_pattern.sub(
                r'\1\n' + utf8_meta, html_content, count=1)
        # Insert unicode CSS after charset meta or at start of head
        html_content = head_pattern.sub(
            r'\1\n' + unicode_css, html_content, count=1)
    elif '<html>' in html_content.lower():
        # Insert <head> with meta and CSS after <html>
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


def capitalize_first_letter(word):
    if len(word) > 0:
        return word[0].upper() + word[1:]
    else:
        return word  # Return empty string if input is empty


contenttypes = {
    "MSC": "text/plain",
    "MSCE": "text/plain",
    "HTML": "text/html",
    "PDF": "application/pdf",
    "Excel2007": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Excel5": "application/vnd.ms-excel",
    "CSV": "text/plain",
    "ODS": "application/vnd.oasis.opendocument.spreadsheet"
}

suffix = {
    "MSC": "msc",
    "MSCE": "msce",
    "HTML": "html",
    "PDF": "pdf",
    "Excel2007": "xlsx",
    "Excel5": "xls",
    "CSV": "csv",
    "ODS": "ods"
}


def build_wkhtmltopdf_options(settings):
    """
    Build wkhtmltopdf command line options from PDF settings dictionary.
    """
    options = ["--encoding UTF-8", "--enable-local-file-access"]

    # Page size
    paper_size = settings.get('paperSize', 'a4')
    paper_size_map = {
        'a4': 'A4',
        'letter': 'Letter',
        'legal': 'Legal',
        'a3': 'A3',
        'a5': 'A5'
    }
    options.append(f"--page-size {paper_size_map.get(paper_size, 'A4')}")

    # Orientation
    orientation = settings.get('orientation', 'portrait')
    if orientation == 'landscape':
        options.append("--orientation Landscape")
    else:
        options.append("--orientation Portrait")

    # Margins
    margins = settings.get('margins', {})
    top = margins.get('top', 20)
    right = margins.get('right', 20)
    bottom = margins.get('bottom', 20)
    left = margins.get('left', 20)
    options.append(f"--margin-top {top}mm")
    options.append(f"--margin-right {right}mm")
    options.append(f"--margin-bottom {bottom}mm")
    options.append(f"--margin-left {left}mm")

    # Scale (zoom)
    scale = settings.get('scale', 100)
    if scale != 100:
        zoom = scale / 100.0
        options.append(f"--zoom {zoom}")

    # Disable smart shrinking if fit to page is enabled
    if settings.get('fitToPage', False):
        options.append("--disable-smart-shrinking")

    # Print media type for better rendering
    options.append("--print-media-type")

    # JavaScript and images
    options.append("--javascript-delay 500")
    options.append("--no-stop-slow-scripts")

    return " ".join(options)


class DownloadFileHander:
    @staticmethod
    def post():
        type = request.form.get('type')
        content = request.form.get('content')

        if type not in ["MSC", "MSCE", "HTML", "PDF"]:
            fullfname = "excelinterop/tmp/tmp"
            inpfile = fullfname + ".b"

            with codecs.open(inpfile, encoding='utf-8', mode="w") as f:
                f.write(content)
            outfile = fullfname + "." + suffix.get(type, "txt")
            logging.info(outfile)
            logging.info(inpfile)
            cmdname = "excelinterop/export.php"
            writer = capitalize_first_letter(suffix.get(type, "txt"))
            output = subprocess.getoutput(
                f"php {cmdname} {inpfile} {outfile} {writer}")
            logging.info(output)

            with open(outfile, 'rb') as f:
                content = f.read()

        elif type == "PDF":
            logging.info("type is PDF")
            fullfname = "excelinterop/tmp/tmp"
            inpfile = fullfname + ".html"

            # Get PDF settings from the request
            pdf_settings_str = request.form.get('pdfSettings', '{}')
            try:
                pdf_settings = json.loads(pdf_settings_str)
            except json.JSONDecodeError:
                pdf_settings = {}

            logging.info(f"PDF Settings: {pdf_settings}")

            # Ensure proper UTF-8 encoding and emoji font support in the HTML
            content = ensure_unicode_support_for_pdf(content)

            with codecs.open(inpfile, encoding='utf-8', mode="w+") as f:
                f.write(content)

            outfile = fullfname + "." + suffix.get(type, "pdf")
            logging.info(outfile)
            logging.info(inpfile)
            cmdname = "wkhtmltopdf"

            # Build wkhtmltopdf options based on settings
            wkhtmltopdf_options = build_wkhtmltopdf_options(pdf_settings)

            output = subprocess.getoutput(
                f"{cmdname} {wkhtmltopdf_options} {inpfile} {outfile}")
            logging.info(output)

            with open(outfile, 'rb') as f:
                content = f.read()

        else:
            # This assumes the content is directly returned if it's a supported type without conversion
            content = content.encode('utf-8')

        response = Response(content)
        response.headers['Content-Type'] = contenttypes.get(
            type, 'application/octet-stream')
        response.headers[
            'Content-Disposition'] = f'attachment; filename="tmp.{suffix.get(type, "txt")}"'
        response.headers['Cache-Control'] = 'max-age=0'

        return response
