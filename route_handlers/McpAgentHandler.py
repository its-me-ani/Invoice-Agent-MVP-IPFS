import os
import sys
import json
import logging
import uuid
import re
import time
import subprocess
import threading
from flask import request, jsonify, session, Response

logger = logging.getLogger("mcp_agent")
logger.setLevel(logging.INFO)
if not logger.handlers:
    logger.addHandler(logging.StreamHandler(sys.stdout))

MCP_AGENT_SYSTEM_PROMPT = """You are the Real-time MCP Spreadsheet Editing Agent for SocialCalc-AI.
You edit the spreadsheet workbook on behalf of the user in real time, using only the tools provided by the socialcalc-mcp server.
You have no direct filesystem or shell access — the tools are the entire extent of what you can do.

SCOPE
- You are editing exactly one workbook file per turn: the path given to you as "Working file". Never reference or attempt to open any other file.
- Look at the sheets in the workbook (use list_sheets or list_workbooks) to understand the structure.
- Only modify cells or execute changes relevant to the user's request.
- Protect spreadsheet formulas: Do NOT write static values to any cells that contain pre-existing spreadsheet formulas, unless the user explicitly asks you to overwrite a formula.
- Protect formatting: Do not alter fonts, borders, or colors unless asked.

AVAILABLE TOOLS PROTOCOL:
You interact with the socialcalc-mcp server to perform edits. To invoke a tool, output a single JSON-RPC block in markdown:
```json
{
  "call": "tool_name",
  "arguments": {
    "workbookPath": "...",
    ...
  }
}
```
You MUST wait for the tool execution response in the next turn before continuing. Do not output multiple tool calls in a single turn. Only make one call at a time.
Once you have completed all requested changes, output a short, plain-language summary of what you changed (2-3 sentences max) and the word "FINISH".
"""

# Stdio-based JSON-RPC MCP Client for McpAgentHandler
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
            "clientInfo": {"name": "mcp-agent-client", "version": "1.0"},
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

mcp_agent_sessions = {}

def call_claude_bedrock(messages, system_prompt):
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION", "us-east-1")
    
    if not access_key or not secret_key:
        raise Exception("AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not set.")
        
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
    return response_body['content'][0]['text']

class McpAgentHandler:
    @staticmethod
    def create_session():
        session_id = str(uuid.uuid4())
        mcp_agent_sessions[session_id] = {
            "messages": [],
            "created_at": time.time()
        }
        return jsonify({"session_id": session_id})

    @staticmethod
    def chat():
        data = request.get_json() or {}
        session_id = data.get("session_id")
        message = data.get("message", "").strip()
        current_sheet_state = data.get("current_sheet_state", "")
        model = data.get("model", "claude-sonnet-4.6")

        if not message:
            return jsonify(error="message is required"), 400

        if not session_id or session_id not in mcp_agent_sessions:
            session_id = str(uuid.uuid4())
            mcp_agent_sessions[session_id] = {
                "messages": [],
                "created_at": time.time()
            }

        chat_session = mcp_agent_sessions[session_id]

        def generate_stream():
            scratch_dir = os.path.join(os.getcwd(), "scratch")
            os.makedirs(scratch_dir, exist_ok=True)
            temp_file_path = os.path.abspath(os.path.join(scratch_dir, f"mcp_sheet_{session_id}.json"))

            # Write current sheet state to temp JSON file
            if current_sheet_state:
                try:
                    workbook_data = json.loads(current_sheet_state)
                    with open(temp_file_path, "w", encoding="utf-8") as f:
                        json.dump(workbook_data, f, indent=2)
                except Exception as e:
                    yield f"data: {json.dumps({'event': 'error', 'message': f'Failed to parse sheet state: {str(e)}'})}\n\n"
                    return
            else:
                dummy = {
                    "numsheets": 1,
                    "currentid": "sheet1",
                    "currentname": "sheet1",
                    "sheetArr": {
                        "sheet1": {
                            "sheetstr": {"savestr": "sheet:c:1:r:1\n"},
                            "name": "sheet1",
                            "hidden": "0"
                        }
                    }
                }
                with open(temp_file_path, "w", encoding="utf-8") as f:
                    json.dump(dummy, f, indent=2)

            mcp_dir = os.path.abspath(os.path.join(os.getcwd(), "Socialcalc-MCP"))
            mcp_client = MCPClient(mcp_dir)
            tools_string = ""
            try:
                mcp_client.start()
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
                mcp_client.stop()
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                yield f"data: {json.dumps({'event': 'error', 'message': f'Failed to start MCP server: {str(e)}'})}\n\n"
                return

            system_prompt = MCP_AGENT_SYSTEM_PROMPT
            if tools_string:
                system_prompt += "\n\nAVAILABLE MCP TOOLS:\n" + tools_string

            chat_session["messages"].append({"role": "user", "content": f"Working file: {temp_file_path}\nUser prompt: {message}"})

            final_response = "Changes successfully applied."
            
            try:
                for turn in range(15):
                    logger.info(f"MCP Agent Turn {turn + 1}/15")
                    response = call_claude_bedrock(chat_session["messages"], system_prompt)
                    
                    thought = re.sub(r'```json\s*(\{.*?\})\s*```', '', response, flags=re.DOTALL).strip()
                    
                    if thought:
                        yield f"data: {json.dumps({'event': 'thought', 'thought': thought})}\n\n"
                    
                    tool_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
                    if tool_match:
                        try:
                            tool_call = json.loads(tool_match.group(1))
                            tool_name = tool_call.get("call")
                            tool_args = tool_call.get("arguments", {})
                            
                            # Yield tool call details
                            yield f"data: {json.dumps({'event': 'tool_call', 'name': tool_name, 'args': tool_args})}\n\n"
                            
                            logger.info(f"Executing tool {tool_name}...")
                            result = mcp_client.call_method("tools/call", {
                                "name": tool_name,
                                "arguments": tool_args
                            })
                            
                            result_str = json.dumps(result)
                            
                            # Yield tool results details
                            yield f"data: {json.dumps({'event': 'tool_result', 'result': result_str})}\n\n"
                            
                            chat_session["messages"].append({"role": "assistant", "content": response})
                            chat_session["messages"].append({"role": "user", "content": f"Tool result for {tool_name}:\n{result_str}"})
                            
                            # Real-time intermediate sheet state streaming
                            is_modifying = any(kw in tool_name for kw in ["write", "delete", "set", "format", "merge", "insert", "unmerge"])
                            if is_modifying and os.path.exists(temp_file_path):
                                try:
                                    with open(temp_file_path, "r", encoding="utf-8") as f:
                                        updated_data = json.load(f)
                                        yield f"data: {json.dumps({'event': 'sheet_update', 'updated_sheet_state': json.dumps(updated_data)})}\n\n"
                                except Exception as se:
                                    logger.error(f"Error reading intermediate sheet: {se}")
                        except Exception as ex:
                            logger.exception(f"Error executing tool")
                            yield f"data: {json.dumps({'event': 'tool_result', 'result': f'Error: {str(ex)}'})}\n\n"
                            chat_session["messages"].append({"role": "assistant", "content": response})
                            chat_session["messages"].append({"role": "user", "content": f"Error executing tool: {str(ex)}"})
                    else:
                        if "FINISH" in response or "finish" in response.upper():
                            final_response = response.replace("FINISH", "").strip()
                            break
                        else:
                            chat_session["messages"].append({"role": "assistant", "content": response})
                            chat_session["messages"].append({"role": "user", "content": "Please continue executing tools or return FINISH."})
            except Exception as e:
                logger.exception("Error in Bedrock MCP chat loop")
                yield f"data: {json.dumps({'event': 'error', 'message': str(e)})}\n\n"
                mcp_client.stop()
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                return

            mcp_client.stop()

            # Read final modified workbook
            updated_sheet_state = ""
            if os.path.exists(temp_file_path):
                try:
                    with open(temp_file_path, "r", encoding="utf-8") as f:
                        updated_data = json.load(f)
                        updated_sheet_state = json.dumps(updated_data)
                except Exception as e:
                    logger.error(f"Failed to read modified file: {e}")
                os.remove(temp_file_path)

            chat_session["messages"] = [
                {"role": "user", "content": message},
                {"role": "assistant", "content": final_response}
            ]

            yield f"data: {json.dumps({'event': 'finish', 'response': final_response, 'session_id': session_id, 'updated_sheet_state': updated_sheet_state})}\n\n"

        return Response(generate_stream(), mimetype='text/event-stream')

    @staticmethod
    def clear_session():
        data = request.get_json() or {}
        session_id = data.get("session_id")
        if session_id in mcp_agent_sessions:
            del mcp_agent_sessions[session_id]
        return jsonify({"success": True})
