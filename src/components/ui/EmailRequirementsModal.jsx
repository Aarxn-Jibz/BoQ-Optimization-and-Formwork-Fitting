import React, { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { sendExportEmail } from "../../services/api";

export default function EmailRequirementsModal({ isOpen, onClose, kitDetails, push, runId }) {
    const [senderEmail, setSenderEmail] = useState("");
    const [senderPassword, setSenderPassword] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [subject, setSubject] = useState(`Kit-Optima Ref: ${runId || "RUN-CURRENT"}`);
    const [message, setMessage] = useState("Please find the requested formwork kitting optimization requirements below.");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("smtp_creds");
            if (saved) {
                const { em, pw } = JSON.parse(saved);
                if (em) setSenderEmail(em);
                if (pw) setSenderPassword(pw);
            }
        } catch (e) { }
    }, []);

    if (!isOpen) return null;

    async function handleSend(e) {
        e.preventDefault();
        if (!senderEmail || !senderPassword || !toAddress) {
            push?.({ title: "Validation Error", msg: "Please fill out all required fields" }, "warn");
            return;
        }

        if (rememberMe) {
            localStorage.setItem("smtp_creds", JSON.stringify({ em: senderEmail, pw: senderPassword }));
        } else {
            localStorage.removeItem("smtp_creds");
        }

        setLoading(true);
        try {
            await sendExportEmail({
                sender_email: senderEmail,
                sender_password: senderPassword,
                to_address: toAddress,
                subject: subject,
                message: message,
                plan_data: kitDetails || []
            });
            push?.({ title: "Email Sent Successfully", msg: `Requirements delivered to ${toAddress}` }, "ok");
            onClose();
        } catch (err) {
            push?.({ title: "Email Export Failed", msg: err.message }, "err");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(8,11,18,0.85)",
            zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{
                background: "#0D1117", border: "1px solid rgba(0,212,255,0.3)",
                width: 500, boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.05)",
                display: "flex", flexDirection: "column",
                animation: "slide-up 200ms ease-out"
            }}>
                {/* Header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262D", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,212,255,0.05)" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: "#00D4FF", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 10 }}>
                        <Send size={16} /> SMTP EMAIL EXPORT
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#7D8590", cursor: "pointer" }}><X size={16} /></button>
                </div>

                <form onSubmit={handleSend} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Credentials Section */}
                    <div style={{ border: "1px solid #21262D", padding: 16, background: "#161B22" }}>
                        <div style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#7D8590", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Sender Credentials (Zero External Cost)</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <input className="obs-input" required type="email" placeholder="Your Email (Sender)" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <input className="obs-input" style={{ width: "100%", paddingRight: 30 }} required type="password" placeholder="App Password" value={senderPassword} onChange={e => setSenderPassword(e.target.value)} />
                                <div className="tooltip-wrap" style={{ position: "absolute", right: 8, cursor: "help" }}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: "50%", background: "rgba(125,133,144,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#7D8590", fontWeight: 700
                                    }}>?</div>
                                    <div className="tooltip-box" style={{ width: 220, whiteSpace: "normal", textAlign: "left", lineHeight: 1.4, bottom: "calc(100% + 8px)" }}>
                                        <b>Gmail Users:</b><br />
                                        1. Go to Google Account → Security<br />
                                        2. Enable 2-Step Verification<br />
                                        3. Search "App Passwords"<br />
                                        4. Generate a 16-letter code and paste it here.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
                            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                            <span style={{ fontSize: 12, color: "#E6EDF3", userSelect: "none" }}>Remember credentials locally</span>
                        </label>
                    </div>

                    <div style={{ borderBottom: "1px solid #21262D", margin: "4px 0" }} />

                    {/* Email Content */}
                    <input className="obs-input" required type="email" placeholder="Recipient To Address" value={toAddress} onChange={e => setToAddress(e.target.value)} />
                    <input className="obs-input" required type="text" placeholder="Subject Line" value={subject} onChange={e => setSubject(e.target.value)} />
                    <textarea className="obs-input" rows={3} style={{ height: "auto", padding: "10px", resize: "none" }} placeholder="Optional Message" value={message} onChange={e => setMessage(e.target.value)} />

                    {/* Action */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
                            {loading ? "SENDING..." : "SEND EXPORT"} <Send size={14} style={{ marginLeft: 4 }} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
