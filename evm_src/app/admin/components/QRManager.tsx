"use client";
import { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Printer, RefreshCw, CheckCircle2 } from "lucide-react";

interface Props {
  showToast: (m: string, t?: string) => void;
}

// Updated interface to catch every possible way the backend might send the ID
interface Voter {
  id: number;
  voterId?: string; 
  enrollmentNumber?: string;
  rollNumber?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  hasVoted: boolean;
}

export function QRManager({ showToast }: Props) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVoters = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const r = await fetch(`/api/admin/voters?limit=500`, {
        headers: { "x-admin-token": token },
      });
      const j = await r.json();
      
      if (j.success) {
        setVoters(j.voters);
      } else {
        showToast("Failed to load voters for QR generation", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadVoters();
  }, [loadVoters]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qr-manager-container">
      {/* HEADER - Hidden during printing */}
      <div className="no-print" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-s)", fontSize: "2rem", fontWeight: 400, color: "var(--t1)", marginBottom: "4px" }}>
            Election QR Passes
          </div>
          <div style={{ fontSize: ".82rem", color: "var(--t3)" }}>
            Generate and print scan-ready QR codes for verified students.
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={loadVoters}
            style={{
              padding: "10px 16px", background: "var(--bg2)",
              border: "1px solid var(--bdr)", borderRadius: "9px",
              color: "var(--t2)", fontSize: ".8rem", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", background: "linear-gradient(135deg,var(--ck),var(--ck-l))",
              color: "#fff", border: "none", borderRadius: "9px",
              fontSize: ".8rem", fontWeight: 700, letterSpacing: ".08em", cursor: "pointer",
            }}
          >
            <Printer size={16} /> Print All Passes
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--t3)" }}>Loading student database...</div>
      ) : voters.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--t3)" }}>No students found in the registry.</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
        }} className="qr-grid">
          
          {voters.map((voter, idx) => {
            // 🚨 THE FIX: Bulletproof string extraction
            // We check every possible property name and force it to be a strict string type.
            // If the DB sends VIT25/SC/00002, this guarantees it gets caught.
            const rawId = voter.voterId || voter.enrollmentNumber || voter.rollNumber || `UNKNOWN-${voter.id || idx}`;
            const idToEncode = String(rawId);
            
            const studentName = voter.name || (voter.firstName ? `${voter.firstName} ${voter.lastName}` : "Unknown Student");

            return (
              <div key={idx} style={{
                background: "var(--bgc)", border: "1px solid var(--bdr)",
                borderRadius: "12px", padding: "20px",
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", position: "relative",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                pageBreakInside: "avoid" 
              }}>
                
                {voter.hasVoted && (
                  <div className="no-print" style={{
                    position: "absolute", top: "10px", right: "10px",
                    background: "rgba(19,136,8,.1)", color: "var(--gr-l)",
                    padding: "4px 8px", borderRadius: "100px", fontSize: ".6rem", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "4px"
                  }}>
                    <CheckCircle2 size={12} /> Voted
                  </div>
                )}

                <div style={{ 
                  background: "#fff", padding: "12px", borderRadius: "8px", 
                  marginBottom: "16px", border: "1px solid #eaeaea",
                  opacity: voter.hasVoted ? 0.3 : 1 
                }}>
                  {/* SAFE QR CANVAS */}
                  <QRCodeCanvas 
                    value={idToEncode} 
                    size={130} 
                    level={"H"} 
                    fgColor={"#000000"} 
                  />
                </div>

                <div style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--t1)", marginBottom: "4px", lineHeight: 1.2 }}>
                  {studentName}
                </div>
                
                {/* Visual verification of the ID format */}
                <div style={{ fontFamily: "var(--font-m)", fontSize: ".75rem", color: "var(--sf)", fontWeight: 600 }}>
                  {idToEncode}
                </div>
                
                <div style={{ fontSize: ".6rem", color: "var(--t3)", marginTop: "12px", textTransform: "uppercase", letterSpacing: ".1em" }}>
                  TRIVOTE · 2026 ELECTION
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS for Print Mode */}
      <style>{`
        @media print {
          aside, nav, .tristrip, .no-print { display: none !important; }
          body, main, .admin-main-content, .qr-manager-container {
            margin: 0 !important; padding: 0 !important;
            background: white !important; width: 100% !important;
          }
          .qr-grid > div {
            border: 1px dashed #ccc !important; box-shadow: none !important;
            break-inside: avoid;
          }
          .qr-grid {
            grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}