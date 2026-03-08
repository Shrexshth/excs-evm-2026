// src/app/admin/components/SystemControl.tsx
// Super Admin God Mode: Start / Pause / Complete / Kill Switch + Results publish

"use client";
import { useState, useEffect, useCallback } from "react";

// 👇 FIXED: Removed broken imports and defined Props inline
interface Props { 
  showToast: (m: string, t?: "success" | "error" | "warn" | "info" | string) => void; 
}

interface ElectionState {
  id: string; name: string; status: string;
  resultsPublished: boolean; pollingDate: string;
  pollingHours: string; constituency: string;
}

type ActionKey = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

const SYSTEM_ACTIONS: {
  key: ActionKey; label: string; icon: string;
  desc: string; color: string; glow: string;
  confirmText: string; dangerous?: boolean;
}[] = [
  {
    key: "ACTIVE",
    label: "Start Polling",
    icon: "▶️",
    desc: "Opens the voting portal. Students can now cast their votes.",
    color: "var(--gr-l)",
    glow: "rgba(19,136,8,.25)",
    confirmText: "Start the election? Voters will be able to cast votes immediately.",
  },
  {
    key: "PAUSED",
    label: "Pause Polling",
    icon: "⏸️",
    desc: "Temporarily suspends voting. No new votes will be accepted.",
    color: "var(--gold)",
    glow: "rgba(200,150,30,.25)",
    confirmText: "Pause the election? Voting will be suspended until you resume it.",
  },
  {
    key: "COMPLETED",
    label: "Close Polling",
    icon: "🔒",
    desc: "Permanently closes the election. Cannot be re-opened.",
    color: "var(--ck-l)",
    glow: "rgba(0,71,171,.25)",
    confirmText: "Close the election permanently? This action cannot be undone.",
    dangerous: true,
  },
  {
    key: "CANCELLED",
    label: "Kill Switch",
    icon: "🚨",
    desc: "EMERGENCY: Immediately cancels the entire election.",
    color: "#EF4444",
    glow: "rgba(239,68,68,.25)",
    confirmText: "⚠️ EMERGENCY CANCEL — This will DESTROY the election. Are you absolutely sure?",
    dangerous: true,
  },
];

export function SystemControl({ showToast }: Props) {
  const [election, setElection] = useState<ElectionState | null>(null);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem("accessToken") || localStorage.getItem("temp_user_id") || "superadmin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const r = await fetch("/api/admin/election", {
        headers: { "x-admin-token": token }, // FIXED: Using raw SQL header standard
      });
      const j = await r.json();
      if (j.success) setElection(j.election);
    } catch { showToast("Failed to load election state", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (status: ActionKey, confirmText: string) => {
    if (!confirm(confirmText)) return;
    setActing(status);
    try {
      const token = getAuthToken();
      const r = await fetch("/api/admin/election", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ status }),
      });
      const j = await r.json();
      if (j.success) {
        showToast(`Election status → ${status}`, "success");
        load();
      } else {
        showToast(j.message, "error");
      }
    } catch { showToast("Action failed", "error"); }
    finally { setActing(null); }
  };

  const toggleResults = async (publish: boolean) => {
    if (!confirm(
      publish
        ? "Publish results? Students will immediately see the vote tally."
        : "Unpublish results? They will no longer be visible to students."
    )) return;
    setActing("results");
    try {
      const token = getAuthToken();
      const r = await fetch("/api/admin/election", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ resultsPublished: publish }),
      });
      const j = await r.json();
      if (j.success) {
        showToast(publish ? "Results published to students" : "Results hidden", "success");
        load();
      } else {
        showToast(j.message, "error");
      }
    } catch { showToast("Failed to update results visibility", "error"); }
    finally { setActing(null); }
  };

  if (loading) return (
    <div style={{ color: "var(--t3)", padding: "40px", textAlign: "center" }}>
      Loading system state…
    </div>
  );

  const statusInfo: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE:    { label: "🟢 Polling Active",    color: "var(--gr-l)",  bg: "rgba(19,136,8,.1)"   },
    PAUSED:    { label: "⏸️ Polling Paused",    color: "var(--gold)",  bg: "rgba(200,150,30,.1)" },
    COMPLETED: { label: "✅ Election Closed",   color: "var(--ck-l)", bg: "rgba(0,71,171,.1)"   },
    CANCELLED: { label: "❌ CANCELLED",         color: "#EF4444",     bg: "rgba(239,68,68,.1)"  },
    SCHEDULED: { label: "📅 Scheduled",         color: "var(--t2)",   bg: "var(--bg2)"          },
  };
  const si = statusInfo[election?.status || "SCHEDULED"] || statusInfo.SCHEDULED;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "var(--font-s)", fontSize: "2rem", fontWeight: 400, color: "var(--t1)", marginBottom: "4px" }}>
          System Control
        </div>
        <div style={{ fontSize: ".82rem", color: "var(--t3)" }}>
          Super Admin access only — all actions are logged and irreversible
        </div>
      </div>

      {/* Current state */}
      {election && (
        <div style={{
          background: "var(--bgc)", border: "1px solid var(--bdr)",
          borderRadius: "14px", padding: "24px", marginBottom: "24px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-40px", right: "-40px",
            width: "140px", height: "140px", borderRadius: "50%",
            background: `radial-gradient(circle,${si.bg.replace(")", "").replace("rgba", "rgba")} 0%,transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            fontSize: ".62rem", fontWeight: 700, letterSpacing: ".18em",
            textTransform: "uppercase", color: "var(--t3)", marginBottom: "12px",
          }}>
            Current Election State
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{
              fontFamily: "var(--font-s)", fontSize: "1.4rem", fontWeight: 400, color: "var(--t1)",
            }}>
              {election.name}
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: "100px",
              background: si.bg, color: si.color,
              fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
            }}>
              {si.label}
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: "100px",
              background: election.resultsPublished ? "rgba(19,136,8,.1)" : "rgba(100,100,100,.1)",
              color: election.resultsPublished ? "var(--gr-l)" : "var(--t3)",
              fontSize: ".68rem", fontWeight: 700,
            }}>
              {election.resultsPublished ? "📢 Results Public" : "🔒 Results Hidden"}
            </div>
          </div>
          <div style={{ fontSize: ".76rem", color: "var(--t3)", marginTop: "8px" }}>
            {election.constituency} · {election.pollingHours}
          </div>
        </div>
      )}

      {/* Action grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}
        className="sc-grid">
        {SYSTEM_ACTIONS.map((action) => {
          const isCurrentStatus = election?.status === action.key;
          const isLoading = acting === action.key;

          return (
            <div key={action.key} style={{
              background: "var(--bgc)", border: `1px solid ${isCurrentStatus ? action.color : "var(--bdr)"}`,
              borderRadius: "14px", padding: "24px",
              position: "relative", overflow: "hidden",
              opacity: isCurrentStatus ? 0.7 : 1,
              boxShadow: isCurrentStatus ? `0 0 20px ${action.glow}` : "none",
              transition: "all .3s",
            }}>
              <div style={{
                position: "absolute", top: "-30px", right: "-30px",
                width: "100px", height: "100px", borderRadius: "50%",
                background: `radial-gradient(circle,${action.glow} 0%,transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{action.icon}</div>
              <div style={{
                fontSize: ".92rem", fontWeight: 700, color: action.color,
                marginBottom: "6px",
              }}>
                {action.label}
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--t3)", lineHeight: 1.5, marginBottom: "18px" }}>
                {action.desc}
              </div>

              {isCurrentStatus ? (
                <div style={{
                  padding: "8px 16px", borderRadius: "8px",
                  background: `${action.glow}`,
                  color: action.color, fontSize: ".72rem", fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: "6px",
                }}>
                  ✓ Current Status
                </div>
              ) : (
                <button
                  disabled={isLoading || acting !== null}
                  onClick={() => setStatus(action.key, action.confirmText)}
                  style={{
                    padding: "9px 20px", borderRadius: "9px",
                    background: action.dangerous
                      ? `${action.color}15`
                      : `linear-gradient(135deg,${action.color},${action.color}dd)`,
                    color: action.dangerous ? action.color : "#fff",
                    border: action.dangerous ? `1px solid ${action.color}40` : "none",
                    fontSize: ".78rem", fontWeight: 700,
                    letterSpacing: ".08em", cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all .2s",
                    boxShadow: !action.dangerous ? `0 4px 16px ${action.glow}` : "none",
                    opacity: (isLoading || acting !== null) ? 0.6 : 1,
                  }}
                >
                  {isLoading ? "Working…" : action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Results publish panel */}
      <div style={{
        background: "var(--bgc)", border: "1px solid var(--bdr)",
        borderRadius: "14px", padding: "28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "140px", height: "140px", borderRadius: "50%",
          background: election?.resultsPublished
            ? "radial-gradient(circle,rgba(19,136,8,.12) 0%,transparent 70%)"
            : "radial-gradient(circle,rgba(200,150,30,.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          fontSize: ".7rem", fontWeight: 700, letterSpacing: ".16em",
          textTransform: "uppercase", color: "var(--t3)", marginBottom: "16px",
        }}>
          Results Visibility Control
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <div style={{ fontSize: ".92rem", fontWeight: 600, color: "var(--t1)", marginBottom: "4px" }}>
              {election?.resultsPublished ? "📢 Results are PUBLIC" : "🔒 Results are HIDDEN"}
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--t3)" }}>
              {election?.resultsPublished
                ? "Students can currently see the vote tally on the Results page."
                : "Results are hidden from students. Only admins can see the tally."}
            </div>
          </div>
          <button
            disabled={acting === "results"}
            onClick={() => toggleResults(!election?.resultsPublished)}
            style={{
              padding: "11px 28px", borderRadius: "10px",
              background: election?.resultsPublished
                ? "linear-gradient(135deg,#C62828,#B71C1C)"
                : "linear-gradient(135deg,var(--gr),var(--gr-d))",
              color: "#fff", fontSize: ".82rem", fontWeight: 700,
              letterSpacing: ".1em", border: "none", cursor: acting === "results" ? "not-allowed" : "pointer",
              transition: "all .25s",
              boxShadow: election?.resultsPublished
                ? "0 4px 20px rgba(198,40,40,.35)"
                : "0 4px 20px rgba(19,136,8,.35)",
              opacity: acting === "results" ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (acting !== "results") e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            {acting === "results" ? "Updating…"
              : election?.resultsPublished ? "🔒 Hide Results" : "📢 Publish Results"}
          </button>
        </div>

        <div style={{
          marginTop: "20px", padding: "14px 18px",
          background: "rgba(255,107,53,.06)", border: "1px solid rgba(255,107,53,.14)",
          borderRadius: "8px", fontSize: ".78rem", color: "var(--t2)", lineHeight: 1.7,
        }}>
          ⚠️ <strong style={{ color: "var(--sf)" }}>All system actions are logged</strong> with your
          username, timestamp, and IP address. This log cannot be deleted.
        </div>
      </div>

      <style>{`@media(max-width:700px){.sc-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}