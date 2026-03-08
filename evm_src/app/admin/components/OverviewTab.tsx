// src/app/admin/components/OverviewTab.tsx
// Live election stats, turnout ring, candidate tally bars

"use client";
import { useState, useEffect, useCallback } from "react";

// 👇 FIXED: Removed broken imports and defined Props inline
interface Props { 
  showToast: (m: string, t?: "success" | "error" | "warn" | "info" | string) => void; 
}

interface DashData {
  election: {
    id: string; name: string; status: string;
    constituency: string; pollingHours: string; resultsPublished: boolean;
  };
  stats: {
    totalVotes: number; votedVoters: number; totalVoters: number;
    pendingVoters: number; flaggedVoters: number; todayAlerts: number;
    turnoutPct: number; totalRegistered: number;
    total: number; active: number; offline: number;
  };
  topCandidates: Array<{
    id: number; name: string; symbol: string; color: string;
    party: { abbr: string; color: string } | null; votes: number;
  }>;
  recentActivity: Array<{
    action: string; actor: string; boothCode: string | null;
    isAlert: boolean; createdAt: string;
  }>;
}

export function OverviewTab({ showToast }: Props) {
  const [data, setData]       = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => localStorage.getItem("accessToken") || localStorage.getItem("temp_user_id") || "superadmin";

  const load = useCallback(async () => {
    try {
      const token = getAuthToken();
      const r = await fetch("/api/admin/dashboard", {
        headers: { "x-admin-token": token }, // FIXED: Matching our backend
      });
      const j = await r.json();
      if (j.success) setData(j.dashboard);
      else showToast(j.message || "Failed to load dashboard", "error");
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Skeleton />;
  if (!data)   return <ErrorState onRetry={load} />;

  const { election, stats, topCandidates, recentActivity } = data;
  const maxVotes = topCandidates[0]?.votes || 1;

  const statCards = [
    {
      value: stats.totalVotes.toLocaleString(),
      label: "Votes Cast",
      sub:   `${stats.turnoutPct}% turnout`,
      color: "var(--sf)",
      glow:  "rgba(255,107,53,.22)",
      icon:  "🗳️",
    },
    {
      value: stats.totalVoters.toLocaleString(),
      label: "Registered Voters",
      sub:   `${stats.pendingVoters} yet to vote`,
      color: "var(--gr-l)",
      glow:  "rgba(19,136,8,.22)",
      icon:  "👥",
    },
    {
      value: stats.total.toString(),
      label: "Polling Booths",
      sub:   `${stats.active} active · ${stats.offline} offline`,
      color: "#64B5F6",
      glow:  "rgba(0,71,171,.22)",
      icon:  "🏫",
    },
    {
      value: stats.flaggedVoters.toString(),
      label: "Flagged Voters",
      sub:   `${stats.todayAlerts} alerts today`,
      color: stats.flaggedVoters > 0 ? "#EF4444" : "var(--gr-l)",
      glow:  stats.flaggedVoters > 0 ? "rgba(239,68,68,.22)" : "rgba(19,136,8,.22)",
      icon:  stats.flaggedVoters > 0 ? "🚨" : "✅",
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Page heading */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            fontFamily: "var(--font-s)", fontSize: "2rem", fontWeight: 400, color: "var(--t1)",
          }}>
            Election Overview
          </div>
          <ElectionBadge status={election.status} />
        </div>
        <div style={{ fontSize: ".82rem", color: "var(--t3)" }}>
          {election.name} · {election.constituency} · {election.pollingHours}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: "16px", marginBottom: "28px",
      }} className="ov-stat-grid">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}
        className="ov-split">

        {/* Candidate tally */}
        <div style={{
          background: "var(--bgc)", border: "1px solid var(--bdr)",
          borderRadius: "14px", padding: "28px",
        }}>
          <SectionHeader icon="📊" title="Live Vote Tally" subtitle="Admin view — not yet public" />
          {topCandidates.length === 0 ? (
            <Empty text="No votes cast yet" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
              {topCandidates.map((c, i) => (
                <TallyRow
                  key={c.id}
                  rank={i + 1}
                  name={c.name}
                  symbol={c.symbol}
                  votes={c.votes}
                  color={c.party?.color || c.color}
                  pct={maxVotes > 0 ? Math.round((c.votes / maxVotes) * 100) : 0}
                  totalVotes={stats.totalVotes}
                  leading={i === 0 && c.votes > 0}
                />
              ))}
              <TallyRow
                rank={topCandidates.length + 1}
                name="NOTA" symbol="🚫"
                votes={stats.totalVotes - topCandidates.reduce((s, c) => s + c.votes, 0)}
                color="var(--t3)"
                pct={0}
                totalVotes={stats.totalVotes}
                leading={false}
                nota
              />
            </div>
          )}
        </div>

        {/* Turnout donut + recent activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Donut */}
          <div style={{
            background: "var(--bgc)", border: "1px solid var(--bdr)",
            borderRadius: "14px", padding: "24px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <SectionHeader icon="🎯" title="Voter Turnout" />
            <TurnoutDonut pct={stats.turnoutPct} voted={stats.votedVoters} total={stats.totalVoters} />
          </div>

          {/* Recent activity */}
          <div style={{
            background: "var(--bgc)", border: "1px solid var(--bdr)",
            borderRadius: "14px", padding: "24px", flex: 1,
          }}>
            <SectionHeader icon="⚡" title="Recent Activity" />
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "0" }}>
              {recentActivity.length === 0 ? (
                 <div style={{ fontSize: ".75rem", color: "var(--t3)", textAlign: "center", padding: "20px 0" }}>System nominal. No recent alerts.</div>
              ) : (
                recentActivity.slice(0, 6).map((a, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "10px",
                    padding: "9px 0",
                    borderBottom: i < 5 ? "1px solid var(--bdr)" : "none",
                  }}>
                    <div style={{
                      width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, marginTop: "5px",
                      background: a.isAlert ? "#EF4444" : "var(--gr-l)",
                      boxShadow: a.isAlert ? "0 0 6px #EF4444" : "0 0 6px var(--gr-l)",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".78rem", color: "var(--t1)", lineHeight: 1.4 }}>
                        {a.action}
                      </div>
                      <div style={{
                        fontSize: ".65rem", color: "var(--t3)", marginTop: "2px",
                        display: "flex", gap: "8px",
                      }}>
                        <span>{a.actor}</span>
                        {a.boothCode && <span>· {a.boothCode}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: ".62rem", color: "var(--t3)", flexShrink: 0, marginTop: "2px" }}>
                      {new Date(a.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:1100px){ .ov-split{grid-template-columns:1fr!important;} }
        @media(max-width:900px) { .ov-stat-grid{grid-template-columns:1fr 1fr!important;} }
        @media(max-width:560px) { .ov-stat-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────
function StatCard({ value, label, sub, color, glow, icon }: {
  value: string; label: string; sub: string;
  color: string; glow: string; icon: string;
}) {
  return (
    <div style={{
      background: "var(--bgc)", border: "1px solid var(--bdr)",
      borderRadius: "12px", padding: "22px 20px",
      position: "relative", overflow: "hidden", transition: "all .25s",
      cursor: "default",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 8px 32px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.borderColor = "var(--bdr)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "110px", height: "110px", borderRadius: "50%",
        background: `radial-gradient(circle,${glow} 0%,transparent 70%)`,
        pointerEvents: "none", animation: "placeGlow 4s ease-in-out infinite",
      }} />
      <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{icon}</div>
      <div style={{
        fontFamily: "var(--font-s)", fontSize: "2.2rem", fontWeight: 600,
        color, lineHeight: 1, position: "relative",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: ".65rem", fontWeight: 700, letterSpacing: ".14em",
        textTransform: "uppercase", color: "var(--t3)", marginTop: "6px",
      }}>
        {label}
      </div>
      <div style={{ fontSize: ".72rem", color: "var(--t2)", marginTop: "4px" }}>{sub}</div>
    </div>
  );
}

function TallyRow({ rank, name, symbol, votes, color, pct, totalVotes, leading, nota }: {
  rank: number; name: string; symbol: string; votes: number;
  color: string; pct: number; totalVotes: number; leading: boolean; nota?: boolean;
}) {
  const votePct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{
        width: "22px", height: "22px", borderRadius: "50%",
        background: "var(--bg2)", border: "1px solid var(--bdr)",
        display: "grid", placeItems: "center",
        fontSize: ".62rem", fontWeight: 700, color: "var(--t3)", flexShrink: 0,
      }}>
        {rank}
      </div>
      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{symbol}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ fontSize: ".86rem", fontWeight: 600, color: "var(--t1)" }}>{name}</span>
          {leading && (
            <span style={{
              padding: "1px 8px", borderRadius: "100px",
              background: "rgba(200,150,30,.15)", border: "1px solid rgba(200,150,30,.3)",
              color: "var(--gold)", fontSize: ".6rem", fontWeight: 700,
            }}>
              LEADING
            </span>
          )}
        </div>
        <div style={{
          height: "6px", background: "var(--bg2)",
          borderRadius: "100px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: nota ? "var(--t3)" : color,
            borderRadius: "100px",
            transition: "width .6s ease",
            opacity: nota ? 0.5 : 1,
          }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: ".86rem", fontWeight: 700, color: "var(--t1)" }}>{votes}</div>
        <div style={{ fontSize: ".65rem", color: "var(--t3)" }}>{votePct}%</div>
      </div>
    </div>
  );
}

function TurnoutDonut({ pct, voted, total }: { pct: number; voted: number; total: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;

  return (
    <div style={{ textAlign: "center", marginTop: "12px" }}>
      <svg width="140" height="140" style={{ overflow: "visible" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg2)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke="var(--sf)" strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray .8s ease", filter: "drop-shadow(0 0 6px rgba(255,107,53,.5))" }}
        />
        <text x="70" y="65" textAnchor="middle" fill="var(--t1)"
          style={{ fontFamily: "var(--font-s)", fontSize: "22px", fontWeight: 600 }}>
          {pct}%
        </text>
        <text x="70" y="82" textAnchor="middle" fill="var(--t3)"
          style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
          TURNOUT
        </text>
      </svg>
      <div style={{ fontSize: ".78rem", color: "var(--t3)", marginTop: "4px" }}>
        {voted.toLocaleString()} of {total.toLocaleString()} voters
      </div>
    </div>
  );
}

function ElectionBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ACTIVE:    { bg: "rgba(19,136,8,.1)",     color: "var(--gr-l)", label: "🟢 Active"    },
    PAUSED:    { bg: "rgba(255,107,53,.1)",   color: "var(--sf)",   label: "⏸️ Paused"    },
    COMPLETED: { bg: "rgba(0,71,171,.1)",     color: "var(--ck-l)", label: "✅ Completed" },
    SCHEDULED: { bg: "rgba(200,150,30,.1)",   color: "var(--gold)", label: "📅 Scheduled" },
    CANCELLED: { bg: "rgba(239,68,68,.1)",    color: "#EF4444",     label: "❌ Cancelled" },
  };
  const s = map[status] || map.SCHEDULED;
  return (
    <div style={{
      padding: "4px 12px", borderRadius: "100px",
      background: s.bg, color: s.color,
      fontSize: ".62rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
    }}>
      {s.label}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
      <span>{icon}</span>
      <div>
        <div style={{
          fontSize: ".7rem", fontWeight: 700, letterSpacing: ".16em",
          textTransform: "uppercase", color: "var(--t3)",
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: ".65rem", color: "var(--t3)", marginTop: "2px" }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: "80px", background: "var(--bgc)", borderRadius: "12px",
          border: "1px solid var(--bdr)", animation: "pulse 1.5s infinite",
        }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--t3)" }}>
      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚠️</div>
      <div style={{ fontSize: ".88rem", marginBottom: "16px" }}>Failed to load dashboard</div>
      <button onClick={onRetry} style={{
        padding: "8px 20px", background: "var(--sf)", color: "#fff",
        borderRadius: "8px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer",
        border: "none",
      }}>Retry</button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--t3)", fontSize: ".86rem" }}>
      {text}
    </div>
  );
}