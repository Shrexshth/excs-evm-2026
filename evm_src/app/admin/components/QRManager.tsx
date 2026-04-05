"use client";
import { useState } from "react";
import { generateQRForUser } from "@/app/actions/qr-actions";
import { ToastType } from "../page"; 

interface QRManagerProps {
  showToast: (msg: string, type?: ToastType) => void;
}

export function QRManager({ showToast }: QRManagerProps) {
  // State holds only the 5 numbers the admin types
  const [userIdInput, setUserIdInput] = useState("");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);

  const handleGenerateClick = async () => {
    // Force them to enter exactly 5 digits before hitting the database
    if (userIdInput.length !== 5) {
      showToast("Please enter a valid 5-digit Roll Number.", "warn");
      return;
    }

    setLoading(true);
    setQrCodeData(null); 
    
    // Combine the prefix with the input
    const fullStudentId = `VIT-26-${userIdInput}`;
    
    // Send the complete VIT-26-XXXXX string to your server action
    const result = await generateQRForUser(fullStudentId);

    if (result.success && result.qrImageUrl) {
      setQrCodeData(result.qrImageUrl);
      setLastGeneratedId(fullStudentId); // Save the full ID for the download file name
      showToast(`QR Code generated for ${fullStudentId}!`, "success");
    } else {
      showToast(result.error || "Failed to generate QR.", "error");
    }
    
    setLoading(false);
    setUserIdInput(""); // Clear the input for the next student
  };

  const handleDownload = () => {
    if (!qrCodeData || !lastGeneratedId) return;

    const link = document.createElement("a");
    link.href = qrCodeData;
    link.download = `${lastGeneratedId}_QRCode.png`; // Saves as VIT-26-XXXXX_QRCode.png
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("QR Code saved to your computer!", "info");
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--t1)", marginBottom: "20px" }}>
        QR Code Generator
      </h2>
      <p style={{ color: "var(--t2)", marginBottom: "30px", fontSize: "0.9rem" }}>
        Generate unique, secure login QR codes for students prior to the election.
      </p>
      
      <div style={{ background: "var(--bgc)", padding: "24px", borderRadius: "12px", border: "1px solid var(--bdr)", maxWidth: "500px" }}>
        
        {/* The Input Snippet You Provided */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--t2)", marginBottom: "8px" }}>
            Enter Student Roll Number:
          </label>
          
          <div style={{ 
            display: "flex", alignItems: "center", background: "var(--bg)", 
            border: "1px solid var(--bdr)", borderRadius: "8px", overflow: "hidden" 
          }}>
            <span style={{ 
              padding: "10px 14px", background: "var(--bg2)", color: "var(--t2)", 
              fontWeight: 700, borderRight: "1px solid var(--bdr)" 
            }}>
              VIT-26-
            </span>
            <input 
              type="text" 
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value.replace(/\D/g, '').slice(0, 5))} 
              placeholder="66653"
              style={{ 
                width: "100%", padding: "10px 14px", border: "none", 
                background: "transparent", color: "var(--t1)", outline: "none", fontWeight: 600
              }}
            />
          </div>
        </div>

        <button 
          onClick={handleGenerateClick}
          disabled={loading}
          style={{
            background: loading ? "var(--bg2)" : "var(--sf)",
            color: loading ? "var(--t3)" : "#fff",
            padding: "10px 20px", borderRadius: "8px", border: "none",
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            width: "100%", transition: "all 0.2s"
          }}
        >
          {loading ? 'Generating...' : 'Generate Secure QR Code'}
        </button>

        {qrCodeData && lastGeneratedId && (
          <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid var(--bdr)", paddingTop: "20px" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gr-l)", marginBottom: "12px" }}>
              Ready for distribution:
            </p>
            
            <div style={{ background: "#fff", display: "inline-block", padding: "16px", borderRadius: "8px" }}>
              <img src={qrCodeData} alt="Student QR Code" style={{ width: "200px", height: "200px" }} />
              <p style={{ marginTop: "8px", fontWeight: "bold", color: "#000", fontSize: "1.1rem" }}>
                {lastGeneratedId}
              </p>
            </div>
            
            <button 
              onClick={handleDownload}
              style={{
                display: "block",
                margin: "20px auto 0",
                background: "var(--bg2)",
                color: "var(--t1)",
                border: "1px solid var(--bdr)",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              📥 Download Named File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}