import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonAlert,
    IonInput,
    IonItem,
    IonLabel,
    IonToast,
    isPlatform
} from '@ionic/react';
import { useInvoice } from '../contexts/InvoiceContext';
import { useStatusBar, StatusBarPresets } from '../hooks/useStatusBar';
import { loginUser, registerUser } from '../services/cloud-agent-service';
import './SettingsPage.css';

const CURRENCIES = [
    { label: 'INR - Indian Rupee (₹)', value: 'INR' },
    { label: 'USD - US Dollar ($)', value: 'USD' },
    { label: 'EUR - Euro (€)', value: 'EUR' },
    { label: 'GBP - British Pound (£)', value: 'GBP' },
    { label: 'JPY - Japanese Yen (¥)', value: 'JPY' },
    { label: 'AUD - Australian Dollar (A$)', value: 'AUD' },
    { label: 'CAD - Canadian Dollar (C$)', value: 'CAD' }
];

const SettingsPage: React.FC = () => {
    const { currency, updateCurrency } = useInvoice();
    const [showResetAlert, setShowResetAlert] = useState(false);
    
    // Auth State
    const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("user_email"));
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isRegisteringMode, setIsRegisteringMode] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastColor, setToastColor] = useState<"success" | "danger" | "warning">("success");

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput.trim() || !passwordInput.trim()) {
            setToastMessage("Please enter email and password.");
            setToastColor("warning");
            setShowToast(true);
            return;
        }
        
        setAuthLoading(true);
        try {
            if (isRegisteringMode) {
                await registerUser(emailInput.trim(), passwordInput.trim());
                // Automatically log in after registration
                const loginRes = await loginUser(emailInput.trim(), passwordInput.trim());
                localStorage.setItem("user_email", loginRes.email);
                setUserEmail(loginRes.email);
                setToastMessage("Account created and logged in successfully!");
                setToastColor("success");
                setShowToast(true);
            } else {
                const res = await loginUser(emailInput.trim(), passwordInput.trim());
                localStorage.setItem("user_email", res.email);
                setUserEmail(res.email);
                setToastMessage("Logged in successfully!");
                setToastColor("success");
                setShowToast(true);
            }
            setEmailInput("");
            setPasswordInput("");
        } catch (err: any) {
            setToastMessage(err.message || "Authentication failed.");
            setToastColor("danger");
            setShowToast(true);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user_email");
        setUserEmail(null);
        setToastMessage("Logged out successfully.");
        setToastColor("success");
        setShowToast(true);
    };

    // Initialize status bar
    useStatusBar(StatusBarPresets.light);

    // Enforce light theme on mount
    useEffect(() => {
        document.body.classList.remove('dark');
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }, []);

    const handleResetAllData = () => {
        // Clear all local storage
        localStorage.clear();
        // Force complete page reload to redirect to onboarding welcome step
        window.location.href = '/';
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar style={{ paddingTop: `max(env(safe-area-inset-top, 0px), 24px)`, minHeight: '56px' }}>
                    <IonTitle style={{ fontWeight: 600 }}>App Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding" style={{ "--background": "#f8fafc" }}>
                <div className="settings-container">
                    
                    {/* General Settings */}
                    <div className="settings-group">
                        <div className="settings-group-title">Preferences</div>
                        
                        {/* Currency selector */}
                        <div className="settings-card">
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Default Currency</h4>
                                    <p className="settings-card-desc">Change the display currency for your records and invoices.</p>
                                </div>
                                <div className="settings-action">
                                    <IonSelect
                                        value={currency || 'INR'}
                                        interface="popover"
                                        className="settings-select"
                                        onIonChange={(e) => updateCurrency(e.detail.value)}
                                    >
                                        {CURRENCIES.map((c) => (
                                            <IonSelectOption key={c.value} value={c.value}>
                                                {c.value}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Account / Authentication */}
                    <div className="settings-group">
                        <div className="settings-group-title">User Account</div>
                        <div className="settings-card">
                            {userEmail ? (
                                <div>
                                    <div className="settings-row" style={{ marginBottom: '16px' }}>
                                        <div className="settings-info">
                                            <h4 className="settings-card-title">Logged In</h4>
                                            <p className="settings-card-desc">Your reports are automatically synced and saved to this account.</p>
                                        </div>
                                        <div className="settings-action">
                                            <span style={{ fontWeight: 600, color: 'var(--ion-color-step-700, #475569)', marginRight: '8px' }}>
                                                {userEmail}
                                            </span>
                                        </div>
                                    </div>
                                    <IonButton
                                        expand="block"
                                        color="light"
                                        onClick={handleLogout}
                                        style={{ fontWeight: 600, textTransform: 'none' }}
                                    >
                                        Log Out
                                    </IonButton>
                                </div>
                            ) : (
                                <form onSubmit={handleAuthSubmit}>
                                    <h4 className="settings-card-title" style={{ marginBottom: '16px' }}>
                                        {isRegisteringMode ? "Create an Account" : "Sign In"}
                                    </h4>
                                    
                                    <IonItem lines="none" style={{
                                        border: '1px solid var(--ion-color-step-200, #cbd5e1)',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        "--background": 'transparent'
                                    }}>
                                        <IonLabel position="stacked" style={{ color: 'var(--ion-color-step-600, #64748b)' }}>Email Address</IonLabel>
                                        <IonInput
                                            type="email"
                                            value={emailInput}
                                            placeholder="Enter your email"
                                            onIonInput={(e) => setEmailInput(e.detail.value!)}
                                            required
                                        />
                                    </IonItem>

                                    <IonItem lines="none" style={{
                                        border: '1px solid var(--ion-color-step-200, #cbd5e1)',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        "--background": 'transparent'
                                    }}>
                                        <IonLabel position="stacked" style={{ color: 'var(--ion-color-step-600, #64748b)' }}>Password</IonLabel>
                                        <IonInput
                                            type="password"
                                            value={passwordInput}
                                            placeholder="Enter password"
                                            onIonInput={(e) => setPasswordInput(e.detail.value!)}
                                            required
                                        />
                                    </IonItem>

                                    <IonButton
                                        type="submit"
                                        expand="block"
                                        color="primary"
                                        disabled={authLoading}
                                        style={{ fontWeight: 600, textTransform: 'none', marginBottom: '12px' }}
                                    >
                                        {authLoading ? "Authenticating..." : (isRegisteringMode ? "Sign Up" : "Sign In")}
                                    </IonButton>

                                    <div style={{ textAlign: 'center', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--ion-color-step-500, #64748b)' }}>
                                            {isRegisteringMode ? "Already have an account?" : "New to Invoice?"}
                                        </span>
                                        <IonButton
                                            fill="clear"
                                            size="small"
                                            onClick={() => setIsRegisteringMode(!isRegisteringMode)}
                                            style={{ textTransform: 'none', fontWeight: 600, marginLeft: '4px' }}
                                        >
                                            {isRegisteringMode ? "Sign In instead" : "Create Account"}
                                        </IonButton>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Data management */}
                    <div className="settings-group">
                        <div className="settings-group-title">Data Protection</div>
                        <div className="settings-card">
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Reset App Data</h4>
                                    <p className="settings-card-desc">Wipe all local invoice files, custom templates, and configuration settings completely.</p>
                                </div>
                                <div className="settings-action">
                                    <IonButton
                                        className="reset-btn"
                                        color="danger"
                                        onClick={() => setShowResetAlert(true)}
                                    >
                                        Reset
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App info */}
                    <div className="settings-group">
                        <div className="settings-group-title">Application Info</div>
                        <div className="settings-card" style={{ padding: '16px 20px' }}>
                            <div className="info-row">
                                <span className="info-label">App Name</span>
                                <span className="info-value">Invoice</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Marketing Version</span>
                                <span className="info-value">1.0</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Build Number</span>
                                <span className="info-value">1.0</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Reset Warning Dialog */}
                <IonAlert
                    isOpen={showResetAlert}
                    onDidDismiss={() => setShowResetAlert(false)}
                    header="Reset All Data?"
                    message="Are you absolutely sure you want to delete all saved receipts and settings? This operation is permanent and cannot be undone."
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        },
                        {
                            text: 'Delete Everything',
                            role: 'destructive',
                            handler: handleResetAllData
                        }
                    ]}
                />

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    color={toastColor}
                />
            </IonContent>
        </IonPage>
    );
};

export default SettingsPage;
