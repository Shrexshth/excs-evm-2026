// src/app/admin/components/VoterRegistry.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

interface Props { 
  showToast: (m: string, t?: "success" | "error" | "warn" | "info" | string) => void; 
}

interface Voter {
  id: number;
  voterId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  mobile: string;
  email: string | null;
  gender: string;
  hasVoted: boolean;
  votedAt: string | null;
  status: "REGISTERED" | "VERIFIED" | "VOTED" | "FLAGGED" | "SUSPENDED" | "ACTIVE";
  booth: { code: string; name: string } | null;
  registeredAt: string;
}

interface VoterMeta { total: number; voted: number; flagged: number; page: number; pages: number; }

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  REGISTERED: { bg: "rgba(0,71,171,.1)",   color: "var(--ck-l)", label: "Registered" },
  ACTIVE:     { bg: "rgba(0,71,171,.1)",   color: "var(--ck-l)", label: "Active" },
  VERIFIED:   { bg: "rgba(19,136,8,.1)",   color: "var(--gr-l)", label: "Verified"   },
  VOTED:      { bg: "rgba(19,136,8,.14)",  color: "var(--gr-l)", label: "✅ Voted"   },
  FLAGGED:    { bg: "rgba(239,68,68,.1)",  color: "#EF4444",     label: "🚨 Flagged"  },
  SUSPENDED:  { bg: "rgba(100,100,100,.1)",color: "var(--t3)",   label: "Suspended"  },
};

// 🚨 FIX 1: FormInput moved to the very top, OUTSIDE of all other components.
// This prevents React from destroying and recreating the input field on every keystroke.
function FormInput({ label, value, onChange, type = "text", placeholder = "", req = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; req?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--t3)" }}>
        {label}{req && <span style={{ color: "var(--sf)", marginLeft: "3px" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "9px 12px", background: "var(--bg2)",
          border: "1px solid var(--bdr)", borderRadius: "8px",
          color: "var(--t1)", fontSize: ".84rem", transition: "border .2s",
        }}
        onFocus={e => e.target.style.borderColor = "var(--ck)"}
        onBlur={e => e.target.style.borderColor = "var(--bdr)"}
      />
    </div>
  );
}

export function VoterRegistry({ showToast }: Props) {
  const [voters, setVoters]     = useState<Voter[]>([]);
  const [meta, setMeta]         = useState<VoterMeta | null>(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem("accessToken") || localStorage.getItem("temp_user_id") || "superadmin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        ...(search       && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const r = await fetch(`/api/admin/voters?${params}`, {
        headers: { "x-admin-token": token },
      });
      const j = await r.json();
      if (j.success) {
        setVoters(j.voters);
        setMeta(j.meta);
      } else {
        showToast(j.message || "Failed to load voters", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => { load(); }, [load]);

  const flagVoter = async (voterId: string, unflag: boolean) => {
    setFlaggingId(voterId);
    try {
      const token = getAuthToken();
      const r = await fetch(`/api/admin/voters/flag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ voterId, unflag }),
      });
      const j = await r.json();
      if (j.success) {
        showToast(j.message, "success");
        load();
      } else {
        showToast("Flagging endpoint needs to be wired up.", "warn");
      }
    } catch { showToast("Failed to update voter", "error"); }
    finally { setFlaggingId(null); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-s)", fontSize: "2rem", fontWeight: 400, color: "var(--t1)", marginBottom: "4px" }}>
            Voter Registry
          </div>
          <div style={{ fontSize: ".82rem", color: "var(--t3)" }}>
            {meta ? `${meta.total.toLocaleString()} students enrolled · ${meta.voted} voted · ${meta.flagged} flagged` : "Loading…"}
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px",
            background: showForm
              ? "var(--bg2)"
              : "linear-gradient(135deg,var(--ck),var(--ck-l))",
            color: showForm ? "var(--t2)" : "#fff",
            border: `1px solid ${showForm ? "var(--bdr)" : "transparent"}`,
            borderRadius: "9px", fontSize: ".8rem", fontWeight: 700,
            letterSpacing: ".08em", cursor: "pointer", transition: "all .2s",
          }}
        >
          {showForm ? "✕ Cancel" : "＋ Add Voter"}
        </button>
      </div>

      {showForm && (
        <AddVoterForm
          onSuccess={() => { setShowForm(false); load(); }}
          showToast={showToast}
        />
      )}

      <div style={{
        background: "var(--bgc)", border: "1px solid var(--bdr)",
        borderRadius: "12px", overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid var(--bdr)",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, ID, or mobile…"
            style={{
              padding: "8px 14px", background: "var(--bg2)",
              border: "1px solid var(--bdr)", borderRadius: "8px",
              color: "var(--t1)", fontSize: ".82rem", flex: 1, minWidth: "180px",
              transition: "border .2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--ck)"}
            onBlur={e => e.target.style.borderColor = "var(--bdr)"}
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: "8px 14px", background: "var(--bg2)",
              border: "1px solid var(--bdr)", borderRadius: "8px",
              color: "var(--t1)", fontSize: ".82rem", cursor: "pointer",
            }}
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={load}
            style={{
              padding: "8px 16px", background: "var(--bg2)",
              border: "1px solid var(--bdr)", borderRadius: "8px",
              color: "var(--t2)", fontSize: ".8rem", cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 100px 130px 80px 100px",
          padding: "10px 20px",
          borderBottom: "2px solid var(--bdr)",
          fontSize: ".62rem", fontWeight: 700,
          letterSpacing: ".14em", textTransform: "uppercase", color: "var(--t3)",
        }} className="vr-row">
          <span>Student</span>
          <span>Voter ID</span>
          <span>Status</span>
          <span>Voted At</span>
          <span>Booth</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--t3)", fontSize: ".86rem" }}>
            Loading voters…
          </div>
        ) : voters.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--t3)", fontSize: ".86rem" }}>
            No voters found
          </div>
        ) : (
          voters.map((v) => {
            const computedStatus = v.hasVoted ? "VOTED" : (v.status || "REGISTERED");
            const sc = STATUS_COLORS[computedStatus] || STATUS_COLORS.REGISTERED;
            
            return (
              <div
                key={v.voterId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 100px 130px 80px 100px",
                  padding: "12px 20px", borderBottom: "1px solid var(--bdr)",
                  alignItems: "center", transition: "background .15s",
                }}
                className="vr-row"
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--t1)", fontSize: ".86rem" }}>
                    {v.name || `${v.firstName} ${v.lastName}`}
                  </div>
                  <div style={{ fontSize: ".7rem", color: "var(--t3)" }}>
                    {v.mobile} {v.email ? `· ${v.email}` : ""}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-m)", fontSize: ".72rem", color: "var(--t3)" }}>
                  {v.voterId}
                </div>
                <div>
                  <span style={{
                    padding: "3px 9px", borderRadius: "100px",
                    fontSize: ".62rem", fontWeight: 700,
                    background: sc.bg, color: sc.color,
                  }}>
                    {sc.label}
                  </span>
                </div>
                <div style={{ fontSize: ".72rem", color: "var(--t3)" }}>
                  {v.votedAt
                    ? new Date(v.votedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </div>
                <div style={{ fontSize: ".72rem", color: "var(--t3)" }}>
                  {v.booth?.code || "—"}
                </div>
                <div>
                  {computedStatus !== "VOTED" && (
                    <button
                      disabled={flaggingId === v.voterId}
                      onClick={() => flagVoter(v.voterId, computedStatus === "FLAGGED")}
                      style={{
                        padding: "4px 10px", borderRadius: "6px",
                        fontSize: ".65rem", fontWeight: 700, cursor: "pointer",
                        border: "1px solid",
                        background: computedStatus === "FLAGGED"
                          ? "rgba(19,136,8,.1)" : "rgba(239,68,68,.1)",
                        color: computedStatus === "FLAGGED" ? "var(--gr-l)" : "#EF4444",
                        borderColor: computedStatus === "FLAGGED"
                          ? "rgba(19,136,8,.3)" : "rgba(239,68,68,.3)",
                        transition: "all .2s",
                        opacity: flaggingId === v.voterId ? 0.5 : 1,
                      }}
                    >
                      {computedStatus === "FLAGGED" ? "Unflag" : "Flag"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {meta && meta.pages > 1 && (
          <div style={{
            padding: "14px 20px", borderTop: "1px solid var(--bdr)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: ".78rem", color: "var(--t3)",
          }}>
            <span>Page {meta.page} of {meta.pages}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <PageBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
              <PageBtn label="Next →" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:900px){
          .vr-row{grid-template-columns:1fr 1fr 100px!important;}
          .vr-row>*:nth-child(4),.vr-row>*:nth-child(5){display:none;}
        }
      `}</style>
    </div>
  );
}

function AddVoterForm({ onSuccess, showToast }: {
  onSuccess: () => void;
  showToast: (m: string, t?: "success" | "error" | "warn" | "info" | string) => void;
}) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "", gender: "M",
    mobile: "", email: "", aadhar: "", password: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const getAuthToken = () => localStorage.getItem("accessToken") || localStorage.getItem("temp_user_id") || "superadmin";

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.dob || !form.mobile || !form.aadhar || !form.password) {
      showToast("Please fill all required fields", "warn");
      return;
    }
    setSaving(true);
    try {
      const token = getAuthToken();
      const r = await fetch("/api/admin/voters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminToken: token }),
      });
      const j = await r.json();
      if (j.success) {
        showToast(`Voter added — ID: ${j.voterId}`, "success");
        onSuccess();
      } else {
        showToast(j.message, "error");
      }
    } catch { showToast("Failed to add voter", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      background: "var(--bgc)", border: "1px solid var(--ck-l)",
      borderRadius: "14px", padding: "28px", marginBottom: "20px",
      boxShadow: "0 0 30px rgba(0,71,171,.08)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-50px", right: "-50px",
        width: "160px", height: "160px", borderRadius: "50%",
        background: "radial-gradient(circle,rgba(0,71,171,.1) 0%,transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        fontSize: ".7rem", fontWeight: 700, letterSpacing: ".16em",
        textTransform: "uppercase", color: "var(--ck-l)", marginBottom: "18px",
      }}>
        ＋ Manually Add Student Voter
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}
        className="avf-grid">
        <FormInput label="First Name" value={form.firstName} onChange={v => set("firstName", v)} placeholder="Arjun" req />
        <FormInput label="Last Name" value={form.lastName} onChange={v => set("lastName", v)} placeholder="Patil" req />
        <FormInput label="Date of Birth" type="date" value={form.dob} onChange={v => set("dob", v)} req />
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--t3)" }}>
            Gender<span style={{ color: "var(--sf)", marginLeft: "3px" }}>*</span>
          </label>
          <select
            value={form.gender} onChange={e => set("gender", e.target.value)}
            style={{
              padding: "9px 12px", background: "var(--bg2)",
              border: "1px solid var(--bdr)", borderRadius: "8px",
              color: "var(--t1)", fontSize: ".84rem", cursor: "pointer",
            }}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
        <FormInput label="Mobile" value={form.mobile} onChange={v => set("mobile", v)} placeholder="9876543210" req />
        <FormInput label="Email" type="email" value={form.email} onChange={v => set("email", v)} placeholder="student@vit.ac.in" />
        <FormInput label="Aadhar No." value={form.aadhar} onChange={v => set("aadhar", v)} placeholder="123412341234" req />
        <FormInput label="Password" type="password" value={form.password} onChange={v => set("password", v)} placeholder="Min 8 chars" req />
      </div>

      <button
        disabled={saving}
        onClick={submit}
        style={{
          padding: "11px 28px",
          background: saving ? "var(--bg2)" : "linear-gradient(135deg,var(--ck),var(--ck-l))",
          color: saving ? "var(--t3)" : "#fff",
          borderRadius: "9px", fontSize: ".82rem", fontWeight: 700,
          letterSpacing: ".1em", cursor: saving ? "not-allowed" : "pointer",
          transition: "all .2s", border: "none",
          boxShadow: saving ? "none" : "0 4px 20px rgba(0,71,171,.3)",
        }}
      >
        {saving ? "Adding…" : "Add Voter to Registry"}
      </button>

      <style>{`@media(max-width:860px){.avf-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
    </div>
  );
}

function PageBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled} onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: "7px", fontSize: ".76rem",
        background: "var(--bg2)", border: "1px solid var(--bdr)",
        color: disabled ? "var(--t3)" : "var(--t1)",
        cursor: disabled ? "not-allowed" : "pointer", transition: "all .2s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}