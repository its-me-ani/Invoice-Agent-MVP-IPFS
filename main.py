from cloud.storage.storage import getFile, listUserFilesOptimized
from flask import jsonify, make_response
from route_handlers.ListHandler import ListHandler
from route_handlers.BulkHandler import BulkHandler
from flask import Flask, g, session, request

import json
from dotenv import load_dotenv
import os

# Route Handlers
from route_handlers.Auth.UserLoginHandler import UserLoginHandler
from route_handlers.Auth.UserRegisterHandler import UserRegisterHandler
from route_handlers.Auth.UserLostPasswordHandler import UserLostPasswordHandler
from route_handlers.Auth.UserLogoutHandler import UserLogoutHandler
from route_handlers.Auth.PWResetHandler import PWResetHandler
from route_handlers.SaveHandler import SaveHandler
from route_handlers.HomeHandler import HomeHandler
from route_handlers.UserSheetHandler import UserSheetHandler
from route_handlers.DownloadFileHander import DownloadFileHander
from route_handlers.ImportHandler import ImportHandler
from route_handlers.HTMLToPDFHandler import HtmlToPdfHandler

# Agent Handlers (from sheet-agent package)
from sheet_agent.agent import AgentHandler, AppMappingHandler

# Command Agent Handler
from command_agent import CommandAgentHandler

# App Agent Handler (Cloud Agent for Invoice App)
from route_handlers.AppAgentHandler import AppAgentHandler
from route_handlers.Auth.AuthApiHandler import AuthApiHandler
from route_handlers.McpAgentHandler import McpAgentHandler
from route_handlers.InvoiceAgentHandler import InvoiceAgentHandler

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, template_folder='templates')
app.secret_key = os.getenv('SECRET_KEY')

app.config.update(
    APP_TITLE=os.getenv('APP_TITLE')
)


@app.context_processor
def inject_app_title():
    return dict(APP_TITLE=app.config['APP_TITLE'])

# Base Handlers


class BaseHandler:

    def get_current_user(self):
        user_json = session.get('user')
        if user_json:
            return json.loads(user_json)
        return None

    def set_current_user(self, user):
        if user:
            session['user'] = json.dumps(user)
        else:
            session.pop('user', None)

# This code runs before every request


@app.before_request
def before_request():
    g.handler = BaseHandler()

# This code runs when app shuts down


# Routes


@app.route('/', methods=['GET'])
def index():
    return HomeHandler.get()


@app.route('/login', methods=['GET'])
def login_get():
    return UserLoginHandler.get()


@app.route('/login', methods=['POST'])
def login_post():
    return UserLoginHandler.post()


@app.route('/register', methods=['GET'])
def register_get():
    return UserRegisterHandler.get()


@app.route('/register', methods=['POST'])
def register_post():
    return UserRegisterHandler.post()


@app.route('/lostpw', methods=['GET'])
def lostpw_get():
    return UserLostPasswordHandler.get()


@app.route('/lostpw', methods=['POST'])
def lostpw_post():
    return UserLostPasswordHandler.post()


@app.route('/logout', methods=['GET'])
def logout_get():
    return UserLogoutHandler.get()


@app.route('/logout', methods=['POST'])
def logout_post():
    return UserLogoutHandler.post()


@app.route('/save', methods=['GET'])
def save_get():
    return SaveHandler.get()


@app.route('/save', methods=['POST'])
def save_post():
    return SaveHandler.post()


@app.route('/usersheet', methods=['POST'])
def usersheet_post():
    return UserSheetHandler.post()


@app.route('/pwreset', methods=['GET'])
def pwreset_get():
    return PWResetHandler.get()


@app.route('/pwreset', methods=['POST'])
def pwreset_post():
    return PWResetHandler.post()


@app.route('/downloadfile', methods=['POST'])
def download_post():
    return DownloadFileHander.post()


@app.route('/import', methods=['GET'])
def import_get():
    return ImportHandler.get()


@app.route('/import', methods=['POST'])
def import_post():
    return ImportHandler.post()


@app.route('/htmltopdf', methods=['GET'])
def import_html_get():
    return HtmlToPdfHandler.get()


@app.route('/htmltopdf', methods=['POST'])
def import_html_post():
    return HtmlToPdfHandler.post()


# Lists API


@app.route('/list/create', methods=['POST'])
def list_create():
    return ListHandler.create_list()


@app.route('/list/delete', methods=['POST'])
def list_delete():
    return ListHandler.delete_list()


@app.route('/list/move', methods=['POST'])
def list_move():
    return ListHandler.move_file()


# Bulk Operations API


@app.route('/api/list-files', methods=['GET'])
def get_list_files():
    return BulkHandler.get_list_files()


@app.route('/api/bulk-download', methods=['POST'])
def bulk_download():
    return BulkHandler.bulk_download()


@app.route('/api/check-duplicates', methods=['POST'])
def check_duplicates():
    return BulkHandler.check_duplicates()


@app.route('/api/bulk-upload', methods=['POST'])
def bulk_upload():
    return BulkHandler.bulk_upload()


@app.route('/api/bulk-delete', methods=['POST'])
def bulk_delete():
    return BulkHandler.bulk_delete()


# User Files API for Quick Access Modal
# OPTIMIZED: Only fetches metadata, not full file content


@app.route('/api/user-files', methods=['GET'])
def get_user_files():
    if 'user' not in session:
        return jsonify(error="Unauthorized"), 401

    user = session['user']

    # Use optimized function that doesn't load file content
    lists_data = listUserFilesOptimized(user)

    # Transform to expected format (list of filenames per list)
    result = {}
    for list_name, files in lists_data.items():
        result[list_name] = sorted([f['fname'] for f in files])

    # Create response with cache headers
    # Cache for 30 seconds to reduce repeated requests on modal toggle
    response = make_response(jsonify(lists=result))
    response.headers['Cache-Control'] = 'private, max-age=30'

    return response


# AI Agent API Routes


@app.route('/api/agent/models', methods=['GET'])
def agent_models():
    return AgentHandler.get_models()


@app.route('/api/agent/session', methods=['POST'])
def agent_create_session():
    return AgentHandler.create_session()


@app.route('/api/agent/chat', methods=['POST'])
def agent_chat():
    return AgentHandler.chat()


@app.route('/api/agent/credentials', methods=['POST'])
def agent_update_credentials():
    return AgentHandler.update_credentials()


@app.route('/api/agent/history', methods=['GET'])
def agent_get_history():
    return AgentHandler.get_session_history()


@app.route('/api/agent/clear', methods=['POST'])
def agent_clear_session():
    return AgentHandler.clear_session()


# App Mapping Agent API Routes

@app.route('/api/agent/appmapping/session', methods=['POST'])
def appmapping_create_session():
    return AppMappingHandler.create_session()


@app.route('/api/agent/appmapping/chat', methods=['POST'])
def appmapping_chat():
    return AppMappingHandler.chat()


@app.route('/api/agent/appmapping/generate', methods=['POST'])
def appmapping_generate():
    """Direct generation endpoint - one-shot app mapping generation from sidebar"""
    return AppMappingHandler.generate()


@app.route('/api/agent/appmapping/clear', methods=['POST'])
def appmapping_clear_session():
    return AppMappingHandler.clear_session()


# Command Executor Agent API Routes

@app.route('/api/agent/command/models', methods=['GET'])
def command_agent_models():
    return CommandAgentHandler.get_models()


@app.route('/api/agent/command/session', methods=['POST'])
def command_agent_create_session():
    return CommandAgentHandler.create_session()


@app.route('/api/agent/command/chat', methods=['POST'])
def command_agent_chat():
    return CommandAgentHandler.chat()


@app.route('/api/agent/command/validate', methods=['POST'])
def command_agent_validate():
    return CommandAgentHandler.validate_commands()


@app.route('/api/agent/command/record-execution', methods=['POST'])
def command_agent_record_execution():
    return CommandAgentHandler.record_execution()


@app.route('/api/agent/command/credentials', methods=['POST'])
def command_agent_update_credentials():
    return CommandAgentHandler.update_credentials()


@app.route('/api/agent/command/history', methods=['GET'])
def command_agent_get_history():
    return CommandAgentHandler.get_session_history()


@app.route('/api/agent/command/clear', methods=['POST'])
def command_agent_clear_session():
    return CommandAgentHandler.clear_session()


# MCP Real-time Agent API Routes

@app.route('/api/agent/mcp/session', methods=['POST'])
def mcp_agent_create_session():
    return McpAgentHandler.create_session()


@app.route('/api/agent/mcp/chat', methods=['POST'])
def mcp_agent_chat():
    return McpAgentHandler.chat()


@app.route('/api/agent/mcp/clear', methods=['POST'])
def mcp_agent_clear_session():
    return McpAgentHandler.clear_session()


@app.route('/api/agent/command/reference', methods=['GET'])
def command_agent_get_reference():
    return CommandAgentHandler.get_command_reference()


# App Agent API Routes (Cloud Agent for Mobile Invoice App)


@app.route('/api/app-agent/credentials', methods=['GET'])
def app_agent_get_credentials():
    return AppAgentHandler.get_credentials()


@app.route('/api/app-agent/credentials', methods=['POST'])
def app_agent_save_credentials():
    return AppAgentHandler.save_credentials()


@app.route('/api/app-agent/chat', methods=['POST'])
def app_agent_chat():
    return AppAgentHandler.chat()


@app.route('/api/app-agent/reports', methods=['GET'])
def app_agent_get_reports():
    return AppAgentHandler.get_reports()


@app.route('/api/app-agent/ipfs/<path:cid>', methods=['GET'])
def app_agent_get_ipfs(cid):
    return AppAgentHandler.get_ipfs_file(cid)


# Invoice Suite Agent API Routes
@app.route('/api/edit-invoice/session', methods=['POST'])
def edit_invoice_create_session():
    return InvoiceAgentHandler.create_session()


@app.route('/api/edit-invoice/chat', methods=['POST'])
def edit_invoice_chat():
    return InvoiceAgentHandler.chat()


@app.route('/api/edit-invoice/session/<session_id>', methods=['GET'])
def edit_invoice_get_session(session_id):
    return InvoiceAgentHandler.get_session_info(session_id)


@app.route('/api/edit-invoice/session/<session_id>', methods=['DELETE'])
def edit_invoice_delete_session(session_id):
    return InvoiceAgentHandler.delete_session(session_id)


# Auth API Routes (for React frontend)
@app.route('/api/auth/register', methods=['POST'])
def auth_api_register():
    return AuthApiHandler.register()

@app.route('/api/auth/login', methods=['POST'])
def auth_api_login():
    return AuthApiHandler.login()

@app.route('/api/auth/logout', methods=['POST'])
def auth_api_logout():
    return AuthApiHandler.logout()

@app.route('/api/auth/status', methods=['GET'])
def auth_api_status():
    return AuthApiHandler.status()


# CORS support for frontend (runs on port 3000)
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin', '')
    allowed_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'capacitor://localhost',
        'ionic://localhost',
    ]
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


# Handle preflight OPTIONS requests for CORS
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 204


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5001)
