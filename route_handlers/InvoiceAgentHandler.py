import os
import json
import subprocess
import threading
import time
import re
import uuid
import logging
import sys
from datetime import datetime
from flask import request, jsonify

# Configure logger
logger = logging.getLogger("invoice_agent")
logger.setLevel(logging.INFO)
if not logger.handlers:
    logger.addHandler(logging.StreamHandler(sys.stdout))

# In-memory session store
invoice_agent_sessions = {}

# Stdio-based JSON-RPC MCP Client
class MCPClient:
    def __init__(self, mcp_dir):
        self.mcp_dir = mcp_dir
        self.proc = None
        self.request_id = 1
        self.pending_responses = {}
        self.read_thread = None
        self.running = False

    def start(self):
        local_js = os.path.join(self.mcp_dir, "dist", "index.js")
        if os.path.exists(local_js):
            cmd = ["node", local_js]
        else:
            cmd = ["npx", "-y", "socialcalc-mcp"]
        
        self.proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        self.running = True
        self.read_thread = threading.Thread(target=self._read_loop, daemon=True)
        self.read_thread.start()
        
        # Handshake
        self.call_method("initialize", {
            "capabilities": {},
            "clientInfo": {"name": "invoice-agent-client", "version": "1.0"},
            "protocolVersion": "2024-11-05"
        })
        self.call_method("notifications/initialized", {})

    def _read_loop(self):
        while self.running and self.proc:
            line = self.proc.stdout.readline()
            if not line:
                break
            try:
                resp = json.loads(line)
                if "id" in resp:
                    self.pending_responses[resp["id"]] = resp
            except Exception as e:
                logger.error(f"[MCP CLIENT ERROR] Error parsing line: {e}")

    def call_method(self, method, params):
        req_id = self.request_id
        self.request_id += 1
        payload = {
            "jsonrpc": "2.0",
            "id": req_id,
            "method": method,
            "params": params
        }
        self.proc.stdin.write(json.dumps(payload) + "\n")
        self.proc.stdin.flush()
        
        if method.startswith("notifications/"):
            return None
            
        timeout = 15.0
        start_time = time.time()
        while time.time() - start_time < timeout:
            if req_id in self.pending_responses:
                resp = self.pending_responses.pop(req_id)
                if "error" in resp:
                    raise Exception(resp["error"].get("message", "Unknown MCP error"))
                return resp.get("result")
            time.sleep(0.05)
        raise Exception(f"Timeout waiting for MCP response for method: {method}")

    def stop(self):
        self.running = False
        if self.proc:
            self.proc.terminate()
            self.proc = None

# Helper to load template data
def load_invoice_template(template_id="100001"):
    template_path = os.path.join(
        os.getcwd(), "Invoice-MVP-ios", "public", "templates", "data", f"{template_id}.json"
    )
    if not os.path.exists(template_path):
        # Fallback to absolute workspace path if needed
        template_path = os.path.join(
            "/Users/anirudhsharma/Desktop/C4GT/Socialcalc-AI",
            "Invoice-MVP-ios", "public", "templates", "data", f"{template_id}.json"
        )
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template JSON file not found for ID {template_id}")
    with open(template_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Helper to parse Socialcalc savestr cell values/formulas
def extract_workbook_cells(workbook_json):
    cells = {}
    msc = workbook_json.get("msc") if isinstance(workbook_json, dict) and "msc" in workbook_json else workbook_json
    if not isinstance(msc, dict):
        return cells
    sheet_arr = msc.get("sheetArr", {})
    for sheet_name, sheet_data in sheet_arr.items():
        sheetstr = sheet_data.get("sheetstr", {})
        if not isinstance(sheetstr, dict):
            continue
        savestr = sheetstr.get("savestr", "")
        for line in savestr.split('\n'):
            if line.startswith('cell:'):
                parts = line.split(':')
                if len(parts) >= 3:
                    coord = parts[1]
                    val = ""
                    found = False
                    for idx, part in enumerate(parts):
                        if part == 't' and idx + 1 < len(parts):
                            # Replace escaped colons and newlines
                            val = parts[idx + 1].replace('\\c', ':').replace('\\n', '\n')
                            found = True
                            break
                        elif part == 'v' and idx + 1 < len(parts):
                            val = parts[idx + 1]
                            found = True
                            break
                        elif part == 'vtf' and idx + 3 < len(parts):
                            val = "=" + parts[idx + 3].replace('\\c', ':').replace('\\n', '\n')
                            found = True
                            break
                    if found:
                        cells[f"{sheet_name}!{coord}"] = val
    return cells

# Helper to call Bedrock
def call_claude_bedrock(messages, system_prompt):
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION", "us-east-1")
    
    if not access_key or not secret_key:
        logger.error("AWS Bedrock credentials not found in environment.")
        raise Exception("AWS Bedrock credentials are not configured on the server.")
        
    import boto3
    client = boto3.client(
        'bedrock-runtime',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region
    )
    
    model_id = "us.anthropic.claude-sonnet-4-6"
    formatted_messages = []
    for msg in messages:
        role = "assistant" if msg["role"] in ["model", "assistant"] else "user"
        if isinstance(msg["content"], list):
            formatted_messages.append({
                "role": role,
                "content": msg["content"]
            })
        else:
            formatted_messages.append({
                "role": role,
                "content": [
                    {
                        "type": "text",
                        "text": msg["content"]
                    }
                ]
            })
            
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 8000,
        "system": system_prompt,
        "messages": formatted_messages
    }
    
    response = client.invoke_model(
        modelId=model_id,
        body=json.dumps(body),
        contentType='application/json',
        accept='application/json'
    )
    
    response_body = json.loads(response['body'].read())
    res_text = response_body['content'][0]['text']
    usage = response_body.get("usage", {})
    return res_text, usage

class InvoiceAgentHandler:
    @staticmethod
    def create_session():
        """POST /api/edit-invoice/session"""
        data = request.get_json() or {}
        session_id = data.get("session_id", "").strip() or str(uuid.uuid4())
        prompt = data.get("prompt", "").strip()
        cell_mappings = data.get("cell_mappings", {})
        current_values = data.get("current_values", {})
        invoice_image = data.get("invoice_image", "").strip()
        image_type = data.get("imageType", "image/jpeg").strip()
        template_id = data.get("template_id", "100001") # default to style 1
        
        if not prompt and not invoice_image:
            return jsonify(error="Either prompt or invoice_image is required"), 400

        # Initialize or retrieve session
        if session_id not in invoice_agent_sessions:
            invoice_agent_sessions[session_id] = {
                "messages": [],
                "created_at": time.time(),
                "last_activity": time.time(),
                "token_count": 0,
                "template_id": template_id,
                "cell_mappings": cell_mappings
            }
            
        session_data = invoice_agent_sessions[session_id]
        session_data["last_activity"] = time.time()
        
        # Load the base template
        try:
            full_template = load_invoice_template(template_id)
            workbook_data = full_template.get("msc")
            if not workbook_data:
                return jsonify(error="Invalid template format: 'msc' key not found"), 500
        except Exception as e:
            logger.exception("Failed to load invoice template")
            return jsonify(error=f"Failed to load invoice template: {str(e)}"), 500

        # Setup scratch space and temp file
        scratch_dir = os.path.join(os.getcwd(), "scratch")
        os.makedirs(scratch_dir, exist_ok=True)
        temp_file_path = os.path.abspath(os.path.join(scratch_dir, f"invoice_{session_id}.json"))
        
        with open(temp_file_path, "w", encoding="utf-8") as f:
            json.dump(workbook_data, f, indent=2)
            
        mcp_dir = os.path.abspath(os.path.join(os.getcwd(), "Socialcalc-MCP"))
        mcp_client = MCPClient(mcp_dir)
        
        try:
            mcp_client.start()
            
            # Pre-populate with current values from frontend
            if current_values:
                for coord, val in current_values.items():
                    if val is None:
                        continue
                    sheet_name = "sheet1"
                    coord_only = coord
                    if "!" in coord:
                        sheet_name, coord_only = coord.split("!", 1)
                    
                    try:
                        mcp_client.call_method("tools/call", {
                            "name": "write_range",
                            "arguments": {
                                "workbookPath": temp_file_path,
                                "sheetName": sheet_name,
                                "range": coord_only,
                                "value": str(val)
                            }
                        })
                    except Exception as we:
                        logger.warning(f"Failed to write current_value {coord}={val}: {we}")
            
            # Read initial cells to compare after agent runs
            with open(temp_file_path, "r", encoding="utf-8") as f:
                pre_edited_workbook = json.load(f)
            initial_cells = extract_workbook_cells(pre_edited_workbook)
            
            # Fetch tools definition
            tools_data = mcp_client.call_method("tools/list", {}) or {}
            tools_list = tools_data.get("tools", [])
            formatted_tools = []
            for t in tools_list:
                formatted_tools.append(
                    f"Tool Name: {t.get('name')}\n"
                    f"Description: {t.get('description')}\n"
                    f"Arguments Schema: {json.dumps(t.get('inputSchema', {}))}\n"
                    f"---"
                )
            tools_string = "\n".join(formatted_tools)
            
        except Exception as e:
            logger.exception("Failed to initialize MCP client or write pre-populated values")
            mcp_client.stop()
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return jsonify(error=f"Failed to initialize editing environment: {str(e)}"), 500

        # Construct Agent System Prompt with mappings
        mappings_str = json.dumps(cell_mappings, indent=2)
        system_prompt = f"""You are the Invoice Spreadsheet Editing Agent for SocialCalc-AI.
You edit the spreadsheet workbook on behalf of the user, using only the tools provided by the socialcalc-mcp server.
You have no direct filesystem or shell access — the tools are the entire extent of what you can do.

SCOPE
- You are editing exactly one workbook file: the path given to you as "Working file". Never reference or attempt to open any other file.
- Only modify cells or execute changes relevant to the user's request.
- Protect spreadsheet formula cells (like Subtotal, Tax, Total) from being overwritten with static values unless the user explicitly requests you to do so.
- Here are the cell mappings for the template which describe where fields belong:
{mappings_str}
- Use these mappings to determine where to write field values (e.g., Bill To name/address, From name/address, signature, logo, invoice number, date, etc.).
- When adding items to a table (e.g. Description, Qty, Price, Amount), find the first empty row in the table range and fill in the values.
- Note: Cells in columns like Qty (Quantity) and Price take numeric values (write them as numbers, not strings like "$20").

AVAILABLE TOOLS PROTOCOL:
You interact with the socialcalc-mcp server to perform edits. To invoke a tool, output a single JSON-RPC block in markdown:
```json
{{
  "call": "tool_name",
  "arguments": {{
    "workbookPath": "...",
    ...
  }}
}}
```
You MUST wait for the tool execution response in the next turn before continuing. Do not output multiple tool calls in a single turn. Only make one call at a time.
Once you have completed all requested changes, output a short, plain-language summary of what you changed (2-3 sentences max) and the word "FINISH".
"""
        if tools_string:
            system_prompt += "\n\nAVAILABLE MCP TOOLS:\n" + tools_string

        # Setup User Message
        user_content = []
        if invoice_image:
            if "," in invoice_image:
                image_data = invoice_image.split(",", 1)[1]
            else:
                image_data = invoice_image
            user_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image_type,
                    "data": image_data
                }
            })
        
        user_content.append({
            "type": "text",
            "text": f"Working file: {temp_file_path}\nUser prompt: {prompt}"
        })
        
        session_data["messages"].append({"role": "user", "content": user_content})
        
        final_summary = "Finished editing invoice."
        try:
            for turn in range(15):
                logger.info(f"Invoice Agent Turn {turn + 1}/15")
                response, usage = call_claude_bedrock(session_data["messages"], system_prompt)
                
                # Accumulate tokens
                session_data["token_count"] += usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
                
                tool_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
                if tool_match:
                    try:
                        tool_call = json.loads(tool_match.group(1))
                        tool_name = tool_call.get("call")
                        tool_args = tool_call.get("arguments", {})
                        
                        logger.info(f"Executing tool {tool_name} with args {json.dumps(tool_args)}")
                        result = mcp_client.call_method("tools/call", {
                            "name": tool_name,
                            "arguments": tool_args
                        })
                        logger.info(f"Tool execution returned: {json.dumps(result)}")
                        
                        session_data["messages"].append({"role": "assistant", "content": response})
                        session_data["messages"].append({"role": "user", "content": f"Tool result for {tool_name}:\n{json.dumps(result)}"})
                    except Exception as ex:
                        logger.exception(f"Error executing tool {tool_name}")
                        session_data["messages"].append({"role": "assistant", "content": response})
                        session_data["messages"].append({"role": "user", "content": f"Error executing tool: {str(ex)}"})
                else:
                    if "FINISH" in response or "finish" in response.upper():
                        final_summary = response.replace("FINISH", "").strip()
                        break
                    else:
                        session_data["messages"].append({"role": "assistant", "content": response})
                        session_data["messages"].append({"role": "user", "content": "Please continue executing tools or output FINISH."})
        except Exception as e:
            logger.exception("Error in Invoice Agent editing loop")
            mcp_client.stop()
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return jsonify(error=f"Error in editing loop: {str(e)}"), 500

        mcp_client.stop()
        
        # Read final workbook and compute cell updates
        cell_updates = {}
        try:
            if os.path.exists(temp_file_path):
                with open(temp_file_path, "r", encoding="utf-8") as f:
                    post_edited_workbook = json.load(f)
                final_cells = extract_workbook_cells(post_edited_workbook)
                
                # Compare cells to find updates
                # We return both sheet-prefixed keys and sheetless keys for compatibility
                all_keys = set(list(initial_cells.keys()) + list(final_cells.keys()))
                for key in all_keys:
                    initial_val = initial_cells.get(key, "")
                    final_val = final_cells.get(key, "")
                    if initial_val != final_val:
                        cell_updates[key] = final_val
                        # Also add sheetless cell coordinate (e.g. "C5" from "sheet1!C5")
                        if "!" in key:
                            sheet_name, coord = key.split("!", 1)
                            cell_updates[coord] = final_val
                
                os.remove(temp_file_path)
        except Exception as e:
            logger.exception("Failed to read edited workbook or compute updates")
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return jsonify(error=f"Failed to read changes: {str(e)}"), 500
            
        return jsonify({
            "session_id": session_id,
            "message": final_summary,
            "cell_updates": cell_updates,
            "token_count": session_data["token_count"],
            "timestamp": datetime.utcnow().isoformat()
        })

    @staticmethod
    def chat():
        """POST /api/edit-invoice/chat"""
        data = request.get_json() or {}
        session_id = data.get("session_id", "").strip()
        prompt = data.get("prompt", "").strip()
        cell_mappings = data.get("cell_mappings") or {}
        current_values = data.get("current_values") or {}
        invoice_image = data.get("invoice_image", "").strip()
        image_type = data.get("imageType", "image/jpeg").strip()
        
        if not session_id or session_id not in invoice_agent_sessions:
            return jsonify(error="Session not found or expired"), 404
        if not prompt and not invoice_image:
            return jsonify(error="Either prompt or invoice_image is required"), 400
            
        session_data = invoice_agent_sessions[session_id]
        session_data["last_activity"] = time.time()
        template_id = session_data["template_id"]
        
        # Merge cell mappings if provided
        if cell_mappings:
            session_data["cell_mappings"].update(cell_mappings)
        merged_cell_mappings = session_data["cell_mappings"]
        
        try:
            full_template = load_invoice_template(template_id)
            workbook_data = full_template.get("msc")
            if not workbook_data:
                return jsonify(error="Invalid template format: 'msc' key not found"), 500
        except Exception as e:
            logger.exception("Failed to load template")
            return jsonify(error=f"Failed to load template: {str(e)}"), 500

        scratch_dir = os.path.join(os.getcwd(), "scratch")
        os.makedirs(scratch_dir, exist_ok=True)
        temp_file_path = os.path.abspath(os.path.join(scratch_dir, f"invoice_{session_id}.json"))
        
        with open(temp_file_path, "w", encoding="utf-8") as f:
            json.dump(workbook_data, f, indent=2)
            
        mcp_dir = os.path.abspath(os.path.join(os.getcwd(), "Socialcalc-MCP"))
        mcp_client = MCPClient(mcp_dir)
        
        try:
            mcp_client.start()
            
            # Pre-populate with current values from frontend
            if current_values:
                for coord, val in current_values.items():
                    if val is None:
                        continue
                    sheet_name = "sheet1"
                    coord_only = coord
                    if "!" in coord:
                        sheet_name, coord_only = coord.split("!", 1)
                    
                    try:
                        mcp_client.call_method("tools/call", {
                            "name": "write_range",
                            "arguments": {
                                "workbookPath": temp_file_path,
                                "sheetName": sheet_name,
                                "range": coord_only,
                                "value": str(val)
                            }
                        })
                    except Exception as we:
                        logger.warning(f"Failed to write current_value {coord}={val}: {we}")
            
            # Read initial cells to compare
            with open(temp_file_path, "r", encoding="utf-8") as f:
                pre_edited_workbook = json.load(f)
            initial_cells = extract_workbook_cells(pre_edited_workbook)
            
            # Fetch tools
            tools_data = mcp_client.call_method("tools/list", {}) or {}
            tools_list = tools_data.get("tools", [])
            formatted_tools = []
            for t in tools_list:
                formatted_tools.append(
                    f"Tool Name: {t.get('name')}\n"
                    f"Description: {t.get('description')}\n"
                    f"Arguments Schema: {json.dumps(t.get('inputSchema', {}))}\n"
                    f"---"
                )
            tools_string = "\n".join(formatted_tools)
            
        except Exception as e:
            logger.exception("Failed to initialize MCP client")
            mcp_client.stop()
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return jsonify(error=f"Failed to initialize editing environment: {str(e)}"), 500

        # Construct system prompt
        mappings_str = json.dumps(merged_cell_mappings, indent=2)
        system_prompt = f"""You are the Invoice Spreadsheet Editing Agent for SocialCalc-AI.
You edit the spreadsheet workbook on behalf of the user, using only the tools provided by the socialcalc-mcp server.
You have no direct filesystem or shell access — the tools are the entire extent of what you can do.

SCOPE
- You are editing exactly one workbook file: the path given to you as "Working file". Never reference or attempt to open any other file.
- Only modify cells or execute changes relevant to the user's request.
- Protect spreadsheet formula cells (like Subtotal, Tax, Total) from being overwritten with static values unless the user explicitly requests you to do so.
- Here are the cell mappings for the template which describe where fields belong:
{mappings_str}
- Use these mappings to determine where to write field values (e.g., Bill To name/address, From name/address, signature, logo, invoice number, date, etc.).
- When adding items to a table (e.g. Description, Qty, Price, Amount), find the first empty row in the table range and fill in the values.
- Note: Cells in columns like Qty (Quantity) and Price take numeric values (write them as numbers, not strings like "$20").

AVAILABLE TOOLS PROTOCOL:
You interact with the socialcalc-mcp server to perform edits. To invoke a tool, output a single JSON-RPC block in markdown:
```json
{{
  "call": "tool_name",
  "arguments": {{
    "workbookPath": "...",
    ...
  }}
}}
```
You MUST wait for the tool execution response in the next turn before continuing. Do not output multiple tool calls in a single turn. Only make one call at a time.
Once you have completed all requested changes, output a short, plain-language summary of what you changed (2-3 sentences max) and the word "FINISH".
"""
        if tools_string:
            system_prompt += "\n\nAVAILABLE MCP TOOLS:\n" + tools_string

        # Add message to history
        user_content = []
        if invoice_image:
            if "," in invoice_image:
                image_data = invoice_image.split(",", 1)[1]
            else:
                image_data = invoice_image
            user_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image_type,
                    "data": image_data
                }
            })
        
        user_content.append({
            "type": "text",
            "text": f"Working file: {temp_file_path}\nUser prompt: {prompt}"
        })
        
        session_data["messages"].append({"role": "user", "content": user_content})
        
        final_summary = "Finished editing invoice."
        try:
            for turn in range(15):
                logger.info(f"Invoice Agent Chat Turn {turn + 1}/15")
                response, usage = call_claude_bedrock(session_data["messages"], system_prompt)
                
                # Accumulate tokens
                session_data["token_count"] += usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
                
                tool_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
                if tool_match:
                    try:
                        tool_call = json.loads(tool_match.group(1))
                        tool_name = tool_call.get("call")
                        tool_args = tool_call.get("arguments", {})
                        
                        logger.info(f"Executing tool {tool_name} with args {json.dumps(tool_args)}")
                        result = mcp_client.call_method("tools/call", {
                            "name": tool_name,
                            "arguments": tool_args
                        })
                        
                        session_data["messages"].append({"role": "assistant", "content": response})
                        session_data["messages"].append({"role": "user", "content": f"Tool result for {tool_name}:\n{json.dumps(result)}"})
                    except Exception as ex:
                        logger.exception(f"Error executing tool {tool_name}")
                        session_data["messages"].append({"role": "assistant", "content": response})
                        session_data["messages"].append({"role": "user", "content": f"Error executing tool: {str(ex)}"})
                else:
                    if "FINISH" in response or "finish" in response.upper():
                        final_summary = response.replace("FINISH", "").strip()
                        break
                    else:
                        session_data["messages"].append({"role": "assistant", "content": response})
                        session_data["messages"].append({"role": "user", "content": "Please continue executing tools or output FINISH."})
        except Exception as e:
            logger.exception("Error in Invoice Agent editing loop")
            mcp_client.stop()
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return jsonify(error=f"Error in editing loop: {str(e)}"), 500

        mcp_client.stop()
        
        # Read final workbook and compute cell updates
        cell_updates = {}
        try:
            if os.path.exists(temp_file_path):
                with open(temp_file_path, "r", encoding="utf-8") as f:
                    post_edited_workbook = json.load(f)
                final_cells = extract_workbook_cells(post_edited_workbook)
                
                # Compare cells to find updates
                all_keys = set(list(initial_cells.keys()) + list(final_cells.keys()))
                for key in all_keys:
                    initial_val = initial_cells.get(key, "")
                    final_val = final_cells.get(key, "")
                    if initial_val != final_val:
                        cell_updates[key] = final_val
                        if "!" in key:
                            sheet_name, coord = key.split("!", 1)
                            cell_updates[coord] = final_val
                
                os.remove(temp_file_path)
        except Exception as e:
            logger.exception("Failed to read edited workbook or compute updates")
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return jsonify(error=f"Failed to read changes: {str(e)}"), 500
            
        return jsonify({
            "session_id": session_id,
            "message": final_summary,
            "cell_updates": cell_updates,
            "token_count": session_data["token_count"],
            "timestamp": datetime.utcnow().isoformat()
        })

    @staticmethod
    def get_session_info(session_id):
        """GET /api/edit-invoice/session/<session_id>"""
        if session_id not in invoice_agent_sessions:
            return jsonify(error="Session not found"), 404
            
        session_data = invoice_agent_sessions[session_id]
        
        # Convert timestamps to ISO format strings
        created_at_str = datetime.utcfromtimestamp(session_data["created_at"]).isoformat() + "Z"
        last_activity_str = datetime.utcfromtimestamp(session_data["last_activity"]).isoformat() + "Z"
        
        return jsonify({
            "session_id": session_id,
            "created_at": created_at_str,
            "last_activity": last_activity_str,
            "token_count": session_data["token_count"],
            "message_count": len(session_data["messages"])
        })

    @staticmethod
    def delete_session(session_id):
        """DELETE /api/edit-invoice/session/<session_id>"""
        if session_id in invoice_agent_sessions:
            del invoice_agent_sessions[session_id]
            logger.info(f"Deleted invoice agent session {session_id}")
            return jsonify(success=True), 200
        return jsonify(error="Session not found"), 404
