// src/app/admin/page.tsx
// Main Admin Panel — sidebar nav + tab state manager

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OverviewTab }        from "./components/OverviewTab";
import { VoterRegistry }      from "./components/VoterRegistry";
import { CandidateBuilder }   from "./components/CandidateBuilder";
import { SystemControl }      from "./components/SystemControl";

// ── Types ──────────────────────────────────────────────────────────────────────
export type TabId = "overview" | "voters" | "candidates" | "system";

export interface AdminUser {
  id: number;
  username: string;
  role: "ADMIN" | "SUPERADMIN" | "OFFICER";
}

interface NavItem {
  id: TabId;
  icon: string;
  label: string;
  badge?: string;
  superAdminOnly?: boolean;
}

const NAV: NavItem[] = [
  { id: "overview",    icon: "📊", label: "Overview"          },
  { id: "voters",      icon: "👥", label: "Voter Registry"    },
  { id: "candidates",  icon: "🏛️", label: "Candidates"        },
  { id: "system",      icon: "⚙️", label: "System Control",   superAdminOnly: true },
  // Audit Logs skipped to preserve DB space
];

// ── Shared toast context exposed to child tabs ─────────────────────────────────
export type ToastType = "success" | "error" | "warn" | "info" | string;
export interface Toast { msg: string; type: ToastType; }

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router  = useRouter();
  const [tab, setTab]       = useState<TabId>("overview");
  const [user, setUser]     = useState<AdminUser | null>(null);
  const [toast, setToast]   = useState<Toast | null>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Check our standard token storage
    const token = localStorage.getItem("accessToken") || localStorage.getItem("temp_user_id");
    
    if (!token || token.startsWith("VIT-")) {
      // If no token, or if it's a student (starts with VIT-), kick them out
      router.push("/login");
      return;
    }
    
    // Determine role (for our raw SQL build, 'superadmin' is the main key)
    const role = token === "superadmin" ? "SUPERADMIN" : "ADMIN";
    setUser({ id: 0, username: token.toUpperCase(), role: role });

  }, [router]);

  const showToast = useCallback((msg: string, type: ToastType = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3400);
  }, []);

  const logout = () => {
    ["accessToken","userRole","username", "temp_user_id"].forEach((k) => localStorage.removeItem(k));
    router.push("/login");
  };

  const toastColors: Record<string, { border: string; icon: string }> = {
    success: { border: "var(--gr-l)",  icon: "✅" },
    error:   { border: "#EF4444",      icon: "❌" },
    warn:    { border: "var(--sf)",    icon: "⚠️" },
    info:    { border: "var(--ck-l)",  icon: "ℹ️" },
  };

  // Safe fallback for custom toast types
  const getToastStyle = (type: string) => toastColors[type] || toastColors.info;

  const tabProps = { user, showToast };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-b)" }}>
      {/* Tricolor strip */}
      <div className="tristrip">
        <div className="ts-s"/><div className="ts-s"/><div className="ts-s"/>
      </div>

      <div style={{ display: "flex", paddingTop: "4px", minHeight: "100vh" }}>

        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <aside style={{
          width: "260px", flexShrink: 0,
          background: "var(--bgc)",
          borderRight: "1px solid var(--bdr)",
          position: "sticky", top: "4px",
          height: "calc(100vh - 4px)",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
          {/* Brand */}
          <div style={{
            padding: "28px 24px 22px",
            borderBottom: "1px solid var(--bdr)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "-40px", right: "-40px",
              width: "140px", height: "140px", borderRadius: "50%",
              background: "radial-gradient(circle,rgba(0,71,171,.16) 0%,transparent 70%)",
              pointerEvents: "none",
            }}/>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px",
            }}>
              <span style={{ fontSize: "1.5rem" }}>🗳️</span>
              <div>
                <div style={{
                  fontFamily: "var(--font-s)", fontSize: "1rem", fontWeight: 600,
                  color: "var(--t1)", lineHeight: 1.2,
                }}>TRIVOTE Admin</div>
                <div style={{
                  fontSize: ".58rem", fontWeight: 700, letterSpacing: ".2em",
                  textTransform: "uppercase", color: "var(--ck-l)", marginTop: "2px",
                }}>Vidyalankar · 2025</div>
              </div>
            </div>
            {user && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", marginTop: "12px",
                padding: "8px 10px", background: "var(--bg2)",
                borderRadius: "8px", border: "1px solid var(--bdr)",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg,var(--sf),var(--ck))",
                  display: "grid", placeItems: "center",
                  fontSize: ".75rem", fontWeight: 700, color: "#fff",
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--t1)" }}>
                    {user.username}
                  </div>
                  <div style={{
                    fontSize: ".58rem", fontWeight: 700, letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: user.role === "SUPERADMIN" ? "var(--gold)" : "var(--ck-l)",
                  }}>
                    {user.role}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ padding: "16px 0", flex: 1 }}>
            <div style={{
              fontSize: ".58rem", fontWeight: 700, letterSpacing: ".22em",
              textTransform: "uppercase", color: "var(--t3)", padding: "0 24px 8px",
            }}>
              Dashboard
            </div>
            {NAV.filter(n => !n.superAdminOnly || user?.role === "SUPERADMIN").map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={tab === item.id}
                onClick={() => setTab(item.id)}
              />
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "0 0 20px", borderTop: "1px solid var(--bdr)" }}>
            <div style={{
              fontSize: ".58rem", fontWeight: 700, letterSpacing: ".22em",
              textTransform: "uppercase", color: "var(--t3)", padding: "16px 24px 8px",
            }}>
              Account
            </div>
            <button
              onClick={logout}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                width: "100%", padding: "10px 24px",
                fontSize: ".84rem", fontWeight: 600, color: "var(--t2)",
                background: "transparent", border: "none", cursor: "pointer",
                transition: "all .2s", textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#EF4444";
                e.currentTarget.style.background = "rgba(239,68,68,.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--t2)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "1rem", width: "22px", textAlign: "center" }}>🚪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", minHeight: "100%" }}>
          {/* Top bar */}
          <div style={{
            height: "56px", borderBottom: "1px solid var(--bdr)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 36px", background: "var(--bgc)",
            position: "sticky", top: 0, zIndex: 100,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: ".68rem", fontWeight: 700, letterSpacing: ".16em",
              textTransform: "uppercase", color: "var(--t3)",
            }}>
              <span>Admin</span>
              <span style={{ color: "var(--bdr-md)" }}>›</span>
              <span style={{ color: "var(--sf)" }}>
                {NAV.find(n => n.id === tab)?.label}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                padding: "4px 12px", borderRadius: "100px",
                background: "rgba(19,136,8,.1)", border: "1px solid rgba(19,136,8,.2)",
                fontSize: ".62rem", fontWeight: 700, letterSpacing: ".1em",
                textTransform: "uppercase", color: "var(--gr-l)",
              }}>
                🟢 System Live
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ padding: "36px 40px" }} className="admin-main-content">
            {tab === "overview"   && <OverviewTab      {...tabProps} />}
            {tab === "voters"     && <VoterRegistry    {...tabProps} />}
            {tab === "candidates" && <CandidateBuilder {...tabProps} />}
            {tab === "system"     && <SystemControl    {...tabProps} />}
          </div>
        </main>
      </div>

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 9999,
          background: "var(--bgc)", backdropFilter: "blur(20px)",
          border: "1px solid var(--bdr)",
          borderLeft: `3px solid ${getToastStyle(toast.type).border}`,
          borderRadius: "10px", padding: "14px 20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: "10px",
          fontSize: ".86rem", fontWeight: 500, color: "var(--t1)",
          maxWidth: "360px",
          animation: "popIn .25s ease",
        }}>
          <span>{getToastStyle(toast.type).icon}</span>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:translateY(10px) scale(.96); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @media(max-width:900px){
          aside { display:none!important; }
          .admin-main-content { padding:20px!important; }
        }
      `}</style>
    </div>
  );
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SidebarItem({
  item, active, onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        width: "100%", padding: "10px 24px",
        fontSize: ".84rem", fontWeight: 600,
        color: active ? "var(--sf)" : "var(--t2)",
        background: active ? "rgba(255,107,53,.07)" : "transparent",
        borderLeft: `2px solid ${active ? "var(--sf)" : "transparent"}`,
        border: "none", borderRight: "none", borderTop: "none", borderBottom: "none",
        borderLeftWidth: "2px", borderLeftStyle: "solid",
        borderLeftColor: active ? "var(--sf)" : "transparent",
        cursor: "pointer", transition: "all .18s", textAlign: "left",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--t1)";
          e.currentTarget.style.background = "var(--bg2)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--t2)";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span style={{ fontSize: "1rem", width: "20px", textAlign: "center", flexShrink: 0 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
    </button>
  );
}