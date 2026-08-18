# Invoice - MCP Agent with IPFS Integration

An offline-first mobile invoice and billing management application built with Ionic React and Capacitor. Features an embedded SocialCalc spreadsheet engine for data entry and calculation, a Cloud AI Agent powered by Claude (via MCP tools) for natural language invoice editing and item addition, and decentralized IPFS storage via Pinata for invoice persistence, export, and sharing.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Ionic 8 + React 19 |
| Build Tool | Vite 7 |
| Language | TypeScript 5.9 |
| Mobile | Capacitor 8 (iOS + Android) |
| Spreadsheet | Embedded SocialCalc JS Engine |
| AI Agent | Claude (via AWS Bedrock) + socialcalc-mcp tools |
| Storage (Local) | localStorage (offline-first) |
| Storage (Cloud) | IPFS via Pinata API |
| Auth Backend | Flask (SocialCalc-AI server) |
| Charts | Chart.js + react-chartjs-2 |
| PDF Export | jsPDF + html2canvas |
| Testing | Vitest (unit), Cypress (e2e) |

---

## Architecture

```
+--------------------------------------------------+
|                Mobile App (Capacitor)              |
|                                                  |
|  +---------------------------------------------+|
|  |          Ionic React UI Layer                ||
|  |  Pages: Home | Files | Settings              ||
|  |  Modals: CloudAgentPanel, IpfsCloudModal     ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |           Context Layer                       ||
|  |  InvoiceContext (React Context)              ||
|  |  State: selectedFile, templateData, etc.     ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |          Service Layer                        ||
|  |  cloud-agent-service  | ipfs-service         ||
|  |  local-template-service | export services    ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |      Embedded SocialCalc Engine              ||
|  |  (JavaScript, loaded into window.SocialCalc) ||
|  +---------------------------------------------+|
|                      |                           |
|  +---------------------------------------------+|
|  |         Data Layer (localStorage)            ||
|  |  Invoices | Templates | Settings | Auth      ||
|  +---------------------------------------------+|
+--------------------------------------------------+
         |                           |
    IPFS (Pinata)           Flask Backend
    - Pin invoices          - Auth (MongoDB)
    - Fetch by CID          - Cloud Invoice Agent
    - Gateway access        - IPFS cred sync
                            - Invoice metadata
```

### Key Integration Flows

#### Cloud Agent Flow (MCP + IPFS)

```
User (voice/text prompt)
    |
    v
CloudAgentPanel.tsx  -->  cloud-agent-service.ts
    |                         |
    |                    POST /api/app-agent/chat
    |                         |
    v                         v
    |                 Flask Backend (AppAgentHandler)
    |                         |
    |                    1. Load invoice template
    |                    2. Write to temp file
    |                    3. Start MCP server (socialcalc-mcp)
    |                    4. Claude (Bedrock) edits via tools (15 turns max)
    |                    5. Pin final invoice to IPFS (Pinata)
    |                    6. Store metadata in MongoDB
    |                         |
    v                         v
CloudAgentPanel  <--  { cid, url, message, report }
    |
    v
User can: copy CID, open in gateway, load into editor
```

#### Direct IPFS Flow (Client-Side)

```
User
    |
    v
IpfsCloudModal.tsx  -->  ipfs-service.ts
    |                        |
    |                   Pinata API (direct)
    |                   - pinJSONToIPFS
    |                   - testAuthentication
    |                   - Fetch via gateway
    |                        |
    v                        v
Import invoice by CID / Export current invoice to IPFS
```

---

## Code Structure

```
BloodSugarLog/
├── package.json                    # Dependencies, scripts
├── capacitor.config.ts             # Capacitor: appId, server config
├── vite.config.ts                  # Vite: dev server (port 3000), build config
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Vitest: jsdom environment, coverage
├── ionic.config.json               # Ionic CLI config
│
├── public/
│   ├── SocialCalc.js               # Embedded SocialCalc JS engine
│   └── templates/                  # Built-in invoice templates
│       ├── meta/                   # Template metadata JSON
│       │   ├── mobile-meta.json
│       │   └── tablet-meta.json
│       └── data/                   # Template MSC spreadsheet JSON
│           ├── mobile.json
│           └── tablet.json
│
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # App root, routes, auth listener, toasts
│   │
│   ├── pages/                      # Page components
│   │   ├── HomePage.tsx            # Spreadsheet editor + toolbar + quick actions
│   │   ├── FilesPage.tsx           # Saved invoices list, search, filter, bulk ops
│   │   ├── SettingsPage.tsx        # User profile, IPFS settings, sync, theme
│   │   ├── LoginPage.tsx           # Login with backend auth / guest mode
│   │   ├── RegisterPage.tsx        # Account registration
│   │   └── OnboardingPage.tsx      # Feature onboarding
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── DashboardLayout.tsx     # Shell layout (header, content, bottom tabs)
│   │   ├── CloudAgentPanel.tsx     # AI agent chat drawer (voice/text, IPFS results)
│   │   ├── IpfsCloudModal.tsx      # IPFS export/import modal (direct Pinata)
│   │   ├── CustomCellOverlay.tsx   # Custom cell input overlay for touch
│   │   ├── SaveFileDialog.tsx      # Save/rename invoice dialog
│   │   ├── ExportPdfModal.tsx      # PDF preview & export options
│   │   ├── ShareModal.tsx          # System share sheet (file/link/text)
│   │   └── Toast.tsx               # Animated feedback toasts
│   │
│   ├── context/                    # State management
│   │   ├── InvoiceContext.tsx      # Active file, template data, undo/redo, dirty state
│   │   ├── AppDataContext.tsx      # Global app data
│   │   └── AuthContext.tsx         # User session, login/logout, credentials
│   │
│   ├── services/                   # Business logic & API clients
│   │   ├── cloud-agent-service.ts  # Calls backend /api/app-agent/chat & /reports
│   │   ├── ipfs-service.ts         # Direct Pinata IPFS pinning & CID fetching
│   │   ├── local-template-service.ts # Loads local/saved invoice templates
│   │   ├── backend-auth-service.ts # Calls backend /api/auth/* endpoints
│   │   ├── pdf-export-service.ts   # jsPDF + html2canvas PDF rendering
│   │   └── speech-service.ts       # Speech-to-text input handling
│   │
│   ├── utils/                      # Helper utilities
│   │   ├── settings.ts             # IPFS & app settings (localStorage)
│   │   ├── socialcalc-helpers.ts   # SocialCalc bridge & cell utilities
│   │   └── formatters.ts           # Currency, date, and number formatters
│   │
│   └── theme/
│       ├── variables.css           # Ionic CSS custom properties (color palette)
│       └── global.css              # Global styles, animations, utilities
│
├── android/                        # Android native project
├── ios/                            # iOS native project
└── scripts/                        # Build/automation scripts
```

---

## IPFS Integration

### Dual IPFS Strategy

The app uses two complementary IPFS approaches:

#### 1. Server-Side (Cloud Agent)
**File:** `route_handlers/AppAgentHandler.py` (Flask backend)

- Agent edits the invoice template via MCP tools
- Final invoice pinned to IPFS via Pinata using server's `PINATA_JWT`
- Metadata (CID, name, URL) stored in MongoDB (`user_ipfs_reports` collection)
- User can browse past invoices and load them back into the editor

#### 2. Client-Side (Direct)
**File:** `src/services/ipfs-service.ts`

- User can manually pin any invoice spreadsheet to IPFS
- User can import invoices by CID from any IPFS gateway
- Credentials stored locally + synced to MongoDB when logged in
- Supports both JWT and API Key/Secret authentication with Pinata

### IPFS Credential Management

Credentials are stored in two places for offline resilience:
1. **localStorage** (`src/utils/settings.ts`) - Always available offline
2. **MongoDB** (`user_ipfs_credentials` collection) - Synced when online

Settings managed:
- `ipfsPinataJwt` - Pinata JWT token
- `ipfsPinataApiKey` - Pinata API key
- `ipfsPinataApiSecret` - Pinata API secret
- `ipfsGatewayUrl` - IPFS gateway URL (default: `https://gateway.pinata.cloud/ipfs/`)

### IPFS Invoice Report Structure

Invoices pinned to IPFS follow this JSON structure:

```json
{
  "name": "Invoice (2026-08-18)",
  "id": "report_1705312000",
  "total": 1250.00,
  "templateId": "100001",
  "content": {
    "msc": {
      "numsheets": 4,
      "currentid": "sheet1",
      "currentname": "Invoice 1",
      "sheetArr": {
        "sheet1": { "name": "Invoice 1", "sheetstr": { "savestr": "..." } },
        "sheet2": { "name": "Invoice 2", "sheetstr": { "savestr": "..." } },
        "sheet3": { "name": "Company 1", "sheetstr": { "savestr": "..." } },
        "sheet4": { "name": "Company 2", "sheetstr": { "savestr": "..." } }
      }
    }
  }
}
```

---

## MCP Agent Integration

### Invoice Agent System Prompt

The Cloud Agent operates with a specialized system prompt that:
- Restricts editing to one invoice workbook at a time
- Understands the 4-sheet invoice template layout (Standard Itemized, Hourly Rate, Branded Company, Hourly Company)
- Knows the cell layout: Header, Client details (`BILL TO`), Vendor details (`FROM`), Line items table (rows 16-28 or 18-28)
- Protects formula cells: Subtotals (`=SUM(...)`), Tax calculation (`=G31*G30`), Totals (`=(G30+G32)+G33`)
- Handles voice transcription errors gracefully

### Agent Tool Protocol

The agent communicates with the `socialcalc-mcp` server using JSON-RPC tool calls:

```json
{
  "call": "write_range",
  "arguments": {
    "workbookPath": "/path/to/temp_file.json",
    "sheetName": "sheet1",
    "range": "C16",
    "value": "Web Development Services"
  }
}
```

Available operations include all 35 MCP tools (`read_range`, `write_range`, `format_cells`, `set_alignment`, etc.).

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Python 3.8+ (for backend)

### Installation

```bash
# Navigate to the mobile app directory
cd BloodSugarLog

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Backend Setup

```bash
# In the project root
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

The Flask backend runs at `http://localhost:5001`.

### Build & Testing

```bash
# Build web production bundle
npm run build

# Run unit tests
npm run test:unit

# Run linter
npm run lint
```
