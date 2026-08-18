import React, { useState, useEffect, useRef } from "react";
import {
  IonModal,
  IonContent,
  IonIcon,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import {
  closeOutline,
  sparklesOutline,
  micOutline,
  micOffOutline,
  sendOutline,
  cloudOutline,
  copyOutline,
  openOutline,
  trashOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  timeOutline,
  imageOutline,
} from "ionicons/icons";
import {
  chatWithCloudAgent,
  getCloudReports,
  fetchIpfsFile,
  type ReportItem,
  type CloudAgentChatResponse,
} from "../services/cloud-agent-service";
import "./CloudAgentPanel.css";

interface CloudAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onReportLoaded?: (report: any) => void;
}

export const CloudAgentPanel: React.FC<CloudAgentPanelProps> = ({
  isOpen,
  onClose,
  userId,
  onReportLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<"agent" | "history">("agent");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentMessage, setAgentMessage] = useState("");
  const [lastCid, setLastCid] = useState("");

  // Image Upload States
  const [image, setImage] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageType, setImageType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file.", "warning");
      return;
    }

    if (file.size > 3.75 * 1024 * 1024) {
      showNotification("Image size must be less than 3.75 MB.", "warning");
      return;
    }

    setImageType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setImage(base64String);
    };
    reader.onerror = () => {
      showNotification("Failed to read image file.", "danger");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage("");
    setPreviewImage("");
    setImageType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // History
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "warning" | "danger" | "primary">("primary");

  // Speech recognition reference
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoggedIn = userId !== undefined && userId !== null && userId !== "" && userId !== "offline_user";

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen, userId]);

  const loadReports = async () => {
    if (!isLoggedIn) {
      setReports([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const list = await getCloudReports(userId);
      setReports(list);
    } catch (e) {
      console.warn("Failed to load reports:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const showNotification = (msg: string, color: "success" | "warning" | "danger" | "primary" = "primary") => {
    setToastMessage(msg);
    setToastColor(color);
    setShowToast(true);
  };

  // ─── Voice Input ───────────────────────────────────────────

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotification("Speech recognition is not supported in this browser.", "warning");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = prompt;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += " " + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setPrompt((finalTranscript + " " + interim).trim());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error !== "aborted") {
        showNotification(`Voice input error: ${event.error}`, "danger");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ─── Send Prompt ───────────────────────────────────────────

  const handleSend = async () => {
    if (!prompt.trim() && !image) {
      showNotification("Please enter a prompt or upload an image first.", "warning");
      return;
    }
    if (!userId) {
      showNotification("User ID is required. Please configure your settings.", "warning");
      return;
    }

    stopListening();
    setIsLoading(true);
    setAgentMessage("");
    setLastCid("");

    try {
      const result: CloudAgentChatResponse = await chatWithCloudAgent({
        userId,
        prompt: prompt.trim(),
        templateName: window.innerWidth >= 768 ? "tablet" : "mobile",
        image: image || undefined,
        imageType: imageType || undefined,
      });

      setAgentMessage(result.message);
      setLastCid(result.cid);
      setPrompt("");
      handleRemoveImage();

      showNotification("Report generated and saved to IPFS!", "success");

      // Reload history
      loadReports();

      // If callback provided, load the report into the editor
      if (onReportLoaded && result.report) {
        onReportLoaded(result.report);
      }
    } catch (e: any) {
      setAgentMessage("");
      showNotification(e.message || "Agent request failed.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── History Actions ───────────────────────────────────────

  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    showNotification("CID copied to clipboard!", "success");
  };

  const handleOpenInGateway = (url: string) => {
    window.open(url, "_blank");
  };

  const handleLoadReport = async (item: ReportItem) => {
    setIsLoading(true);
    showNotification("Fetching report from IPFS...", "primary");
    try {
      let reportData: any = null;
      let lastError: any = null;

      // 1. Try backend proxy first (has Pinata JWT and dedicated gateway authentication)
      if (item.cid) {
        try {
          reportData = await fetchIpfsFile(item.cid);
        } catch (e) {
          lastError = e;
        }
      }

      // 2. If backend proxy failed, try item.url and public gateways
      if (!reportData) {
        const candidateUrls = [
          item.url,
          `https://gateway.pinata.cloud/ipfs/${item.cid}`,
          `https://cyan-worthy-dragon-639.mypinata.cloud/ipfs/${item.cid}`,
          `https://ipfs.io/ipfs/${item.cid}`,
          `https://dweb.link/ipfs/${item.cid}`,
          `https://cloudflare-ipfs.com/ipfs/${item.cid}`,
        ].filter(Boolean);

        for (const url of candidateUrls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              reportData = await res.json();
              break;
            }
          } catch (e) {
            lastError = e;
          }
        }
      }

      if (!reportData) {
        throw new Error(lastError?.message || "Failed to fetch report from IPFS gateways");
      }

      // Use onReportLoaded callback if available (loads directly into current editor)
      if (onReportLoaded) {
        onReportLoaded(reportData);
        showNotification("Successfully loaded report!", "success");
        onClose();
      } else {
        // Fallback: save to localStorage and navigate
        localStorage.setItem("ipfs_temp_invoice_content", JSON.stringify(reportData));
        showNotification("Successfully loaded report from IPFS!", "success");
        window.location.href = "/app/tabs/home/invoice";
        onClose();
      }
    } catch (err: any) {
      console.error("IPFS Load Error:", err);
      showNotification(`Load failed: ${err.message || "check connection/gateway"}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="cloud-agent-modal"
      initialBreakpoint={0.92}
      breakpoints={[0, 0.5, 0.92]}
      handle={true}
    >
      {/* Header */}
      <div className="ca-modal-header">
        <div className="ca-modal-header-top">
          <div className="ca-modal-header-left">
            <div className="ca-modal-header-icon-wrap">
              <IonIcon icon={sparklesOutline} />
            </div>
            <span className="ca-modal-header-text">Cloud Agent</span>
          </div>
          <button className="ca-modal-close-btn" onClick={onClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="ca-tab-switcher">
          <button
            className={`ca-tab-btn ${activeTab === "agent" ? "active" : ""}`}
            onClick={() => setActiveTab("agent")}
          >
            <IonIcon icon={sparklesOutline} />
            Agent
          </button>
          <button
            className={`ca-tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <IonIcon icon={timeOutline} />
            Reports
          </button>
        </div>
      </div>

      <IonContent className="ca-modal-content">
        <div className="ca-modal-body">
          {!isLoggedIn ? (
            <div className="ca-empty" style={{ padding: "60px 20px", textAlign: "center" }}>
              <div className="ca-empty-circle" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <IonIcon icon={alertCircleOutline} style={{ fontSize: 40 }} />
              </div>
              <div className="ca-empty-title" style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--ion-text-color, #000)" }}>Authentication Required</div>
              <div className="ca-empty-sub" style={{ maxWidth: "300px", margin: "10px auto 0", color: "var(--ion-color-medium, #666)", fontSize: "0.95rem", lineHeight: "1.4" }}>
                Please sign in or create an account under <strong>Settings</strong> to use the Cloud Agent to edit files and manage your reports.
              </div>
            </div>
          ) : activeTab === "agent" ? (
            <>
              {/* Agent Tab */}
              <div className="ca-info-banner">
                <IonIcon icon={sparklesOutline} />
                <span>
                  Tell the AI agent what you'd like to add or update in your Invoice.
                  It will edit the template, save it to IPFS, and sync it to your account.
                </span>
              </div>

              {/* Prompt Input Area */}
              <div className="ca-prompt-area">
                <textarea
                  ref={textareaRef}
                  className="ca-prompt-textarea"
                  placeholder={isListening ? "Listening... speak now" : "e.g. Add 5 hours of Consulting at $150/hr for Acme Corp..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                />

                {previewImage && (
                  <div className="ca-image-preview-container">
                    <img src={previewImage} alt="Selected preview" className="ca-image-preview" />
                    <button className="ca-remove-image-btn" onClick={handleRemoveImage} title="Remove image">
                      <IonIcon icon={closeOutline} />
                    </button>
                  </div>
                )}

                <div className="ca-prompt-actions">
                  <div style={{ display: "flex", gap: "8px" }}>
                    {/* Voice button */}
                    <button
                      className={`ca-voice-btn ${isListening ? "active" : ""}`}
                      onClick={toggleVoice}
                      disabled={isLoading}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      <IonIcon icon={isListening ? micOffOutline : micOutline} />
                      {isListening && <span className="ca-voice-pulse" />}
                    </button>

                    {/* Image Upload Button */}
                    <button
                      className="ca-image-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      title="Upload image"
                    >
                      <IonIcon icon={imageOutline} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* Send button */}
                  <button
                    className="ca-send-btn"
                    onClick={handleSend}
                    disabled={isLoading || (!prompt.trim() && !image)}
                  >
                    {isLoading ? (
                      <IonSpinner name="crescent" style={{ width: 18, height: 18, color: "#fff" }} />
                    ) : (
                      <>
                        <IonIcon icon={sendOutline} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="ca-loading-state">
                  <div className="ca-loading-spinner-wrap">
                    <IonSpinner name="dots" />
                  </div>
                  <div className="ca-loading-text">
                    <strong>Agent is working...</strong>
                    <p>Editing template via MCP tools, uploading to IPFS, and syncing to MongoDB.</p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {agentMessage && !isLoading && (
                <div className="ca-success-card">
                  <div className="ca-success-icon">
                    <IonIcon icon={checkmarkCircleOutline} />
                  </div>
                  <div className="ca-success-body">
                    <strong>Report Generated</strong>
                    <p>{agentMessage}</p>
                    {lastCid && (
                      <div className="ca-success-cid">
                        <span className="ca-cid-label">CID:</span>
                        <code>{lastCid}</code>
                        <button className="ca-cid-copy" onClick={() => handleCopyCid(lastCid)}>
                          <IonIcon icon={copyOutline} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* History Tab */}
              <div className="ca-history-header">
                <span className="ca-history-label">Generated Reports</span>
                <span className="ca-history-count">{reports.length}</span>
              </div>

              {loadingHistory ? (
                <div className="ca-loading-state" style={{ padding: "40px 0" }}>
                  <IonSpinner name="dots" />
                </div>
              ) : reports.length === 0 ? (
                <div className="ca-empty">
                  <div className="ca-empty-circle">
                    <IonIcon icon={cloudOutline} />
                  </div>
                  <div className="ca-empty-title">No Invoices Yet</div>
                  <div className="ca-empty-sub">
                    Use the Agent tab to generate your first invoice.
                  </div>
                </div>
              ) : (
                <div className="ca-report-list">
                  {reports.map((item, index) => (
                    <div key={item.cid + index} className="ca-report-item">
                      <div className="ca-report-item-top">
                        <div className="ca-report-item-info">
                          <div className="ca-report-item-name">{item.name || "Unnamed Report"}</div>
                          {item.date && <div className="ca-report-item-date">{item.date}</div>}
                        </div>
                        <div className="ca-report-item-actions">
                          <button className="ca-icon-btn" onClick={() => handleCopyCid(item.cid)} title="Copy CID">
                            <IonIcon icon={copyOutline} />
                          </button>
                          <button className="ca-icon-btn primary" onClick={() => handleLoadReport(item)} title="Load Report in Editor">
                            <IonIcon icon={openOutline} />
                          </button>
                          <button className="ca-icon-btn" onClick={() => handleOpenInGateway(item.url)} title="View on Gateway">
                            <IonIcon icon={cloudOutline} />
                          </button>
                        </div>
                      </div>
                      <div className="ca-report-item-cid">{item.cid}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonModal>
  );
};
