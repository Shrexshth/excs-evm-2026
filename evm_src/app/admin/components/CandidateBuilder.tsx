// src/app/admin/components/CandidateBuilder.tsx
// Add / edit / remove candidates — connected to /api/admin/candidates

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, UserPlus, Landmark as LandmarkIcon } from "lucide-react";

// 👇 FIXED: Removed the broken imports and defined the Props directly here
interface Props { 
  showToast: (m: string, t?: "success" | "error" | "warn" | "info" | string) => void; 
}

interface Candidate {
  id: number;
  name: string;
  symbol: string;
  color: string;
  serialNo: number | null;
  status: "ACTIVE" | "WITHDRAWN" | "DISQUALIFIED";
  education: string | null;
  bio: string | null;
  gender: string;
  tags: string[];
  party: { name: string; abbr: string; color: string; symbol: string } | null;
}

const PARTY_OPTIONS = [
  { abbr: "VS",  name: "Vikas Sena",              symbol: "🌾", color: "#C4620E" },
  { abbr: "USF", name: "United Student Front",    symbol: "🌸", color: "#1A6B32" },
  { abbr: "PA",  name: "Progressive Alliance",    symbol: "⚡", color: "#1B2A66" },
  { abbr: "YM",  name: "Youth Morcha",            symbol: "🌻", color: "#7C3ABA" },
  { abbr: "SRP", name: "Students Republic Party", symbol: "🕊️", color: "#0E7A9E" },
  { abbr: "IND", name: "Independent",             symbol: "🌱", color: "#888888" },
];

const EMOJI_SYMBOLS = ["🌾","🌸","⚡","🌻","🕊️","🌱","🏆","🔥","🌊","⭐","🦁","🌍","💡","🎯"];

const emptyForm = {
  name: "", dob: "", gender: "M", education: "",
  bio: "", symbol: "⭐", color: "#888888",
  partyAbbr: "", serialNo: "", nominationDate: "", tags: "",
};

export function CandidateBuilder({ showToast }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/candidates"); 
      const j = await r.json();
      if (j.success) setCandidates(j.candidates || j.data || []);
    } catch { showToast("Failed to load candidates", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const getAuthToken = () => localStorage.getItem("accessToken") || "";

  const submit = async () => {
    if (!form.name || !form.dob || !form.symbol) {
      showToast("Name, DOB and symbol are required", "warn");
      return;
    }
    setSaving(true);
    try {
      const token = getAuthToken();

      let finalSymbolUrl = form.symbol;
      
      // Upload image first if one was selected
      if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          
          const uploadRes = await fetch("/api/admin/upload", {
              method: "POST",
              headers: { "x-admin-token": token },
              body: formData,
          });
          
          const uploadJson = await uploadRes.json();
          if (!uploadJson.success) {
              showToast("Image upload failed: " + uploadJson.message, "error");
              setSaving(false);
              return;
          }
          finalSymbolUrl = uploadJson.url;
      }
      
      const body = {
        name:           form.name,
        dob:            form.dob,
        gender:         form.gender,
        education:      form.education || null,
        bio:            form.bio || null,
        symbol:         finalSymbolUrl,
        color:          form.color,
        nominationDate: form.nominationDate || null,
        serialNo:       form.serialNo ? parseInt(form.serialNo) : null,
        tags:           form.tags.split(",").map(t => t.trim()).filter(Boolean),
        partyAbbr:      form.partyAbbr || null,
        adminToken:     token, 
      };

      const r = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();

      if (j.success) {
        showToast(`Candidate "${form.name}" added successfully`, "success");
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview(null);
        setShowForm(false);
        load();
      } else {
        showToast(j.message || j.error, "error");
      }
    } catch { showToast("Failed to add candidate", "error"); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    const token = getAuthToken();
    try {
      const r = await fetch(`/api/admin/candidates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminToken: token }), 
      });
      const j = await r.json();
      if (j.success) { showToast(`Status updated to ${status}`, "success"); load(); }
      else showToast(j.message || j.error, "error");
    } catch { showToast("Failed to update", "error"); }
  };

  const deleteCandidate = async (id: number, name: string) => {
    if (!confirm(`Remove candidate "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const token = getAuthToken();
      const r = await fetch(`/api/admin/candidates?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token }, 
      });
      const j = await r.json();
      if (j.success) { showToast(`"${name}" removed`, "success"); load(); }
      else showToast(j.message || j.error, "error");
    } catch { showToast("Failed to delete", "error"); }
    finally { setDeletingId(null); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              showToast("Image must be smaller than 5MB", "warn");
              return;
          }
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    ACTIVE:       { bg: "rgba(19,136,8,.1)", color: "var(--gr-l)" },
    WITHDRAWN:    { bg: "rgba(255,107,53,.1)", color: "var(--sf)" },
    DISQUALIFIED: { bg: "rgba(239,68,68,.1)", color: "#EF4444" },
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-s)", fontSize: "2rem", fontWeight: 400, color: "var(--t1)", marginBottom: "4px" }}>
            Candidate Builder
          </div>
          <div style={{ fontSize: ".82rem", color: "var(--t3)" }}>
            {candidates.length} candidates registered
          </div>
        </div>
          <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px",
            background: showForm ? "var(--bg2)" : "linear-gradient(135deg,var(--sf),var(--sf-d))",
            color: showForm ? "var(--t2)" : "#fff",
            border: `1px solid ${showForm ? "var(--bdr)" : "transparent"}`,
            borderRadius: "9px", fontSize: ".8rem", fontWeight: 700,
            letterSpacing: ".08em", cursor: "pointer", transition: "all .2s",
          }}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><UserPlus size={16} /> Add Candidate</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background: "var(--bgc)", border: "1px solid var(--sf)",
          borderRadius: "14px", padding: "28px", marginBottom: "24px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 0 40px rgba(255,107,53,.08)",
        }}>
          <div style={{
            position: "absolute", top: "-50px", right: "-50px",
            width: "160px", height: "160px", borderRadius: "50%",
            background: "radial-gradient(circle,rgba(255,107,53,.1) 0%,transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--sf)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <LandmarkIcon size={16} /> New Candidate
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}
            className="cb-grid">
            <FormField label="Full Name *"       value={form.name}          onChange={v => set("name", v)} placeholder="Arjun Patil" />
            <FormField label="Date of Birth *"   value={form.dob}           onChange={v => set("dob", v)}  type="date" />
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <FieldLabel text="Gender *" />
              <select value={form.gender} onChange={e => set("gender", e.target.value)}
                style={selectStyle}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <FieldLabel text="Party" />
              <select value={form.partyAbbr} onChange={e => set("partyAbbr", e.target.value)}
                style={selectStyle}>
                <option value="">— Independent —</option>
                {PARTY_OPTIONS.map(p => (
                  <option key={p.abbr} value={p.abbr}>{p.symbol} {p.name} ({p.abbr})</option>
                ))}
              </select>
            </div>
            <FormField label="Education"         value={form.education}     onChange={v => set("education", v)} placeholder="B.E. Computer (3rd Year)" />
            <FormField label="Nomination Date"   value={form.nominationDate} onChange={v => set("nominationDate", v)} type="date" />
            <FormField label="Serial No."        value={form.serialNo}      onChange={v => set("serialNo", v)} type="number" placeholder="1" />

            {/* Symbol / Image upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <FieldLabel text="Symbol / Photo *" />
              
              <div style={{
                  display: "flex", alignItems: "center", gap: "10px", 
                  padding: "10px", background: "var(--bg2)", 
                  border: "1px dashed var(--bdr)", borderRadius: "8px",
                  position: "relative", overflow: "hidden"
              }}>
                 {imagePreview ? (
                     <div style={{position: "relative", width: "50px", height: "50px", borderRadius: "8px", overflow: "hidden"}}>
                         <img src={imagePreview} alt="Preview" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                         <button onClick={() => {setImagePreview(null); setImageFile(null);}} style={{
                             position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "white", 
                             border: "none", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", 
                             cursor: "pointer", display: "grid", placeItems: "center"
                         }}>✕</button>
                     </div>
                 ) : (
                     <div style={{ fontSize: "1.8rem", width: "40px", textAlign: "center" }}>
                        {form.symbol}
                     </div>
                 )}
                 
                 <div style={{flex: 1}}>
                     <label style={{
                         display: "inline-block", padding: "6px 12px", background: "var(--bg3)",
                         border: "1px solid var(--bdr)", borderRadius: "6px", fontSize: ".75rem",
                         cursor: "pointer", color: "var(--t2)", transition: "all .2s"
                     }}>
                         Upload Photo (.jpg, .png)
                         <input type="file" accept="image/*" onChange={handleImageChange} style={{display: "none"}} />
                     </label>
                     <div style={{fontSize: ".65rem", color: "var(--t3)", marginTop: "4px"}}>
                         Or pick emoji below:
                     </div>
                 </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {EMOJI_SYMBOLS.map(e => (
                  <button key={e} onClick={() => { set("symbol", e); setImagePreview(null); setImageFile(null); }} style={{
                    width: "32px", height: "32px", borderRadius: "6px",
                    fontSize: "1.1rem", border: `2px solid ${form.symbol === e && !imagePreview ? "var(--sf)" : "var(--bdr)"}`,
                    background: form.symbol === e && !imagePreview ? "rgba(255,107,53,.1)" : "var(--bg2)",
                    cursor: "pointer", transition: "all .15s",
                  }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <FieldLabel text="Theme Color" />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="color" value={form.color} onChange={e => set("color", e.target.value)}
                  style={{ width: "44px", height: "36px", borderRadius: "8px", border: "1px solid var(--bdr)", cursor: "pointer", background: "transparent" }} />
                <span style={{ fontFamily: "var(--font-m)", fontSize: ".76rem", color: "var(--t3)" }}>{form.color}</span>
              </div>
            </div>

            <FormField label="Tags (comma-sep)" value={form.tags} onChange={v => set("tags", v)} placeholder="Sports, Academics, Culture" />
          </div>

          {/* Bio */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "20px" }}>
            <FieldLabel text="Bio / About" />
            <textarea
              value={form.bio}
              onChange={e => set("bio", e.target.value)}
              placeholder="Brief description of the candidate…"
              rows={3}
              style={{
                padding: "9px 12px", background: "var(--bg2)",
                border: "1px solid var(--bdr)", borderRadius: "8px",
                color: "var(--t1)", fontSize: ".84rem", resize: "vertical",
                transition: "border .2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--sf)"}
              onBlur={e => e.target.style.borderColor = "var(--bdr)"}
            />
          </div>

          <button disabled={saving} onClick={submit} style={{
            padding: "11px 28px",
            background: saving ? "var(--bg2)" : "linear-gradient(135deg,var(--sf),var(--sf-d))",
            color: saving ? "var(--t3)" : "#fff",
            borderRadius: "9px", fontSize: ".82rem", fontWeight: 700,
            letterSpacing: ".1em", cursor: saving ? "not-allowed" : "pointer",
            border: "none", transition: "all .2s",
            boxShadow: saving ? "none" : "0 4px 20px rgba(255,107,53,.3)",
          }}>
            {saving ? "Saving…" : "Add Candidate"}
          </button>
          <style>{`@media(max-width:860px){.cb-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
        </div>
      )}

      {/* Candidate cards */}
      {loading ? (
        <div style={{ color: "var(--t3)", fontSize: ".86rem", padding: "40px", textAlign: "center" }}>Loading candidates…</div>
      ) : candidates.length === 0 ? (
        <div style={{ color: "var(--t3)", fontSize: ".86rem", padding: "40px", textAlign: "center" }}>No candidates yet. Add one above.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
          {candidates.map(c => {
            const sc = statusColors[c.status] || statusColors.ACTIVE;
            return (
              <div key={c.id} style={{
                background: "var(--bgc)", border: "1px solid var(--bdr)",
                borderRadius: "14px", padding: "22px",
                position: "relative", overflow: "hidden",
                transition: "all .25s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.color;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 30px ${c.color}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--bdr)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{
                  position: "absolute", top: "-30px", right: "-30px",
                  width: "100px", height: "100px", borderRadius: "50%",
                  background: `radial-gradient(circle,${c.color}22 0%,transparent 70%)`,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
                  <div style={{
                    width: "50px", height: "50px", borderRadius: "12px",
                    background: `${c.color}22`,
                    border: `2px solid ${c.color}44`,
                    display: "grid", placeItems: "center",
                    fontSize: "1.6rem", flexShrink: 0, overflow: "hidden"
                  }}>
                    {(c.symbol && (c.symbol.startsWith('/') || c.symbol.startsWith('http') || c.symbol.startsWith('data:'))) ? (
                        <img src={c.symbol} alt="symbol" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                    ) : (
                        c.symbol
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: ".94rem", color: "var(--t1)" }}>{c.name}</div>
                    {c.party && (
                      <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: "2px" }}>
                        {c.party.symbol} {c.party.name} ({c.party.abbr})
                      </div>
                    )}
                    <div style={{ fontSize: ".68rem", color: "var(--t3)" }}>{c.education}</div>
                  </div>
                  <span style={{
                    padding: "3px 8px", borderRadius: "100px",
                    fontSize: ".6rem", fontWeight: 700,
                    background: sc.bg, color: sc.color,
                  }}>
                    {c.status}
                  </span>
                </div>

                {c.bio && (
                  <p style={{ fontSize: ".78rem", color: "var(--t2)", lineHeight: 1.5, marginBottom: "12px" }}>
                    {c.bio.slice(0, 100)}{c.bio.length > 100 ? "…" : ""}
                  </p>
                )}

                {c.tags?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
                    {c.tags.map(t => (
                      <span key={t} style={{
                        padding: "2px 8px", borderRadius: "100px",
                        background: "var(--bg2)", border: "1px solid var(--bdr)",
                        fontSize: ".62rem", color: "var(--t3)",
                      }}>{t}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {c.status === "ACTIVE" ? (
                    <ActionBtn
                      label="Withdraw" color="var(--sf)"
                      onClick={() => updateStatus(c.id, "WITHDRAWN")} />
                  ) : c.status === "WITHDRAWN" ? (
                    <ActionBtn
                      label="Reinstate" color="var(--gr-l)"
                      onClick={() => updateStatus(c.id, "ACTIVE")} />
                  ) : null}
                  {c.status !== "DISQUALIFIED" && (
                    <ActionBtn
                      label="Disqualify" color="#EF4444"
                      onClick={() => updateStatus(c.id, "DISQUALIFIED")} />
                  )}
                  <button
                    disabled={deletingId === c.id}
                    onClick={() => deleteCandidate(c.id, c.name)}
                    style={{
                      padding: "5px 12px", borderRadius: "7px",
                      background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
                      color: "#EF4444", fontSize: ".68rem", fontWeight: 700,
                      cursor: "pointer", opacity: deletingId === c.id ? 0.5 : 1,
                      display: "inline-flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    {deletingId === c.id ? "…" : <><Trash2 size={12} /> Remove</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const selectStyle: React.CSSProperties = {
  padding: "9px 12px", background: "var(--bg2)",
  border: "1px solid var(--bdr)", borderRadius: "8px",
  color: "var(--t1)", fontSize: ".84rem", cursor: "pointer",
};

function FieldLabel({ text }: { text: string }) {
  return (
    <label style={{
      fontSize: ".65rem", fontWeight: 700,
      letterSpacing: ".12em", textTransform: "uppercase", color: "var(--t3)",
    }}>
      {text}
    </label>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string;
  onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <FieldLabel text={label} />
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "9px 12px", background: "var(--bg2)",
          border: "1px solid var(--bdr)", borderRadius: "8px",
          color: "var(--t1)", fontSize: ".84rem", transition: "border .2s",
        }}
        onFocus={e => e.target.style.borderColor = "var(--sf)"}
        onBlur={e => e.target.style.borderColor = "var(--bdr)"}
      />
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: "7px",
      background: `${color}15`, border: `1px solid ${color}30`,
      color, fontSize: ".68rem", fontWeight: 700, cursor: "pointer", transition: "all .15s",
    }}>
      {label}
    </button>
  );
}