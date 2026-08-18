/**
 * Cloud Agent Service
 *
 * Communicates with the SocialCalc-AI backend to:
 *  - Save/retrieve IPFS credentials in MongoDB
 *  - Trigger the cloud agent to edit an invoice via MCP
 *  - Retrieve list of generated invoices from MongoDB
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface CloudAgentChatRequest {
  userId: string;
  prompt: string;
  templateName?: string;
  image?: string;
  imageType?: string;
}

export interface CloudAgentChatResponse {
  cid: string;
  name: string;
  url: string;
  message: string;
  report: any;
  error?: string;
}

export interface IpfsCredentials {
  userId: string;
  ipfsPinataJwt: string;
  ipfsPinataApiKey: string;
  ipfsPinataApiSecret: string;
  ipfsGatewayUrl: string;
}

export interface ReportItem {
  cid: string;
  name: string;
  url: string;
  date: string;
}

/**
 * Save IPFS credentials to backend MongoDB
 */
export async function saveCloudCredentials(creds: IpfsCredentials): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/app-agent/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Retrieve IPFS credentials from backend MongoDB
 */
export async function getCloudCredentials(userId: string): Promise<Omit<IpfsCredentials, "userId">> {
  const response = await fetch(`${API_BASE_URL}/api/app-agent/credentials?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Send a prompt to the Cloud Agent for report generation
 */
export async function chatWithCloudAgent(req: CloudAgentChatRequest): Promise<CloudAgentChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/app-agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Retrieve all generated reports for the user from MongoDB
 */
export async function getCloudReports(userId: string): Promise<ReportItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/app-agent/reports?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.reports || [];
}

/**
 * Fetch IPFS file JSON from backend with full multi-gateway and authorization fallback
 */
export async function fetchIpfsFile(cid: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/app-agent/ipfs/${encodeURIComponent(cid)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Register user via backend MongoDB
 */
export async function registerUser(email: string, password: string): Promise<{ message: string; email: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Login user via backend MongoDB
 */
export async function loginUser(email: string, password: string): Promise<{ message: string; email: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}
