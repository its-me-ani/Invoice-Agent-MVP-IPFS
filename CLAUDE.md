# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SocialCalc AI Editor — a web-based spreadsheet application using SocialCalc JS engine on the frontend with a Python Flask backend, MongoDB Atlas for storage, and Google Gemini for AI features.

## Development Commands

```bash
# Run locally (port 5001)
source .venv/bin/activate
python3 main.py

# Or use the helper script
./run.sh

# Install dependencies
pip install -r requirements.txt

# Docker (production, port 80)
docker-compose up -d --build
```

There are no test suites or linters configured for the main Flask app.

## Environment Setup

Copy `.env.example` to `.env` and fill in: `SECRET_KEY`, `MONGO_URI`, `MONGO_DB`, `GEMINI_API_KEY`, AWS credentials, `S3_BUCKET_NAME`.

## Architecture

### Backend (Flask)

- **`main.py`** — App entry point. All routes defined here, delegating to handler classes.
- **`route_handlers/`** — One handler class per feature (Auth, Save, List, Bulk, Import, Download, etc.). Each handler exposes static `get()`/`post()` methods called directly from routes.
- **`cloud/storage/storage.py`** — MongoDB operations (getFile, saveFile, listUserFiles, etc.).
- **`cloud/authenticate/`** — User auth logic with passlib password hashing.

### AI Agents

Three separate agent systems, all using Google Gemini:

1. **`sheet_agent/agent/`** — MSC code generation agent. Uses RAG (`SyntaxRAG`) over SocialCalc MSC syntax to generate spreadsheet data. Also contains `AppMappingHandler` for structured app mapping generation.
2. **`command_agent/`** — Natural language → SocialCalc executable commands. Uses `COMMAND_REFERENCE.md` as its knowledge base. Includes `CommandValidator` for validating generated commands via a Node.js pipeline (`pipeline-code/validator.js`).
3. **`route_handlers/McpAgentHandler.py`** — MCP real-time agent that connects to the Socialcalc-MCP server for tool-based spreadsheet operations.

### Frontend

- **`static/socialcalc/`** — Core SocialCalc JavaScript engine (`socialcalc-3.js`, `socialcalctableeditor.js`, etc.).
- **`static/app/`** — Application-level JS (toolbar, modals, agent UI panels).
- **`templates/`** — Jinja2 templates. Main editor is `importcollabload.html`.
- **`static/vendor/`** — Third-party libs (jQuery, Highcharts, xlsx.js).

### Data Flow

User edits → SocialCalc JS engine → MSC format (JSON-like internal representation) → Flask `/save` route → MongoDB. AI agents generate/modify MSC content or produce executable SocialCalc commands that run client-side.

### Sub-projects

- **`Socialcalc-MCP/`** — TypeScript MCP server (npm package). Run with `cd Socialcalc-MCP && npm run dev`. Exposes 35 spreadsheet tools for LLM integration.
- **`BloodSugarLog/`** — Ionic/React/Capacitor mobile Invoice app. Run with `cd BloodSugarLog && npm run dev` (port 3000). Connects to the Flask backend's `/api/app-agent/` and `/api/auth/` endpoints.

### MongoDB Schema

Files are stored in a directory tree: `home/[username]/[list_name]/[filename].msc`. Each file document has `fname`, `type`, and `data` (MSC JSON content). Directories have a `files` array of references.

## Key Patterns

- Route handlers are stateless classes with static methods — no instantiation needed.
- AI agent sessions are stored in-memory dicts keyed by session ID (not persisted across restarts).
- CORS is configured for the mobile frontend origins (localhost:3000, capacitor://, ionic://).
- The command agent validates generated commands by running them through `pipeline-code/validator.js` (Node.js).
