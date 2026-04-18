// src/app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, Keyboard } from "lucide-react";

// 🚨 IMPORT YOUR NEW SERVER ACTION HERE
import { processQRScan } from "../actions/auth-actions";

/* view: "choice" | "voter" | "admin" */
export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState("choice");

  // Student State
  const [studentTab, setStudentTab] = useState<"qr" | "manual">("qr");
  const [manualId, setManualId] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Admin State
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  // --- STUDENT: QR SCANNER LOGIC ---
  useEffect(() => {
    if (view !== "voter" || studentTab !== "qr") return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    async function onScanSuccess(decodedText: string) {
      scanner.clear();
      setIsScanning(false);
      setIsLoading(true);

      try {
        // 🚨 NOW USING THE SECURE SERVER ACTION
        const res = await processQRScan(decodedText);

        if (res.success) {
          showToast("✅ Token verified. Entering voting booth...");
          router.push('/vote');
        } else {
          showToast(res.message);
          setIsScanning(true);
          setIsLoading(false);
        }
      } catch (err) {
        showToast("⚠️ Network error. Please try again.");
        setIsScanning(true);
        setIsLoading(false);
      }
    }

    scanner.render(onScanSuccess, () => { });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [view, studentTab, router]);

  // --- STUDENT: MANUAL LOGIN LOGIC ---
  async function studentManualLogin(e: React.FormEvent) {
    e.preventDefault();

    // 🚨 NEW VALIDATION: Checks for the VIT25/SC/00002 format
    const rollRegex = /^VIT\d{2}\/[A-Z]{2,4}\/\d{4,5}$/;

    if (!rollRegex.test(manualId) || !manualPassword) {
      showToast("⚠️ Please enter a valid Roll Number (e.g., VIT25/SC/00002) and password.");
      return;
    }

    setIsLoading(true);

    try {
      // 🚨 Passes the raw manualId directly to your login route
      const res = await fetch("/api/auth/manual-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: manualId, password: manualPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("✅ Login successful. Entering voting booth...");
        router.push("/vote");
      } else {
        showToast(`❌ ${data.message || "Invalid credentials."}`);
        setIsLoading(false);
      }
    } catch (err) {
      showToast("⚠️ Connection error. Please try again.");
      setIsLoading(false);
    }
  }

  // --- ADMIN: LOGIN LOGIC ---
  async function adminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminUser || !adminPass) {
      showToast("⚠️ Please enter username and password.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: adminUser, password: adminPass }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);

        window.dispatchEvent(new Event("auth-change"));
        showToast(`✅ Access Granted. Welcome, ${data.user.name}`);
        setTimeout(() => router.push("/admin"), 1000);
      } else {
        showToast(`❌ ${data.message || "Invalid credentials."}`);
      }
    } catch (err) {
      showToast("⚠️ Could not reach server. Check your connection.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 40px", display: "flex", flexDirection: "column", alignItems: "center" }} className="page-wrap">

        <div className="eye" style={{ textAlign: "center" }}>Access Portal</div>
        <h1 style={{ fontFamily: "var(--font-s)", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 300, color: "var(--t1)", textAlign: "center", marginBottom: "8px" }}>
          Choose Your Login
        </h1>
        <p style={{ fontSize: ".84rem", color: "var(--t3)", textAlign: "center", marginBottom: "60px", letterSpacing: ".05em" }}>
          Select the portal that applies to you
        </p>

        {/* ── Choice Cards ── */}
        {view === "choice" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", width: "100%", maxWidth: "820px" }} className="login-cards">
            {/* Voter card */}
            <div style={{ background: "var(--bgc)", border: "1px solid var(--bdr)", borderRadius: "16px", padding: "40px", cursor: "pointer", transition: "all .4s", position: "relative", overflow: "hidden" }} onClick={() => setView("voter")}>
              <div style={{ width: "72px", height: "72px", borderRadius: "16px", background: "rgba(255,107,53,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "24px" }}>🎓</div>
              <h2 style={{ fontFamily: "var(--font-s)", fontSize: "1.6rem", fontWeight: 400, color: "var(--t1)", marginBottom: "8px" }}>Student / Voter</h2>
              <p style={{ fontSize: ".84rem", color: "var(--t2)", lineHeight: 1.7, marginBottom: "28px" }}>Enrolled students. Scan your secure token or enter your credentials to vote.</p>
              <button className="btn-p" style={{ fontSize: ".78rem", padding: "11px 24px" }}>Login as Student →</button>
            </div>

            {/* Admin card */}
            <div style={{ background: "var(--bgc)", border: "1px solid var(--bdr)", borderRadius: "16px", padding: "40px", cursor: "pointer", transition: "all .4s", position: "relative", overflow: "hidden" }} onClick={() => setView("admin")}>
              <div style={{ width: "72px", height: "72px", borderRadius: "16px", background: "rgba(0,71,171,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "24px" }}>🛡️</div>
              <h2 style={{ fontFamily: "var(--font-s)", fontSize: "1.6rem", fontWeight: 400, color: "var(--t1)", marginBottom: "8px" }}>Election Admin</h2>
              <p style={{ fontSize: ".84rem", color: "var(--t2)", lineHeight: 1.7, marginBottom: "28px" }}>Authorized committee members only. Monitor votes, manage candidates, and publish outcomes.</p>
              <button className="btn-ck" style={{ fontSize: ".78rem", padding: "11px 24px" }}>Login as Admin →</button>
            </div>
          </div>
        )}

        {/* ── Student Hybrid Portal (QR / Manual) ── */}
        {view === "voter" && (
          <div style={{ background: "var(--bgc)", border: "1px solid var(--bdr)", borderRadius: "16px", padding: "40px", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ fontFamily: "var(--font-s)", fontSize: "1.7rem", fontWeight: 400, color: "var(--t1)", marginBottom: "20px" }}>Student Login</h2>

            {/* Tabs */}
            <div style={{ display: "flex", background: "var(--bg)", borderRadius: "8px", padding: "4px", marginBottom: "24px", border: "1px solid var(--bdr)" }}>
              <button onClick={() => setStudentTab("qr")} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 600, cursor: "pointer", background: studentTab === "qr" ? "var(--bgc)" : "transparent", color: studentTab === "qr" ? "var(--t1)" : "var(--t3)", boxShadow: studentTab === "qr" ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>
                <QrCode size={16} /> Scan QR
              </button>
              <button onClick={() => setStudentTab("manual")} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 600, cursor: "pointer", background: studentTab === "manual" ? "var(--bgc)" : "transparent", color: studentTab === "manual" ? "var(--t1)" : "var(--t3)", boxShadow: studentTab === "manual" ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>
                <Keyboard size={16} /> Manual
              </button>
            </div>

            {/* QR Scanner Content */}
            {studentTab === "qr" && (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: ".78rem", color: "var(--t3)", marginBottom: "20px" }}>Hold your token up to the camera.</p>
                {isLoading ? (
                  <div style={{ padding: "40px", color: "var(--sf)", fontWeight: 600 }}>Verifying token...</div>
                ) : (
                  <div id="reader" style={{ width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--bdr)" }}></div>
                )}
              </div>
            )}

            {/* Manual Form Content */}
            {studentTab === "manual" && (
              <form onSubmit={studentManualLogin}>
                <div className="fgrp">
                  <label className="flbl">Roll Number</label>
                  <div style={{ display: "flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--bdr)", borderRadius: "8px", overflow: "hidden" }}>

                    {/* 🚨 NEW: Clean input that auto-formats for slashes and capitals */}
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value.replace(/[^A-Za-z0-9/]/g, '').toUpperCase())}
                      placeholder="VIT25/SC/00002"
                      style={{ width: "100%", padding: "12px", border: "none", background: "transparent", color: "var(--t1)", outline: "none", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div className="fgrp">
                  <label className="flbl">Password</label>
                  <input className="finp" type="password" placeholder="••••••••" value={manualPassword} onChange={e => setManualPassword(e.target.value)} />
                </div>
                <button type="submit" disabled={isLoading} className="btn-p" style={{ width: "100%", padding: "13px", marginTop: "10px", opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? "Authenticating..." : "Login to Vote →"}
                </button>
              </form>
            )}

            <button type="button" onClick={() => setView("choice")} className="btn-secondary" style={{ width: "100%", marginTop: "12px" }}>Back to Selection</button>
          </div>
        )}

        {/* ── Admin Form (Unchanged) ── */}
        {view === "admin" && (
          <div style={{ background: "var(--bgc)", border: "1px solid var(--bdr)", borderRadius: "16px", padding: "40px", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ fontFamily: "var(--font-s)", fontSize: "1.7rem", fontWeight: 400, color: "var(--t1)", marginBottom: "5px" }}>Admin Login</h2>
            <p style={{ fontSize: ".78rem", color: "var(--t3)", marginBottom: "28px" }}>Actions are logged for security audits.</p>
            <form onSubmit={adminLogin}>
              <div className="fgrp"><label className="flbl">Username</label>
                <input className="finp finp-blue" placeholder="username" value={adminUser} onChange={e => setAdminUser(e.target.value)} /></div>
              <div className="fgrp"><label className="flbl">Password</label>
                <input className="finp finp-blue" type="password" placeholder="••••••••" value={adminPass} onChange={e => setAdminPass(e.target.value)} /></div>
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="submit" className="btn-ck" style={{ flex: 1, justifyContent: "center", padding: "13px" }}>Access Panel →</button>
                <button type="button" onClick={() => setView("choice")} className="btn-secondary">Back</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
      <Footer />

      <style jsx>{`
        .btn-secondary { padding: 13px 18px; background: transparent; border: 1.5px solid var(--bdr); border-radius: 8px; color: var(--t3); cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { color: var(--t1); border-color: var(--t2); }
        .toast { position: fixed; bottom: 28px; right: 28px; z-index: 5000; background: var(--bgc); border: 1px solid var(--bdr); border-left: 3px solid var(--sf); border-radius: 10px; padding: 14px 22px; font-size: 0.86rem; color: var(--t1); animation: popIn 0.3s ease; }
        @keyframes popIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}