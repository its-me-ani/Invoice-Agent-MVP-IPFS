# 📱 Invoice App

A premium, offline-first invoice maker and billing tracking application built with the **Ionic Framework (React)** and **Capacitor**. The core computation engine uses a mobile-optimized adaptation of **SocialCalc** to deliver spreadsheet-grade calculation logic on touch screens.

Create professional itemized invoices, hourly rate billing sheets, company invoices with automated tax calculations, discounts, and line-item totals instantly and securely.

---

## ✨ Key Features

- **100% Offline-First Storage**: Local, fast structured storage for all invoices, custom spreadsheets, and metadata.
- **Embedded SocialCalc Engine**: Spreadsheet calculation engine wrapped and enhanced with custom cell-input overlays designed for mobile and tablet keyboards.
- **Decentralized Cloud Backups**: Built-in IPFS integration allowing users to export, share, and backup invoices securely using cryptographic Content Identifiers (CIDs).
- **Cloud AI Agent**: AI agent powered by Claude (via MCP tools) for conversational invoice editing, adding line items, updating client info, and managing totals.
- **Invoice Modules**:
  - Itemized Invoices (Description & Amount)
  - Hourly Invoices (Hours, Hourly Rate, Auto-computed Amount)
  - Branded Company Invoices with Subtotal, Tax Rate, Tax, Notes, and Totals
- **PDF Export & Share**: High-fidelity PDF generation and sharing via native share sheet or email composer.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [Ionic React](https://ionicframework.com/docs/react) v8.7
- **UI & Logic**: React 19, TypeScript, Framer Motion
- **Native Bridge**: Capacitor v8 (iOS & Android)
- **Spreadsheet**: SocialCalc JS Engine
- **Decentralized Storage**: IPFS via Pinata API
- **AI Agent**: Claude (via AWS Bedrock) + `socialcalc-mcp` tools

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
