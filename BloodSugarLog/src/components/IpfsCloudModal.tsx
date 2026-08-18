import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonContent,
  IonIcon,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import {
  closeOutline,
  cloudOutline,
  copyOutline,
  openOutline,
  trashOutline,
  keyOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  eyeOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { getIpfsSettings, saveIpfsSettings } from "../utils/settings";
import { ipfsService } from "../services/ipfs-service";
import { getCloudCredentials, saveCloudCredentials, getCloudReports } from "../services/cloud-agent-service";
import "./IpfsCloudModal.css";

interface IpfsCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (fileName: string) => void;
}

interface PinnedHistoryItem {
  cid: string;
  name: string;
  date?: string;
}

export const IpfsCloudModal: React.FC<IpfsCloudModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const userId = localStorage.getItem("user_email") || "offline_user";
  const [activeTab, setActiveTab] = useState<"files" | "credentials">("files");

  // Credentials State
  const [ipfsPinataJwt, setIpfsPinataJwt] = useState("");
  const [ipfsPinataApiKey, setIpfsPinataApiKey] = useState("");
  const [ipfsPinataApiSecret, setIpfsPinataApiSecret] = useState("");
  const [ipfsGatewayUrl, setIpfsGatewayUrl] = useState("https://gateway.pinata.cloud/ipfs/");
  const [showJwt, setShowJwt] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  
  // Connection Test & Save State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "failed">("idle");
  const [testMessage, setTestMessage] = useState("");

  // Cloud Files State
  const [historyList, setHistoryList] = useState<PinnedHistoryItem[]>([]);
  const [importCid, setImportCid] = useState("");
  const [importing, setImporting] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "warning" | "danger" | "primary">("primary");

  // Load configuration and history on open
  useEffect(() => {
    if (isOpen) {
      // Load credentials from cloud with local fallback
      const fetchCreds = async () => {
        const isLoggedIn = userId && userId !== "offline_user";
        if (isLoggedIn) {
          try {
            const creds = await getCloudCredentials(userId);
            setIpfsPinataJwt(creds.ipfsPinataJwt || "");
            setIpfsPinataApiKey(creds.ipfsPinataApiKey || "");
            setIpfsPinataApiSecret(creds.ipfsPinataApiSecret || "");
            setIpfsGatewayUrl(creds.ipfsGatewayUrl || "https://gateway.pinata.cloud/ipfs/");
            return;
          } catch (error) {
            // fallback to local
          }
        }

        // Fallback to local
        const ipfs = getIpfsSettings();
        setIpfsPinataJwt(ipfs.ipfsPinataJwt || "");
        setIpfsPinataApiKey(ipfs.ipfsPinataApiKey || "");
        setIpfsPinataApiSecret(ipfs.ipfsPinataApiSecret || "");
        setIpfsGatewayUrl(ipfs.ipfsGatewayUrl || "https://gateway.pinata.cloud/ipfs/");
      };

      fetchCreds();
      setTestResult("idle");
      setTestMessage("");

      // Load pinned history
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      // Load local history
      const historyKey = "ipfs_pinned_history_" + userId;
      const historyStr = localStorage.getItem(historyKey) || "[]";
      const localHistory: PinnedHistoryItem[] = JSON.parse(historyStr);

      // Load cloud reports from MongoDB (only if logged in!)
      let cloudHistory: PinnedHistoryItem[] = [];
      const isLoggedIn = userId && userId !== "offline_user";
      if (isLoggedIn) {
        try {
          const cloudReports = await getCloudReports(userId);
          cloudHistory = cloudReports.map(r => ({
            cid: r.cid,
            name: r.name,
            date: r.date
          }));
        } catch (err) {
          console.warn("Failed to load reports from cloud DB:", err);
        }
      }

      // Merge and deduplicate by CID
      const mergedMap = new Map<string, PinnedHistoryItem>();
      localHistory.forEach(item => mergedMap.set(item.cid, item));
      cloudHistory.forEach(item => mergedMap.set(item.cid, item));

      const mergedList = Array.from(mergedMap.values());
      setHistoryList(mergedList);
    } catch (e) {
      console.warn("Failed to load IPFS history:", e);
      setHistoryList([]);
    }
  };

  const showToastNotification = (msg: string, color: "success" | "warning" | "danger" | "primary" = "primary") => {
    setToastMessage(msg);
    setToastColor(color);
    setShowToast(true);
  };

  // Credentials actions
  const handleSaveCredentials = async () => {
    // Save locally
    saveIpfsSettings({
      ipfsPinataJwt,
      ipfsPinataApiKey,
      ipfsPinataApiSecret,
      ipfsGatewayUrl,
    });

    // Sync to MongoDB Cloud only if logged in
    const isLoggedIn = userId && userId !== "offline_user";
    if (isLoggedIn) {
      try {
        await saveCloudCredentials({
          userId,
          ipfsPinataJwt,
          ipfsPinataApiKey,
          ipfsPinataApiSecret,
          ipfsGatewayUrl,
        });
        showToastNotification("IPFS credentials saved locally and synced to Cloud!", "success");
      } catch (error: any) {
        showToastNotification(`Credentials saved locally, but cloud sync failed: ${error.message}`, "warning");
      }
    } else {
      showToastNotification("Credentials saved locally. Log in under Settings to sync to Cloud.", "success");
    }
  };

  const handleTestConnection = async () => {
    if (!ipfsPinataJwt.trim() && (!ipfsPinataApiKey.trim() || !ipfsPinataApiSecret.trim())) {
      setTestResult("failed");
      setTestMessage("Please provide a JWT or API Key + API Secret.");
      return;
    }

    setTestingConnection(true);
    setTestResult("idle");
    setTestMessage("");

    try {
      const ok = await ipfsService.testConnection(
        ipfsPinataJwt,
        ipfsPinataApiKey,
        ipfsPinataApiSecret
      );
      if (ok) {
        setTestResult("success");
        setTestMessage("Connection to Pinata successful!");
      } else {
        setTestResult("failed");
        setTestMessage("Connection failed. Check your API credentials.");
      }
    } catch (e: any) {
      setTestResult("failed");
      setTestMessage(e.message || "Failed to authenticate with Pinata API.");
    } finally {
      setTestingConnection(false);
    }
  };

  // Load Action
  const handleLoadByCid = async (cidToImport: string) => {
    const cid = cidToImport.trim();
    if (!cid) {
      showToastNotification("Please enter a valid CID", "warning");
      return;
    }

    setImporting(true);
    showToastNotification("Fetching file from IPFS...", "primary");

    try {
      const invoiceData = await ipfsService.fetchFromIpfs(cid);
      
      // Save data directly to temporary localStorage key
      localStorage.setItem("ipfs_temp_invoice_content", JSON.stringify(invoiceData));

      // Append/prepend to IPFS pinned history list if it's not already in there!
      const historyKey = "ipfs_pinned_history_" + userId;
      const historyStr = localStorage.getItem(historyKey) || "[]";
      let history: PinnedHistoryItem[] = JSON.parse(historyStr);
      if (!history.some(item => item.cid === cid)) {
        history = [
          {
            cid,
            name: invoiceData.name || "Imported File",
            date: new Date().toLocaleString(),
          },
          ...history,
        ];
        localStorage.setItem(historyKey, JSON.stringify(history));
      }

      showToastNotification(`Successfully loaded file from IPFS!`, "success");
      setImportCid("");
      
      // Force navigation to the editor page with "invoice" filename
      window.location.href = "/app/tabs/home/invoice";

      onClose();
    } catch (e: any) {
      console.error("IPFS Load Error:", e);
      showToastNotification(`Load failed: ${e.message || "check CID/gateway configuration"}`, "danger");
    } finally {
      setImporting(false);
    }
  };

  // Helper actions for history items
  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    showToastNotification("CID copied to clipboard!", "success");
  };

  const handleRemoveFromHistory = (cid: string) => {
    try {
      const updated = historyList.filter((item) => item.cid !== cid);
      const historyKey = "ipfs_pinned_history_" + userId;
      localStorage.setItem(historyKey, JSON.stringify(updated));
      setHistoryList(updated);
      showToastNotification("Removed from local history list.", "primary");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="ipfs-cloud-modal"
      initialBreakpoint={0.92}
      breakpoints={[0, 0.5, 0.92]}
      handle={true}
    >
      {/* Header */}
      <div className="ipfs-modal-header">
        <div className="ipfs-modal-header-top">
          <div className="ipfs-modal-header-left">
            <div className="ipfs-modal-header-icon-wrap">
              <IonIcon icon={cloudOutline} />
            </div>
            <span className="ipfs-modal-header-text">IPFS Cloud Manager</span>
          </div>
          <button className="ipfs-modal-close-btn" onClick={onClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="ipfs-tab-switcher">
          <button
            className={`ipfs-tab-btn ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            <IonIcon icon={cloudOutline} />
            Cloud Files
          </button>
          <button
            className={`ipfs-tab-btn ${activeTab === "credentials" ? "active" : ""}`}
            onClick={() => setActiveTab("credentials")}
          >
            <IonIcon icon={keyOutline} />
            Credentials
          </button>
        </div>
      </div>

      <IonContent className="ipfs-modal-content">
        <div className="ipfs-modal-body">
          {activeTab === "files" ? (
            <>
              {/* Load CID Section */}
              <div className="ipfs-card">
                <div className="ipfs-card-label">Load File via CID</div>
                <p className="ipfs-card-desc">
                  Paste a CID to retrieve and open a file in the editor.
                </p>
                <div className="ipfs-cid-input-row">
                  <input
                    type="text"
                    placeholder="Qm... or bafy..."
                    value={importCid}
                    onChange={(e) => setImportCid(e.target.value)}
                    disabled={importing}
                    className="ipfs-input"
                  />
                  <button
                    className="ipfs-load-cid-btn"
                    onClick={() => handleLoadByCid(importCid)}
                    disabled={importing || !importCid.trim()}
                  >
                    {importing ? (
                      <IonSpinner name="crescent" style={{ width: 18, height: 18, color: "#fff" }} />
                    ) : (
                      <>
                        <IonIcon icon={openOutline} />
                        Load
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="ipfs-history-header">
                <span className="ipfs-history-label">Cloud Backup History</span>
                <span className="ipfs-history-count">{historyList.length}</span>
              </div>

              {historyList.length === 0 ? (
                <div className="ipfs-empty">
                  <div className="ipfs-empty-circle">
                    <IonIcon icon={cloudOutline} />
                  </div>
                  <div className="ipfs-empty-title">No Pinned Files</div>
                  <div className="ipfs-empty-sub">
                    Files you upload to IPFS will appear here.
                  </div>
                </div>
              ) : (
                <div className="ipfs-history-list">
                  {historyList.map((item, index) => (
                    <div key={item.cid + index} className="ipfs-history-item">
                      <div className="ipfs-history-item-top">
                        <div className="ipfs-history-item-info">
                          <div className="ipfs-history-item-name">
                            {item.name || "Unnamed File"}
                          </div>
                          {item.date && (
                            <div className="ipfs-history-item-date">{item.date}</div>
                          )}
                        </div>
                        <div className="ipfs-history-item-actions">
                          <button className="ipfs-icon-btn" onClick={() => handleCopyCid(item.cid)} title="Copy CID">
                            <IonIcon icon={copyOutline} />
                          </button>
                          <button className="ipfs-icon-btn primary" onClick={() => handleLoadByCid(item.cid)} title="Load">
                            <IonIcon icon={openOutline} />
                          </button>
                          <button className="ipfs-icon-btn danger" onClick={() => handleRemoveFromHistory(item.cid)} title="Remove">
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                      <div className="ipfs-history-item-cid">{item.cid}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Credentials Tab */}
              <div className="ipfs-cred-info">
                <IonIcon icon={keyOutline} />
                <span>Configure your Pinata credentials to backup and retrieve files on IPFS.</span>
              </div>

              {/* JWT */}
              <div className="ipfs-field">
                <label className="ipfs-field-lbl">Pinata JWT Token <span className="ipfs-field-rec">(Recommended)</span></label>
                <div className="ipfs-input-eye-wrap">
                  <input
                    type={showJwt ? "text" : "password"}
                    placeholder="Paste your JWT token..."
                    value={ipfsPinataJwt}
                    onChange={(e) => setIpfsPinataJwt(e.target.value)}
                    className="ipfs-input"
                  />
                  <button className="ipfs-eye-btn" onClick={() => setShowJwt(!showJwt)} type="button">
                    <IonIcon icon={showJwt ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
              </div>

              <div className="ipfs-or-divider">
                <span>OR USE API KEY</span>
              </div>

              {/* API Key */}
              <div className="ipfs-field">
                <label className="ipfs-field-lbl">Pinata API Key</label>
                <input
                  type="text"
                  placeholder="Enter API Key..."
                  value={ipfsPinataApiKey}
                  onChange={(e) => setIpfsPinataApiKey(e.target.value)}
                  className="ipfs-input"
                />
              </div>

              {/* API Secret */}
              <div className="ipfs-field">
                <label className="ipfs-field-lbl">Pinata API Secret</label>
                <div className="ipfs-input-eye-wrap">
                  <input
                    type={showApiSecret ? "text" : "password"}
                    placeholder="Enter API Secret..."
                    value={ipfsPinataApiSecret}
                    onChange={(e) => setIpfsPinataApiSecret(e.target.value)}
                    className="ipfs-input"
                  />
                  <button className="ipfs-eye-btn" onClick={() => setShowApiSecret(!showApiSecret)} type="button">
                    <IonIcon icon={showApiSecret ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
              </div>

              {/* Gateway URL */}
              <div className="ipfs-field">
                <label className="ipfs-field-lbl">Gateway URL</label>
                <input
                  type="text"
                  placeholder="https://gateway.pinata.cloud/ipfs/"
                  value={ipfsGatewayUrl}
                  onChange={(e) => setIpfsGatewayUrl(e.target.value)}
                  className="ipfs-input"
                />
                <span className="ipfs-field-hint">Custom gateway for faster retrieval</span>
              </div>

              {/* Connection Test Result */}
              {testResult !== "idle" && (
                <div className={`ipfs-test-banner ${testResult}`}>
                  <IonIcon icon={testResult === "success" ? checkmarkCircleOutline : alertCircleOutline} />
                  <span>{testMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="ipfs-cred-btns">
                <button
                  className="ipfs-cred-btn outline"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <IonSpinner name="crescent" style={{ width: 16, height: 16 }} />
                  ) : (
                    "Test Connection"
                  )}
                </button>
                <button className="ipfs-cred-btn solid" onClick={handleSaveCredentials}>
                  Save Credentials
                </button>
              </div>
            </>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          color={toastColor}
          duration={2500}
          position="bottom"
        />
      </IonContent>
    </IonModal>
  );
};
