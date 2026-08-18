"""
Command Executor Agent Handler for SocialCalc
Supports Claude (AWS Bedrock) and Gemini models
Generates executable SocialCalc commands based on user requests
"""

import os
import sys
import json
import base64
import logging
import uuid
import re
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from flask import request, jsonify, session
import json as json_module  # For parsing session user
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [CMD_AGENT] %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import AI providers from sheet_agent (reuse existing infrastructure)
try:
    from sheet_agent.agent.handler import (
        AIProvider,
        ClaudeAWSProvider,
        GeminiProvider,
        get_provider
    )
except ImportError:
    # Fallback imports if sheet_agent not available
    logger.warning(
        "Could not import from sheet_agent, defining providers locally")

    class AIProvider:
        """Base class for AI providers"""

        def generate(self, messages: List[Dict], system_prompt: str,
                     image_data: Optional[str] = None, model: str = None) -> str:
            raise NotImplementedError

# In-memory session storage for command agent
command_agent_sessions: Dict[str, Dict] = {}

# Load command reference
COMMAND_REFERENCE_PATH = Path(__file__).parent / "COMMAND_REFERENCE.md"


def load_command_reference() -> str:
    """Load the command reference documentation"""
    if COMMAND_REFERENCE_PATH.exists():
        with open(COMMAND_REFERENCE_PATH, 'r', encoding='utf-8') as f:
            return f.read()
    return ""


COMMAND_REFERENCE = load_command_reference()


class CommandValidator:
    """Validates SocialCalc command syntax"""

    # Valid command patterns
    VALID_COMMANDS = {
        'set': r'^set\s+(\w+|\w+:\w+|[A-Z]+\d*:[A-Z]+\d*|sheet)\s+\w+.*$',
        'copy': r'^copy\s+[A-Z]+\d+:[A-Z]+\d+\s+(all|formulas|formats)$',
        'cut': r'^cut\s+[A-Z]+\d+:[A-Z]+\d+\s+(all|formulas|formats)$',
        'paste': r'^paste\s+[A-Z]+\d+\s+(all|formulas|formats)$',
        'erase': r'^erase\s+[A-Z]+\d+(:[A-Z]+\d+)?\s+(all|formulas|formats)$',
        'filldown': r'^filldown\s+[A-Z]+\d+:[A-Z]+\d+\s+(all|formulas|formats)$',
        'fillright': r'^fillright\s+[A-Z]+\d+:[A-Z]+\d+\s+(all|formulas|formats)$',
        'merge': r'^merge\s+[A-Z]+\d+:[A-Z]+\d+$',
        'unmerge': r'^unmerge\s+[A-Z]+\d+$',
        'insertrow': r'^insertrow\s+[A-Z]+\d+$',
        'insertcol': r'^insertcol\s+[A-Z]+\d+$',
        'deleterow': r'^deleterow\s+[A-Z]+\d+(:[A-Z]+\d+)?$',
        'deletecol': r'^deletecol\s+[A-Z]+\d+(:[A-Z]+\d+)?$',
        'sort': r'^sort\s+[A-Z]+\d+:[A-Z]+\d+\s+[A-Z]+\s+(up|down).*$',
        'name': r'^name\s+(define|desc|delete)\s+\w+.*$',
        'movepaste': r'^movepaste\s+[A-Z]+\d+:[A-Z]+\d+\s+[A-Z]+\d+\s+(all|formulas|formats)$',
        'moveinsert': r'^moveinsert\s+[A-Z]+\d+:[A-Z]+\d+\s+[A-Z]+\d+\s+(all|formulas|formats)$',
        'recalc': r'^recalc$',
        'redisplay': r'^redisplay$',
        'undo': r'^undo$',
        'redo': r'^redo$',
        'clearclipboard': r'^clearclipboard$',
        'loadclipboard': r'^loadclipboard\s+.+$',
    }

    @classmethod
    def validate_command(cls, command: str) -> Tuple[bool, str]:
        """
        Validate a single command
        Returns (is_valid, error_message)
        """
        command = command.strip()
        if not command:
            return True, ""  # Empty commands are OK

        # Get the command type (first word)
        parts = command.split(None, 1)
        if not parts:
            return False, "Empty command"

        cmd_type = parts[0].lower()

        # Check if it's a known command type
        if cmd_type not in cls.VALID_COMMANDS and cmd_type != 'set':
            # 'set' is special - it has many sub-patterns
            return False, f"Unknown command type: {cmd_type}"

        # For 'set' commands, do basic validation
        if cmd_type == 'set':
            if len(parts) < 2:
                return False, "set command requires target and attribute"
            return True, ""

        # For other commands, check against patterns (relaxed validation)
        return True, ""

    @classmethod
    def validate_commands(cls, commands: str) -> Tuple[bool, List[Dict]]:
        """
        Validate multiple commands (newline-separated)
        Returns (all_valid, list of {command, valid, error})
        """
        results = []
        all_valid = True

        for line in commands.split('\n'):
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            is_valid, error = cls.validate_command(line)
            results.append({
                'command': line,
                'valid': is_valid,
                'error': error
            })
            if not is_valid:
                all_valid = False

        return all_valid, results


def get_command_system_prompt(current_sheet_state: Optional[str] = None) -> str:
    """Build the system prompt for command generation"""

    prompt = """You are a SocialCalc Command Executor Agent. Your task is to generate executable SocialCalc commands based on user requests.

CRITICAL RULES:
1. Generate ONLY valid SocialCalc commands - no MSC code, no JavaScript
2. Each command should be on its own line
3. Commands will be executed in order from top to bottom
4. Use proper cell references (e.g., A1, B2:D10)
5. Use proper color format: rgb(r,g,b) where r,g,b are 0-255
6. Font format: [style] [weight] [size] [family] - use * for defaults
7. Do NOT prefix structure/action commands (merge, unmerge, insertrow, insertcol, deleterow, deletecol, sort, name) with "set". Use them directly (e.g., "merge A1:C1", NOT "set A1:C1 merge"; "insertrow A5", NOT "set A5 insertrow").

OUTPUT FORMAT:
Return your response in this exact JSON format:
```json
{
  "explanation": "Brief explanation of what the commands will do",
  "commands": [
    "command1",
    "command2",
    "command3"
  ],
  "warnings": ["any warnings about the operations"]
}
```

AVAILABLE COMMANDS:
"""

    # Add command reference (trimmed for context length)
    if COMMAND_REFERENCE:
        # Include key sections from command reference
        prompt += """
## CRITICAL: Cell Content Commands Syntax

### Text values (MUST include type 't'):
- set [cell/range] text t [text-value]
  Examples:
  - set A1 text t Hello World
  - set B2 text t Invoice #123

### Numeric values (MUST include type 'n'):
- set [cell/range] value n [number]
  Examples:
  - set A1 value n 100
  - set B2 value n 42.5
  - set C1 value n 1500

### Formulas:
- set [cell/range] formula [formula-without-equals]
  Example: set A3 formula SUM(A1:A2)

### Clear cell:
- set [cell/range] empty

## Formatting Commands
- set [cell/range] bt/br/bb/bl [border] - Set borders (e.g., 1px solid rgb(0,0,0))
- set [cell/range] color rgb(r,g,b) - Set text color
- set [cell/range] bgcolor rgb(r,g,b) - Set background color
- set [cell/range] font [style weight size family] - Set font (use * for defaults)
  Example: set A1 font * bold 14pt Arial
- set [cell/range] cellformat [left/center/right] - Set horizontal alignment
- set [cell/range] nontextvalueformat [format] - Number format (#,##0.00, $#,##0, 0%)
- set [cell/range] textvalueformat [format] - Text format (text-html, text-plain)

## Column/Row Commands
- set [col] width [pixels] - Set column width (MUST use 'width' keyword!)
  Example: set A width 120
  Example: set B width 150
- set [row] height [pixels] - Set row height
  Example: set 1 height 30

## Edit Commands
- copy [range] all/formulas/formats
- cut [range] all/formulas/formats  
- paste [cell] all/formulas/formats
- erase [range] all/formulas/formats
- filldown [range] all/formulas/formats
- fillright [range] all/formulas/formats

## Structure Commands
- merge [range] - Merge cells (e.g., merge A1:C1)
- unmerge [cell] - Unmerge cells
- insertrow [cell] - Insert row at cell position
- insertcol [cell] - Insert column at cell position
- deleterow [cell/range] - Delete row(s)
- deletecol [cell/range] - Delete column(s)

## Other Commands
- recalc - Recalculate formulas
- redisplay - Refresh display
- undo - Undo last action
- name define [name] [definition] - Define named range

## CORRECT Examples:

Setting up a header with data:
```json
{
  "explanation": "Creating header row with data",
  "commands": [
    "set A1 text t Name",
    "set B1 text t Age",
    "set C1 text t Salary",
    "set A2 text t John Smith",
    "set B2 value n 28",
    "set C2 value n 75000",
    "set A1:C1 font * bold * *",
    "set A1:C1 bgcolor rgb(70,130,180)",
    "set A1:C1 color rgb(255,255,255)",
    "set A1:C1 cellformat center",
    "set A width 120",
    "set B width 80",
    "set C width 100"
  ]
}
```

Adding borders to a table:
```json
{
  "explanation": "Adding borders around table",
  "commands": [
    "set A1:D10 bt 1px solid rgb(200,200,200)",
    "set A1:D10 bb 1px solid rgb(200,200,200)",
    "set A1:D10 bl 1px solid rgb(200,200,200)",
    "set A1:D10 br 1px solid rgb(200,200,200)"
  ]
}
```

## WRONG vs CORRECT:
- WRONG: set A1 text Name → CORRECT: set A1 text t Name
- WRONG: set A1 value 100 → CORRECT: set A1 value n 100  
- WRONG: set A 120 → CORRECT: set A width 120
"""

    if current_sheet_state:
        prompt += f"""
=== CURRENT SHEET STATE ===
The current sheet has the following data (MSC format excerpt):
{current_sheet_state[:8000]}

Use this context to understand what cells exist and their current values when generating commands.
"""

    return prompt


class CommandAgentHandler:
    """Handler for Command Executor Agent API endpoints"""

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
        """Create a new command agent chat session"""
        session_id = str(uuid.uuid4())
        command_agent_sessions[session_id] = {
            'id': session_id,
            'created_at': datetime.now().isoformat(),
            'messages': [],
            'model': 'claude-sonnet-4.6',
            'provider': 'claude',
            'credentials': {},
            'command_history': []  # Track executed commands
        }
        logger.info(f"📋 Created new command session: {session_id[:8]}...")
        return jsonify({'session_id': session_id})

    @staticmethod
    def chat():
        """Process a chat message and generate commands"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        session_id = data.get('session_id')
        message = data.get('message', '')
        current_sheet_state = data.get('current_sheet_state')
        model = data.get('model', 'claude-sonnet-4.6')
        image_data = data.get('image')

        logger.info("=" * 60)
        logger.info("🎮 NEW COMMAND AGENT REQUEST")
        logger.info("=" * 60)
        logger.info(f"📝 Message: {message[:100]}...")
        logger.info(f"🤖 Model: {model}")
        logger.info(f"📄 Has Sheet State: {bool(current_sheet_state)}")

        # Get or create session
        if session_id and session_id in command_agent_sessions:
            chat_session = command_agent_sessions[session_id]
            logger.info(f"📋 Using existing session: {session_id[:8]}...")
        else:
            session_id = str(uuid.uuid4())
            chat_session = {
                'id': session_id,
                'created_at': datetime.now().isoformat(),
                'messages': [],
                'model': model,
                'provider': 'claude' if 'claude' in model else 'gemini',
                'credentials': {},
                'command_history': []
            }
            command_agent_sessions[session_id] = chat_session
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
            # Build system prompt
            system_prompt = get_command_system_prompt(current_sheet_state)

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
            logger.info(f"⏳ Calling {model} for command generation...")
            response_text = provider.generate(
                messages=model_messages,
                system_prompt=system_prompt,
                image_data=image_data,
                model=model
            )
            logger.info(f"✅ Response received ({len(response_text)} chars)")

            # Parse commands from response
            commands = []
            explanation = ""
            warnings = []
            raw_response = response_text

            try:
                # Extract JSON from response
                json_match = response_text
                if '```json' in response_text:
                    json_match = response_text.split(
                        '```json')[1].split('```')[0].strip()
                elif '```' in response_text:
                    json_match = response_text.split(
                        '```')[1].split('```')[0].strip()

                parsed = json.loads(json_match)
                if isinstance(parsed, dict):
                    commands = parsed.get('commands', [])
                    explanation = parsed.get('explanation', '')
                    warnings = parsed.get('warnings', [])
                    logger.info(f"📦 Extracted {len(commands)} commands")
            except (json.JSONDecodeError, IndexError) as e:
                logger.warning(f"⚠️ Could not parse JSON from response: {e}")
                # Try to extract commands directly from text
                lines = response_text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#') and not line.startswith('//'):
                        # Check if it looks like a command
                        if any(line.startswith(cmd) for cmd in ['set ', 'copy ', 'cut ', 'paste ',
                                                                'erase ', 'merge ', 'unmerge ', 'insert', 'delete', 'fill',
                                                                'sort ', 'name ', 'recalc', 'redisplay', 'undo', 'redo']):
                            commands.append(line)
                if commands:
                    explanation = "Extracted commands from response"

            # Validate commands
            validation_results = []
            if commands:
                all_valid, validation_results = CommandValidator.validate_commands(
                    '\n'.join(commands))
                logger.info(
                    f"✓ Validation: {all_valid}, {len(validation_results)} commands checked")

            # Estimate tokens
            char_count = len(response_text)
            estimated_tokens = max(1, int(char_count / 4))

            # Build response
            response_data = {
                'session_id': session_id,
                'response': response_text,
                'explanation': explanation,
                'commands': commands,
                'warnings': warnings,
                'validation': validation_results,
                'model': model,
                'generated_tokens': estimated_tokens
            }

            # Add assistant response to history
            chat_session['messages'].append({
                'role': 'assistant',
                'content': response_text,
                'commands': commands,
                'timestamp': datetime.now().isoformat()
            })

            logger.info("=" * 60)
            logger.info(
                f"✅ COMMAND AGENT RESPONSE COMPLETE ({len(commands)} commands)")
            logger.info("=" * 60)

            return jsonify(response_data)

        except Exception as e:
            logger.error(f"❌ Command Agent chat error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify(error=str(e)), 500

    @staticmethod
    def validate_commands():
        """Validate commands without executing"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        commands = data.get('commands', '')

        if isinstance(commands, list):
            commands = '\n'.join(commands)

        all_valid, results = CommandValidator.validate_commands(commands)

        return jsonify({
            'valid': all_valid,
            'results': results
        })

    @staticmethod
    def record_execution():
        """Record that commands were executed (for history tracking)"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        session_id = data.get('session_id')
        commands = data.get('commands', [])
        success = data.get('success', True)

        if session_id and session_id in command_agent_sessions:
            chat_session = command_agent_sessions[session_id]
            chat_session['command_history'].append({
                'commands': commands,
                'success': success,
                'timestamp': datetime.now().isoformat()
            })
            logger.info(
                f"📝 Recorded execution of {len(commands)} commands (success: {success})")

        return jsonify({'success': True})

    @staticmethod
    def get_session_history():
        """Get chat history for a session"""
        session_id = request.args.get('session_id')

        if not session_id or session_id not in command_agent_sessions:
            return jsonify(error="Invalid session"), 400

        chat_session = command_agent_sessions[session_id]

        return jsonify({
            'session_id': session_id,
            'messages': chat_session['messages'],
            'command_history': chat_session['command_history'],
            'model': chat_session['model'],
            'created_at': chat_session['created_at']
        })

    @staticmethod
    def clear_session():
        """Clear a chat session"""
        data = request.get_json()
        session_id = data.get('session_id') if data else None

        if session_id and session_id in command_agent_sessions:
            del command_agent_sessions[session_id]
            logger.info(f"🗑️ Cleared session: {session_id[:8]}...")

        return jsonify({'success': True})

    @staticmethod
    def get_command_reference():
        """Get the command reference documentation"""
        return jsonify({
            'reference': COMMAND_REFERENCE,
            'commands': list(CommandValidator.VALID_COMMANDS.keys())
        })

    @staticmethod
    def update_credentials():
        """Update session credentials for AI providers"""
        data = request.get_json()
        if not data:
            return jsonify(error="No data provided"), 400

        session_id = data.get('session_id')
        credentials = data.get('credentials', {})

        if not session_id or session_id not in command_agent_sessions:
            return jsonify(error="Invalid session"), 400

        # Update credentials
        valid_keys = ['aws_access_key', 'aws_secret_key',
                      'aws_region', 'gemini_api_key']
        filtered_credentials = {k: v for k,
                                v in credentials.items() if k in valid_keys}

        command_agent_sessions[session_id]['credentials'] = filtered_credentials

        return jsonify({
            'success': True,
            'message': 'Credentials updated',
            'has_claude': bool(filtered_credentials.get('aws_access_key')),
            'has_gemini': bool(filtered_credentials.get('gemini_api_key'))
        })
