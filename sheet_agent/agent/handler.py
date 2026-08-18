"""
AI Agent Handler for SocialCalc MSC Code Generation
Supports Claude (AWS Bedrock) and Gemini models
With MSC Code Validation Loop
"""

import os
import sys
import json
import base64
import logging
import uuid
import subprocess
import re
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from flask import request, session, jsonify, g
import json as json_module  # For parsing session user
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging to show in Flask server console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [AGENT] %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Max validation retries
MAX_VALIDATION_RETRIES = int(os.getenv('MAX_VALIDATION_RETRIES', '3'))

# Path to validator script
# sheet-agent/agent/handler.py -> ../../pipeline-code/validator.js
VALIDATOR_SCRIPT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'pipeline-code', 'validator.js'
)

# In-memory session storage (in production, use Redis or database)
agent_sessions: Dict[str, Dict] = {}


class MSCCodeValidator:
    """Validates and normalizes MSC code using the JavaScript validator"""

    def __init__(self, validator_script: str = None):
        self.validator_script = validator_script or VALIDATOR_SCRIPT_PATH

    def normalize_msc_code(self, msc_code: str) -> str:
        """
        Normalize MSC code to proper SocialCalc save format
        Removes comments, extra spaces, and formats correctly
        """
        logger.info("📝 Normalizing MSC code...")

        lines = msc_code.split('\n')
        normalized_lines = []

        for line in lines:
            # Strip whitespace
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Remove inline comments (but preserve # in hex colors)
            if '#' in line:
                # Check if it's a color definition (e.g., #RRGGBB)
                if not re.search(r'#[0-9A-Fa-f]{6}', line) and not line.startswith('color:'):
                    comment_match = re.search(r'\s+#[^0-9A-Fa-f]', line)
                    if comment_match:
                        line = line[:comment_match.start()].strip()

            # Skip comment-only lines
            if line.startswith('#'):
                continue

            normalized_lines.append(line)

        normalized = '\n'.join(normalized_lines)
        logger.info(
            f"✅ Normalized MSC code: {len(lines)} lines -> {len(normalized_lines)} lines")
        return normalized

    def validate_with_js(self, msc_code: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate MSC code using the JavaScript validator
        """
        logger.info("🔍 Validating MSC code with JavaScript validator...")

        if not os.path.exists(self.validator_script):
            logger.warning(
                f"⚠️ Validator script not found: {self.validator_script}")
            # Return valid if no validator available
            return True, {'valid': True, 'errors': [], 'warnings': []}

        try:
            # Create validation script
            validation_code = f"""
const SocialCalcValidator = require('{self.validator_script}');

const mscCode = {json.dumps(msc_code)};

const validator = new SocialCalcValidator({{
    enableSyntaxLevel: true,
    enableSemanticLevel: true,
    enableLogicLevel: true,
    verbose: false,
    strictMode: false
}});

const result = validator.validate(mscCode);
console.log(JSON.stringify(result));
"""

            # Run validation via Node.js
            result = subprocess.run(
                ['node', '-e', validation_code],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                logger.error(f"❌ Validator script error: {result.stderr}")
                return False, {
                    'valid': False,
                    'errors': [{'message': f'Validator script error: {result.stderr}'}],
                    'errorCount': 1
                }

            # Parse result
            validation_result = json.loads(result.stdout)
            is_valid = validation_result.get('valid', False)
            error_count = validation_result.get('errorCount', 0)
            warning_count = validation_result.get('warningCount', 0)

            if is_valid:
                logger.info(f"✅ Validation PASSED (warnings: {warning_count})")
            else:
                logger.warning(
                    f"❌ Validation FAILED ({error_count} errors, {warning_count} warnings)")
                for err in validation_result.get('errors', [])[:5]:
                    logger.warning(
                        f"   Line {err.get('line', '?')}: {err.get('message', 'Unknown error')}")

            return is_valid, validation_result

        except subprocess.TimeoutExpired:
            logger.error("⏱️ Validation timeout")
            return False, {'valid': False, 'errors': [{'message': 'Validation timeout'}]}
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse validator output: {e}")
            return False, {'valid': False, 'errors': [{'message': f'Parse error: {e}'}]}
        except FileNotFoundError:
            logger.warning("⚠️ Node.js not found, skipping validation")
            return True, {'valid': True, 'errors': [], 'warnings': []}
        except Exception as e:
            logger.error(f"❌ Validation error: {e}")
            return False, {'valid': False, 'errors': [{'message': str(e)}]}

    def validate_and_normalize(self, msc_code: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Normalize and validate MSC code
        """
        normalized_code = self.normalize_msc_code(msc_code)
        is_valid, validation_result = self.validate_with_js(normalized_code)
        return is_valid, normalized_code, validation_result

    def get_error_summary(self, validation_result: Dict[str, Any]) -> str:
        """Get human-readable error summary"""
        if validation_result.get('valid', False):
            return "No errors"

        errors = validation_result.get('errors', [])
        if not errors:
            return "Unknown validation error"

        summary_lines = [f"Found {len(errors)} error(s):"]
        for i, error in enumerate(errors[:5]):
            line = error.get('line', '?')
            level = error.get('level', 'UNKNOWN')
            message = error.get('message', 'Unknown error')
            summary_lines.append(f"  [{level}] Line {line}: {message}")

        if len(errors) > 5:
            summary_lines.append(f"  ... and {len(errors) - 5} more errors")

        return '\n'.join(summary_lines)


# Global validator instance
msc_validator = MSCCodeValidator()


def wrap_msc_in_workbook_format(msc_code_dict: Dict[str, str]) -> Dict[str, Any]:
    """
    Wrap MSC code dictionary into the full workbook JSON format expected by the frontend.

    Input format: {"sheet1": "version:1.5\ncell:B2:t:Hello\n..."}
    Output format: {
        "numsheets": 1,
        "currentid": "sheet1",
        "currentname": "sheet1",
        "sheetArr": {
            "sheet1": {
                "sheetstr": {
                    "savestr": "version:1.5\ncell:B2:t:Hello\n..."
                },
                "name": "sheet1",
                "hidden": "0"
            }
        }
    }
    """
    if not msc_code_dict or not isinstance(msc_code_dict, dict):
        return None

    sheet_names = list(msc_code_dict.keys())
    if not sheet_names:
        return None

    # Build sheetArr
    sheet_arr = {}
    for sheet_name, save_str in msc_code_dict.items():
        if isinstance(save_str, str):
            # Ensure the savestr ends with newline
            if not save_str.endswith('\n'):
                save_str += '\n'

            sheet_arr[sheet_name] = {
                "sheetstr": {
                    "savestr": save_str
                },
                "name": sheet_name,
                "hidden": "0"
            }

    # Build the full workbook structure
    first_sheet = sheet_names[0]
    workbook = {
        "numsheets": len(sheet_names),
        "currentid": first_sheet,
        "currentname": first_sheet,
        "sheetArr": sheet_arr
    }

    return workbook


class AIProvider:
    """Base class for AI providers"""

    def generate(self, messages: List[Dict], system_prompt: str,
                 image_data: Optional[str] = None, model: str = None) -> str:
        raise NotImplementedError


class ClaudeAWSProvider(AIProvider):
    """Claude provider using AWS Bedrock"""

    MODELS = {
        'claude-sonnet-4.6': 'us.anthropic.claude-sonnet-4-6',
        'claude-opus-4.6': 'us.anthropic.claude-opus-4-6-v1',
    }

    def __init__(self, access_key: str, secret_key: str, region: str = 'us-east-1'):
        self.access_key = access_key
        self.secret_key = secret_key
        self.region = region
        self._client = None

    @property
    def client(self):
        if self._client is None:
            try:
                import boto3
                self._client = boto3.client(
                    'bedrock-runtime',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region
                )
            except ImportError:
                raise ImportError(
                    "boto3 is required for Claude AWS provider. Install with: pip install boto3")
        return self._client

    def generate(self, messages: List[Dict], system_prompt: str,
                 image_data: Optional[str] = None, model: str = 'claude-sonnet-4.6') -> str:
        """Generate response using Claude via AWS Bedrock"""

        model_id = self.MODELS.get(model, self.MODELS['claude-sonnet-4.6'])

        # Build messages with potential image
        formatted_messages = []
        for msg in messages:
            content = []

            # Add image if present and this is the last user message
            if msg['role'] == 'user' and image_data and msg == messages[-1]:
                # Extract base64 data from data URL if present
                if image_data.startswith('data:'):
                    # Parse data URL: data:image/png;base64,xxxxx
                    parts = image_data.split(',', 1)
                    if len(parts) == 2:
                        media_type = parts[0].split(':')[1].split(';')[0]
                        b64_data = parts[1]
                    else:
                        media_type = 'image/png'
                        b64_data = image_data
                else:
                    media_type = 'image/png'
                    b64_data = image_data

                content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": b64_data
                    }
                })

            content.append({
                "type": "text",
                "text": msg['content']
            })

            formatted_messages.append({
                "role": msg['role'],
                "content": content
            })

        # Build request body
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 16000,
            "system": system_prompt,
            "messages": formatted_messages
        }

        try:
            response = self.client.invoke_model(
                modelId=model_id,
                body=json.dumps(body),
                contentType='application/json',
                accept='application/json'
            )

            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']

        except Exception as e:
            logger.error(f"Claude AWS error: {e}")
            raise


class GeminiProvider(AIProvider):
    """Gemini provider using Google AI Studio"""

    MODELS = {
        'gemini-3-pro-preview': 'gemini-3-pro-preview',
        'gemini-3-flash-preview': 'gemini-3-flash-preview',
    }

    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate(self, messages: List[Dict], system_prompt: str,
                 image_data: Optional[str] = None, model: str = 'gemini-3-flash-preview') -> str:
        """Generate response using Gemini"""

        try:
            import google.generativeai as genai
        except ImportError:
            raise ImportError(
                "google-generativeai is required. Install with: pip install google-generativeai")

        genai.configure(api_key=self.api_key)

        model_name = self.MODELS.get(
            model, self.MODELS['gemini-3-flash-preview'])
        gen_model = genai.GenerativeModel(
            model_name,
            system_instruction=system_prompt
        )

        # Build conversation history
        history = []
        for msg in messages[:-1]:  # All except last message
            role = 'user' if msg['role'] == 'user' else 'model'
            history.append({
                'role': role,
                'parts': [msg['content']]
            })

        chat = gen_model.start_chat(history=history)

        # Build last message with potential image
        last_msg = messages[-1]
        parts = []

        if image_data and last_msg['role'] == 'user':
            # Handle image
            if image_data.startswith('data:'):
                # Parse data URL
                parts_split = image_data.split(',', 1)
                if len(parts_split) == 2:
                    b64_data = parts_split[1]
                else:
                    b64_data = image_data
            else:
                b64_data = image_data

            image_bytes = base64.b64decode(b64_data)
            parts.append({
                'mime_type': 'image/png',
                'data': image_bytes
            })

        parts.append(last_msg['content'])

        try:
            response = chat.send_message(parts)
            return response.text
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            raise


# Authorized email that can use built-in environment variable credentials
AUTHORIZED_USER_EMAIL = 'invoicecalc.ai@gmail.com'


def get_provider(provider_type: str, credentials: Dict, user_email: str = None) -> AIProvider:
    """
    Get AI provider instance.

    Built-in environment variable credentials are ONLY available when:
    - user_email matches AUTHORIZED_USER_EMAIL

    For all other users, they must provide their own API keys in credentials.
    """

    # Check if user is authorized to use built-in credentials
    is_authorized = user_email and user_email.lower() == AUTHORIZED_USER_EMAIL.lower()

    if provider_type == 'claude':
        # Get credentials - only use env vars if user is authorized
        access_key = credentials.get('aws_access_key', '')
        secret_key = credentials.get('aws_secret_key', '')
        region = credentials.get('aws_region', '')

        # Only fall back to environment variables for authorized user
        if is_authorized:
            if not access_key:
                access_key = os.getenv('AWS_ACCESS_KEY_ID', '')
            if not secret_key:
                secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '')
            if not region:
                region = os.getenv('AWS_REGION', 'us-east-1')
        else:
            if not region:
                region = 'us-east-1'  # Default region is OK for everyone

        # Check if we have valid credentials
        if not access_key or not secret_key:
            raise PermissionError(
                "You do not have access to online models. Please upload your own API key in the settings dialog."
            )

        return ClaudeAWSProvider(
            access_key=access_key,
            secret_key=secret_key,
            region=region
        )
    elif provider_type == 'gemini':
        # Get credentials - only use env vars if user is authorized
        api_key = credentials.get('gemini_api_key', '')

        # Only fall back to environment variables for authorized user
        if is_authorized and not api_key:
            api_key = os.getenv('GEMINI_API_KEY', '')

        # Check if we have valid credentials
        if not api_key:
            raise PermissionError(
                "You do not have access to online models. Please upload your own API key in the settings dialog."
            )

        return GeminiProvider(api_key=api_key)
    else:
        raise ValueError(f"Unknown provider: {provider_type}")


def get_app_mapping_system_prompt(
    current_sheet_code: Optional[str] = None,
    current_sheet_id: Optional[str] = None,
    current_app_mapping: Optional[Dict] = None
) -> str:
    """Build the system prompt for App Mapping generation"""

    sheet_id = current_sheet_id or 'sheet1'

    prompt = f"""You are an expert App Mapping Generator for SocialCalc spreadsheets. Your task is to analyze spreadsheet code and generate JSON app mappings that define how spreadsheet cells map to UI fields.

IMPORTANT: The active sheet ID is "{sheet_id}". When generating mappings, use this as the top-level key for the current sheet.

APP MAPPING STRUCTURE:
The app mapping is a JSON object where:
- Top-level keys are sheet names (e.g., "{sheet_id}")
- Each sheet contains field definitions

FIELD TYPES:
1. **text** - Simple text/number cells
   {{
     "type": "text",
     "cell": "B2",
     "editable": true
   }}

2. **image** - Image cells (logos, signatures, etc.)
   {{
     "type": "image", 
     "cell": "F5",
     "editable": true
   }}

3. **form** - Group of related text fields
   {{
     "type": "form",
     "editable": true,
     "formContent": {{
       "Name": {{"type": "text", "cell": "C5", "editable": true}},
       "Address": {{"type": "text", "cell": "C6", "editable": true}}
     }}
   }}

4. **table** - Repeating rows (like invoice items)
   {{
     "type": "table",
     "unitname": "Item",
     "rows": {{"start": 10, "end": 20}},
     "col": {{
       "Description": {{"type": "text", "name": "Description", "editable": true, "cell": "B"}},
       "Amount": {{"type": "text", "name": "Amount", "editable": true, "cell": "F"}}
     }},
     "editable": true
   }}

ANALYSIS GUIDELINES:
1. Look for cell definitions in the MSC code (cell:XX:t:text, cell:XX:v:value)
2. Identify merged cells (colspan, rowspan) - they often indicate headers or important fields
3. Look for patterns in row numbers to identify table regions
4. Common invoice fields: Logo, Heading, Date, InvoiceNumber, From, BillTo, Items, Total
5. Set "editable": false for calculated fields (formulas)
6. Use meaningful field names based on cell content
7. When modifying an existing mapping, preserve fields the user didn't ask to change

CRITICAL - OUTPUT FORMAT:
You are given ONLY the MSC code for the currently active sheet ("{sheet_id}").
Return ONLY the mapping for this active sheet. Do NOT include mappings for other sheets.
The frontend will automatically merge your returned sheet key into the full app mapping.

Return the JSON wrapped like this:
```json
{{
  "{sheet_id}": {{
    "FieldName": {{...}},
    ...
  }}
}}
```

Also include a brief explanation of the fields you identified and any changes you made.

"""

    if current_app_mapping:
        try:
            mapping_str = json.dumps(current_app_mapping, indent=2)
            prompt += f"""
=== CURRENT FULL APP MAPPING (all sheets, for reference) ===
This is the complete app mapping across ALL sheets. It is shown so you understand the existing structure.
However, you must ONLY return the mapping object for the active sheet "{sheet_id}".
If "{sheet_id}" already exists in this mapping, use it as the starting point and modify as the user requests.
If "{sheet_id}" does not exist yet, create a new mapping for it by analyzing the sheet code below.
Do NOT include other sheet keys in your output — the frontend merges your output automatically.

{mapping_str[:10000]}
"""
        except (TypeError, ValueError):
            pass

    if current_sheet_code:
        prompt += f"""
=== ACTIVE SHEET MSC CODE (Sheet: "{sheet_id}") ===
This is the MSC save string for ONLY the currently active sheet.
Analyze the cell definitions (cell:XX:t:text, cell:XX:v:value, cell:XX:f:formula, etc.) to generate or update the mapping.

{current_sheet_code[:15000]}
"""

    return prompt


# In-memory session storage for app mapping
app_mapping_sessions: Dict[str, Dict] = {}


def get_system_prompt(syntax_context: str, current_sheet_code: Optional[str] = None) -> str:
    """Build the system prompt for MSC generation"""

    prompt = """You are an expert SocialCalc MSC (MultiSheet Calc) code generator. Your task is to generate valid MSC code based on user requests.

CRITICAL RULES:
1. ALWAYS start with 'version:1.5' as the first line
2. Start creating content from cell B2 (leave first row and column as margins)
3. Resize first column to width=10 by default: col:A:w:10
4. Use proper escaping: \\n for newline, \\c for colon in formulas, \\\\ for backslash
5. Define all fonts, colors, borders, layouts, cellformats, valueformats BEFORE referencing them
6. For merged cells, use colspan and rowspan attributes
7. For HTML content (SVG, images), set text format to HTML with valueformat for text-html

OUTPUT FORMAT:
Return ONLY the MSC code wrapped in a JSON object like this:
```json
{
  "sheet1": "version:1.5\\ncell:B2:t:Hello\\n..."
}
```

The JSON should have sheet names as keys and MSC code as values.
For single sheets, use "sheet1" as the key.
For workbooks with multiple sheets, use appropriate sheet names.

"""

    prompt += f"\n{syntax_context}\n"

    if current_sheet_code:
        prompt += f"""
=== CURRENT SHEET CODE ===
The user's current sheet code is provided below. Use this as context for modifications:

{current_sheet_code[:10000]}
"""

    return prompt


class AgentHandler:
    """Handler for AI Agent API endpoints"""

    @staticmethod
    def get_models():
        """Get available AI models"""
        return jsonify({
            'claude': [
                {'id': 'claude-sonnet-4.6', 'name': 'Claude Sonnet 4.6',
                    'provider': 'claude'},
                {'id': 'claude-opus-4.6', 'name': 'Claude Opus 4.6', 'provider': 'claude'},
            ],
            'gemini': [
                {'id': 'gemini-3-pro-preview',
                    'name': 'Gemini 3.0 Pro Preview', 'provider': 'gemini'},
                {'id': 'gemini-3-flash-preview',
                    'name': 'Gemini 3.0 Flash Preview', 'provider': 'gemini'},
            ]
        })

    @staticmethod
    def create_session():
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        agent_sessions[session_id] = {
            'id': session_id,
            'created_at': datetime.now().isoformat(),
            'messages': [],
            'model': 'claude-sonnet-4.6',
            'provider': 'claude',
            'credentials': {}  # User can override default credentials
        }
        return jsonify({'session_id': session_id})

    @staticmethod
    def chat():
        """Process a chat message and generate MSC code with validation loop"""
        from .rag_utils import get_rag_instance

        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        session_id = data.get('session_id')
        message = data.get('message', '')
        image_data = data.get('image')  # Base64 encoded image
        current_sheet_code = data.get('current_sheet_code')
        model = data.get('model', 'claude-sonnet-4.6')

        logger.info("=" * 60)
        logger.info("🚀 NEW AGENT CHAT REQUEST")
        logger.info("=" * 60)
        logger.info(f"📝 Message: {message[:100]}...")
        logger.info(f"🤖 Model: {model}")
        logger.info(f"🖼️ Has Image: {bool(image_data)}")
        logger.info(f"📄 Has Sheet Code: {bool(current_sheet_code)}")

        # Get or create session
        if session_id and session_id in agent_sessions:
            chat_session = agent_sessions[session_id]
            logger.info(f"📋 Using existing session: {session_id[:8]}...")
        else:
            session_id = str(uuid.uuid4())
            chat_session = {
                'id': session_id,
                'created_at': datetime.now().isoformat(),
                'messages': [],
                'model': model,
                'provider': 'claude' if 'claude' in model else 'gemini',
                'credentials': {}
            }
            agent_sessions[session_id] = chat_session
            logger.info(f"📋 Created new session: {session_id[:8]}...")

        # Update model if changed
        chat_session['model'] = model
        chat_session['provider'] = 'claude' if 'claude' in model else 'gemini'

        # Add user message to history
        chat_session['messages'].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })

        try:
            # Get RAG context
            logger.info("📚 Retrieving RAG context...")
            rag = get_rag_instance()
            syntax_context = rag.build_context(message, include_examples=True)
            logger.info(
                f"📚 RAG context retrieved ({len(syntax_context)} chars)")

            # Build system prompt
            system_prompt = get_system_prompt(
                syntax_context, current_sheet_code)

            # Get AI provider - check user authorization for built-in credentials
            credentials = chat_session.get('credentials', {})

            # Get current user email from Flask session
            # Note: session['user'] stores email as plain string, not JSON
            user_email = session.get('user')

            try:
                provider = get_provider(
                    chat_session['provider'], credentials, user_email)
            except PermissionError as e:
                logger.warning(f"🚫 Access denied for user {user_email}: {e}")
                return jsonify(error=str(e)), 403

            logger.info(
                f"🔌 Using provider: {chat_session['provider']} (user: {user_email})")

            # Validation retry loop
            validated_msc_code = None
            final_response_text = None
            validation_attempts = 0
            validation_errors = []

            for attempt in range(MAX_VALIDATION_RETRIES):
                validation_attempts = attempt + 1
                logger.info("-" * 40)
                logger.info(
                    f"🔄 Generation attempt {validation_attempts}/{MAX_VALIDATION_RETRIES}")

                # Prepare messages for the model
                model_messages = [
                    {'role': msg['role'], 'content': msg['content']}
                    for msg in chat_session['messages']
                ]

                # Add validation error feedback if this is a retry
                if validation_errors:
                    error_feedback = f"\n\nYour previous code had validation errors:\n{validation_errors[-1]}\n\nPlease fix these errors and generate valid MSC code."
                    model_messages[-1]['content'] += error_feedback
                    logger.info(f"📝 Added error feedback to prompt")

                # Generate response
                logger.info(f"⏳ Calling {model}...")
                response_text = provider.generate(
                    messages=model_messages,
                    system_prompt=system_prompt,
                    # Only send image on first attempt
                    image_data=image_data if attempt == 0 else None,
                    model=model
                )
                logger.info(
                    f"✅ Response received ({len(response_text)} chars)")

                # Try to extract MSC code from response
                msc_code = None
                msc_code_str = None

                try:
                    # Look for JSON in response
                    json_match = response_text
                    if '```json' in response_text:
                        json_match = response_text.split(
                            '```json')[1].split('```')[0].strip()
                    elif '```' in response_text:
                        json_match = response_text.split(
                            '```')[1].split('```')[0].strip()

                    parsed = json.loads(json_match)
                    if isinstance(parsed, dict):
                        msc_code = parsed
                        # Get the first sheet's code for validation
                        for sheet_name, code in parsed.items():
                            if isinstance(code, str):
                                msc_code_str = code
                                break
                        logger.info(f"📦 Extracted MSC code from JSON response")
                except (json.JSONDecodeError, IndexError) as e:
                    logger.warning(
                        f"⚠️ Could not parse JSON from response: {e}")

                # Validate the MSC code if we extracted any
                if msc_code_str:
                    logger.info("🔍 Starting MSC code validation...")
                    is_valid, normalized_code, validation_result = msc_validator.validate_and_normalize(
                        msc_code_str)

                    if is_valid:
                        logger.info(
                            f"✅ VALIDATION PASSED on attempt {validation_attempts}")
                        # Update the msc_code with normalized version
                        for sheet_name in msc_code:
                            if isinstance(msc_code[sheet_name], str):
                                msc_code[sheet_name] = normalized_code
                                break
                        validated_msc_code = msc_code
                        final_response_text = response_text
                        break
                    else:
                        error_summary = msc_validator.get_error_summary(
                            validation_result)
                        validation_errors.append(error_summary)
                        logger.warning(
                            f"❌ VALIDATION FAILED on attempt {validation_attempts}")
                        logger.warning(f"   {error_summary}")

                        if attempt < MAX_VALIDATION_RETRIES - 1:
                            logger.info("🔄 Retrying with error feedback...")
                        else:
                            logger.error(
                                f"❌ Max retries ({MAX_VALIDATION_RETRIES}) reached")
                            # Use the last response even if invalid
                            validated_msc_code = msc_code
                            final_response_text = response_text
                else:
                    # No MSC code extracted, might be a conversational response
                    logger.info(
                        "💬 No MSC code found in response (may be conversational)")
                    validated_msc_code = msc_code
                    final_response_text = response_text
                    break

            # Build response with validation info
            # Wrap MSC code in workbook format for the frontend
            workbook_format = None
            if validated_msc_code:
                workbook_format = wrap_msc_in_workbook_format(
                    validated_msc_code)
                if workbook_format:
                    logger.info(
                        f"📦 Wrapped MSC code in workbook format ({workbook_format.get('numsheets', 0)} sheet(s))")

            response_data = {
                'session_id': session_id,
                'response': final_response_text,
                'msc_code': validated_msc_code,  # Original format for backward compatibility
                'workbook': workbook_format,     # New workbook format for frontend apply
                'model': model,
                'validation': {
                    'attempts': validation_attempts,
                    'validated': bool(validated_msc_code and not validation_errors) or validation_attempts < MAX_VALIDATION_RETRIES,
                    'errors': validation_errors[-1] if validation_errors else None
                }
            }

            # Add assistant response to history
            chat_session['messages'].append({
                'role': 'assistant',
                'content': final_response_text,
                'msc_code': validated_msc_code,
                'timestamp': datetime.now().isoformat(),
                'validation_attempts': validation_attempts
            })

            logger.info("=" * 60)
            logger.info(
                f"✅ AGENT RESPONSE COMPLETE (attempts: {validation_attempts})")
            logger.info("=" * 60)

            return jsonify(response_data)

        except Exception as e:
            logger.error(f"❌ Chat error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify(error=str(e)), 500

    @staticmethod
    def update_credentials():
        """Update session credentials for AI providers"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        session_id = data.get('session_id')
        credentials = data.get('credentials', {})

        if not session_id or session_id not in agent_sessions:
            return jsonify(error="Invalid session"), 400

        # Update credentials (validate but don't expose)
        valid_keys = ['aws_access_key', 'aws_secret_key',
                      'aws_region', 'gemini_api_key']
        filtered_credentials = {k: v for k,
                                v in credentials.items() if k in valid_keys}

        agent_sessions[session_id]['credentials'] = filtered_credentials

        return jsonify({
            'success': True,
            'message': 'Credentials updated',
            'has_claude': bool(filtered_credentials.get('aws_access_key')),
            'has_gemini': bool(filtered_credentials.get('gemini_api_key'))
        })

    @staticmethod
    def get_session_history():
        """Get chat history for a session"""
        session_id = request.args.get('session_id')

        if not session_id or session_id not in agent_sessions:
            return jsonify(error="Invalid session"), 400

        chat_session = agent_sessions[session_id]

        # Don't expose credentials
        return jsonify({
            'session_id': session_id,
            'messages': chat_session['messages'],
            'model': chat_session['model'],
            'created_at': chat_session['created_at']
        })

    @staticmethod
    def clear_session():
        """Clear a chat session"""
        data = request.get_json()
        session_id = data.get('session_id') if data else None

        if session_id and session_id in agent_sessions:
            del agent_sessions[session_id]

        return jsonify({'success': True})


class AppMappingHandler:
    """Handler for App Mapping Agent API endpoints"""

    @staticmethod
    def create_session():
        """Create a new app mapping chat session"""
        session_id = str(uuid.uuid4())
        app_mapping_sessions[session_id] = {
            'id': session_id,
            'created_at': datetime.now().isoformat(),
            'messages': [],
            'model': 'claude-sonnet-4.6',
            'provider': 'claude',
            'credentials': {}
        }
        return jsonify({'session_id': session_id})

    @staticmethod
    def chat():
        """Process a chat message and generate app mapping"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        session_id = data.get('session_id')
        message = data.get('message', '')
        current_sheet_code = data.get('current_sheet_code')
        current_sheet_id = data.get('current_sheet_id', 'sheet1')
        current_app_mapping = data.get('current_app_mapping')
        model = data.get('model', 'claude-sonnet-4.6')

        logger.info("=" * 60)
        logger.info("🗺️ NEW APP MAPPING CHAT REQUEST")
        logger.info("=" * 60)
        logger.info(f"📝 Message: {message[:100]}...")
        logger.info(f"🤖 Model: {model}")
        logger.info(f"📄 Has Sheet Code: {bool(current_sheet_code)}")
        logger.info(f"📋 Active Sheet ID: {current_sheet_id}")
        logger.info(f"🗺️ Has Existing AppMapping: {bool(current_app_mapping)}")

        # Get or create session
        if session_id and session_id in app_mapping_sessions:
            chat_session = app_mapping_sessions[session_id]
            logger.info(f"📋 Using existing session: {session_id[:8]}...")
        else:
            session_id = str(uuid.uuid4())
            chat_session = {
                'id': session_id,
                'created_at': datetime.now().isoformat(),
                'messages': [],
                'model': model,
                'provider': 'claude' if 'claude' in model else 'gemini',
                'credentials': {}
            }
            app_mapping_sessions[session_id] = chat_session
            logger.info(f"📋 Created new session: {session_id[:8]}...")

        # Update model if changed
        chat_session['model'] = model
        chat_session['provider'] = 'claude' if 'claude' in model else 'gemini'

        # Add user message to history
        chat_session['messages'].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })

        try:
            # Build system prompt with all context
            system_prompt = get_app_mapping_system_prompt(
                current_sheet_code=current_sheet_code,
                current_sheet_id=current_sheet_id,
                current_app_mapping=current_app_mapping
            )

            # Get AI provider - check user authorization for built-in credentials
            credentials = chat_session.get('credentials', {})

            # Get current user email from Flask session
            # Note: session['user'] stores email as plain string, not JSON
            user_email = session.get('user')

            try:
                provider = get_provider(
                    chat_session['provider'], credentials, user_email)
            except PermissionError as e:
                logger.warning(f"🚫 Access denied for user {user_email}: {e}")
                return jsonify(error=str(e)), 403

            logger.info(
                f"🔌 Using provider: {chat_session['provider']} (user: {user_email})")

            # Prepare messages for the model
            model_messages = [
                {'role': msg['role'], 'content': msg['content']}
                for msg in chat_session['messages']
            ]

            # Generate response
            logger.info(f"⏳ Calling {model} for app mapping...")
            response_text = provider.generate(
                messages=model_messages,
                system_prompt=system_prompt,
                image_data=None,
                model=model
            )
            logger.info(f"✅ Response received ({len(response_text)} chars)")

            # Try to extract app mapping JSON from response
            app_mapping = None
            try:
                json_match = response_text
                if '```json' in response_text:
                    json_match = response_text.split(
                        '```json')[1].split('```')[0].strip()
                elif '```' in response_text:
                    json_match = response_text.split(
                        '```')[1].split('```')[0].strip()

                parsed = json.loads(json_match)
                if isinstance(parsed, dict):
                    app_mapping = parsed
                    logger.info(
                        f"📦 Extracted app mapping with {len(parsed)} sheet(s)")
            except (json.JSONDecodeError, IndexError) as e:
                logger.warning(f"⚠️ Could not parse JSON from response: {e}")

            # Estimate tokens
            char_count = len(response_text)
            estimated_tokens = max(1, int(char_count / 4))

            # Build response
            response_data = {
                'session_id': session_id,
                'response': response_text,
                'app_mapping': app_mapping,
                'model': model,
                'generated_tokens': estimated_tokens
            }

            # Add assistant response to history
            chat_session['messages'].append({
                'role': 'assistant',
                'content': response_text,
                'app_mapping': app_mapping,
                'timestamp': datetime.now().isoformat()
            })

            logger.info("=" * 60)
            logger.info("✅ APP MAPPING RESPONSE COMPLETE")
            logger.info("=" * 60)

            return jsonify(response_data)

        except Exception as e:
            logger.error(f"❌ App Mapping chat error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify(error=str(e)), 500

    @staticmethod
    def generate():
        """Generate app mapping directly (one-shot, no chat session required)"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        current_sheet_code = data.get('current_sheet_code')
        model = data.get('model', 'claude-sonnet-4.6')
        message = data.get(
            'message', 'Analyze this sheet and generate an appropriate app mapping JSON.')

        logger.info("=" * 60)
        logger.info("🗺️ APP MAPPING DIRECT GENERATION REQUEST")
        logger.info("=" * 60)
        logger.info(f"🤖 Model: {model}")
        logger.info(f"📄 Has Sheet Code: {bool(current_sheet_code)}")

        if not current_sheet_code:
            return jsonify(error="No sheet code provided"), 400

        try:
            # Build system prompt
            system_prompt = get_app_mapping_system_prompt(current_sheet_code)

            # Get AI provider - check user authorization for built-in credentials
            provider_type = 'claude' if 'claude' in model else 'gemini'

            # Get current user email from Flask session
            # Note: session['user'] stores email as plain string, not JSON
            user_email = session.get('user')

            try:
                provider = get_provider(provider_type, {}, user_email)
            except PermissionError as e:
                logger.warning(f"🚫 Access denied for user {user_email}: {e}")
                return jsonify(error=str(e)), 403

            logger.info(
                f"🔌 Using provider: {provider_type} (user: {user_email})")

            # Single message for direct generation
            model_messages = [
                {'role': 'user', 'content': message}
            ]

            # Generate response
            logger.info(f"⏳ Calling {model} for app mapping generation...")
            response_text = provider.generate(
                messages=model_messages,
                system_prompt=system_prompt,
                image_data=None,
                model=model
            )
            logger.info(f"✅ Response received ({len(response_text)} chars)")

            # Try to extract app mapping JSON from response
            app_mapping = None
            try:
                json_match = response_text
                if '```json' in response_text:
                    json_match = response_text.split(
                        '```json')[1].split('```')[0].strip()
                elif '```' in response_text:
                    json_match = response_text.split(
                        '```')[1].split('```')[0].strip()

                parsed = json.loads(json_match)
                if isinstance(parsed, dict):
                    app_mapping = parsed
                    logger.info(
                        f"📦 Extracted app mapping with {len(parsed)} sheet(s)")
            except (json.JSONDecodeError, IndexError) as e:
                logger.warning(f"⚠️ Could not parse JSON from response: {e}")

            # Build response
            response_data = {
                'response': response_text,
                'app_mapping': app_mapping,
                'model': model
            }

            logger.info("=" * 60)
            logger.info("✅ APP MAPPING GENERATION COMPLETE")
            logger.info("=" * 60)

            return jsonify(response_data)

        except Exception as e:
            logger.error(f"❌ App Mapping generation error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify(error=str(e)), 500

    @staticmethod
    def clear_session():
        """Clear an app mapping chat session"""
        data = request.get_json()
        session_id = data.get('session_id') if data else None

        if session_id and session_id in app_mapping_sessions:
            del app_mapping_sessions[session_id]

        return jsonify({'success': True})
