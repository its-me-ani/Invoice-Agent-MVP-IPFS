import { getIpfsSettings } from "../utils/settings";
import { SavedInvoice } from "./local-template-service";

export interface PinataPinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export const ipfsService = {
  /**
   * Helper to construct headers based on credentials
   */
  getHeaders(jwt?: string, apiKey?: string, apiSecret?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (jwt && jwt.trim() !== "") {
      headers["Authorization"] = `Bearer ${jwt.trim()}`;
    } else if (apiKey && apiKey.trim() !== "" && apiSecret && apiSecret.trim() !== "") {
      headers["pinata_api_key"] = apiKey.trim();
      headers["pinata_secret_api_key"] = apiSecret.trim();
    } else {
      // Try to load stored credentials
      const stored = getIpfsSettings();
      if (stored.ipfsPinataJwt && stored.ipfsPinataJwt.trim() !== "") {
        headers["Authorization"] = `Bearer ${stored.ipfsPinataJwt.trim()}`;
      } else if (
        stored.ipfsPinataApiKey &&
        stored.ipfsPinataApiKey.trim() !== "" &&
        stored.ipfsPinataApiSecret &&
        stored.ipfsPinataApiSecret.trim() !== ""
      ) {
        headers["pinata_api_key"] = stored.ipfsPinataApiKey.trim();
        headers["pinata_secret_api_key"] = stored.ipfsPinataApiSecret.trim();
      } else {
        throw new Error("Pinata credentials not configured. Please set them in Settings first.");
      }
    }

    return headers;
  },

  /**
   * Test connection to Pinata API
   */
  async testConnection(jwt?: string, apiKey?: string, apiSecret?: string): Promise<boolean> {
    try {
      const headers = this.getHeaders(jwt, apiKey, apiSecret);
      const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return !!data.message;
    } catch (error: any) {
      console.error("IPFS connection test failed:", error);
      throw error;
    }
  },

  /**
   * Pins a saved invoice to IPFS
   */
  async pinToIpfs(invoice: SavedInvoice): Promise<PinataPinResponse> {
    try {
      const headers = this.getHeaders();
      const body = {
        pinataOptions: {
          cidVersion: 1,
        },
        pinataMetadata: {
          name: `Invoice: ${invoice.name || invoice.id}`,
          keyvalues: {
            app: "medicalsuite",
            invoiceId: invoice.id,
            total: String(invoice.total || 0),
          },
        },
        pinataContent: invoice,
      };

      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("IPFS pinning failed:", error);
      throw error;
    }
  },

  /**
   * Retrieves an invoice JSON from IPFS via gateway
   */
  async fetchFromIpfs(cid: string): Promise<SavedInvoice> {
    try {
      let cleanedCid = cid.trim();
      
      // Handle full IPFS gateway URLs if entered by mistake
      if (cleanedCid.includes("/ipfs/")) {
        cleanedCid = cleanedCid.split("/ipfs/")[1];
      }
      
      // Clean query params or trailing slashes
      cleanedCid = cleanedCid.split("?")[0].replace(/\/+$/, "");

      if (!cleanedCid) {
        throw new Error("Invalid CID");
      }

      const stored = getIpfsSettings();
      let customGateway = stored.ipfsGatewayUrl.trim();
      if (!customGateway.endsWith("/")) {
        customGateway += "/";
      }

      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5001";
      const candidateUrls = [
        `${API_BASE_URL}/api/app-agent/ipfs/${cleanedCid}`,
        `${customGateway}${cleanedCid}`,
        `https://gateway.pinata.cloud/ipfs/${cleanedCid}`,
        `https://cyan-worthy-dragon-639.mypinata.cloud/ipfs/${cleanedCid}`,
        `https://ipfs.io/ipfs/${cleanedCid}`,
        `https://dweb.link/ipfs/${cleanedCid}`,
        `https://cloudflare-ipfs.com/ipfs/${cleanedCid}`,
      ];

      let invoiceData: any = null;
      let lastError: any = null;

      for (const url of candidateUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            invoiceData = await response.json();
            if (invoiceData && typeof invoiceData === "object" && (invoiceData.content || invoiceData.msc || invoiceData.name)) {
              break;
            }
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!invoiceData) {
        throw new Error(lastError?.message || "Failed to fetch file from IPFS gateways");
      }
      
      // Basic validation of shape
      if (!invoiceData || typeof invoiceData !== "object" || !invoiceData.content) {
        // If wrapped in report structure
        if (invoiceData.content) {
          return invoiceData as SavedInvoice;
        }
      }

      return invoiceData as SavedInvoice;
    } catch (error: any) {
      console.error("IPFS fetch failed:", error);
      throw error;
    }
  },
};
