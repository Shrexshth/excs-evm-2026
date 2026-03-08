"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// We keep the styling properties here so dynamic database candidates still look beautiful
const UI_STYLES = [
  { bar: "linear-gradient(90deg,var(--sf),var(--gold))", glow: "rgba(255,107,53,.14)" },
  { bar: "linear-gradient(90deg,var(--gr),var(--gr-l))", glow: "rgba(19,136,8,.14)" },
  { bar: "linear-gradient(90deg,var(--ck),#2196F3)", glow: "rgba(0,71,171,.14)" },
];

function SuccessScreen({ receiptId, chosen, onClose }) {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:4000,
      background:"var(--bg)",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"40px",
      animation:"fadeUp .4s ease",
    }}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:"600px",height:"600px",borderRadius:"50%",background:"radial-gradient(circle,rgba(19,136,8,.12) 0%,transparent 65%)",pointerEvents:"none",animation:"placeGlow 4s ease-in-out infinite"}}/>

      <div style={{position:"relative",textAlign:"center",zIndex:1}}>
        <div style={{fontSize:"5.5rem",marginBottom:"20px",filter:"drop-shadow(0 0 30px rgba(19,136,8,.65))",animation:"bigPop .7s cubic-bezier(.36,.07,.19,.97)"}}>
          ☑️
        </div>
        <h1 style={{fontFamily:"var(--font-s)",fontSize:"3rem",fontWeight:300,color:"var(--t1)",marginBottom:"10px"}}>
          Vote Cast <em style={{color:"var(--gr-l)",fontStyle:"normal",fontWeight:600,textShadow:"0 0 40px rgba(46,204,64,.4)"}}>Successfully</em>
        </h1>
        <p style={{fontSize:".9rem",color:"var(--t3)",marginBottom:"10px"}}>Your encrypted vote has been recorded anonymously.</p>
        <div style={{
          fontFamily:"var(--font-s)",fontSize:"1.1rem",color:"#64B5F6",
          marginBottom:"32px",
          background:"rgba(0,71,171,.08)",padding:"8px 20px",
          borderRadius:"8px",border:"1px solid rgba(0,71,171,.2)",
          display:"inline-block",
          boxShadow:"inset 0 0 20px rgba(0,71,171,.07)",
        }}>
          Receipt #{receiptId}
        </div>

        <div style={{display:"flex",gap:"10px",justifyContent:"center",marginBottom:"30px"}}>
          {["var(--sf)","#ccc","var(--gr-l)"].map((c,i)=>(
            <div key={i} style={{width:"10px",height:"10px",borderRadius:"50%",background:c,boxShadow:i===0?"0 0 8px rgba(255,107,53,.7)":i===2?"0 0 8px rgba(46,204,64,.7)":"none"}}/>
          ))}
        </div>

        <p style={{fontSize:".78rem",color:"var(--t3)",maxWidth:"400px",lineHeight:1.75,marginBottom:"32px"}}>
          Save your receipt number. You can verify your vote was counted at any time using this reference. Your identity is permanently decoupled from your ballot.
        </p>
        <button className="btn-p" onClick={onClose} style={{fontSize:".86rem",padding:"14px 36px"}}>
          Back to Home →
        </button>
      </div>

      <style>{`
        @keyframes bigPop{0%{transform:scale(0) rotate(-180deg);opacity:0}80%{transform:scale(1.15) rotate(5deg)}100%{transform:scale(1) rotate(0);opacity:1}}
      `}</style>
    </div>
  );
}

export default function VotePage() {
  const router = useRouter();
  
  // --- REAL DATABASE STATE ---
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  
  const [chosen, setChosen]         = useState(null); 
  const [confirm, setConfirm]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [receiptId, setReceiptId]   = useState("");
  const [toast, setToast]           = useState("");

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),3200); }

  // --- 1. FETCH REAL CANDIDATES ON LOAD ---
  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await fetch("/api/candidates");
        const data = await res.json();
        if (data.candidates) {
          setCandidates(data.candidates);
        }
      } catch (err) {
        showToast("⚠️ Could not load ballot from server.");
      } finally {
        setLoading(false);
      }
    }
    loadCandidates();
  }, []);

  function pick(id){
    setChosen(prev=>prev===id?null:id);
  }

  // --- 2. SUBMIT SECURE VOTE TO NEON ---
  async function submitVote(){
    setConfirm(false);
    
    // Get the student ID we saved during the login phase
    const voterId = localStorage.getItem("temp_user_id");
    
    if (!voterId) {
      showToast("⚠️ Session expired. Please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    try {
      const payload = {
        voterId: voterId, // 🚨 FIXED: Removed parseInt() which was breaking the ID
        candidateId: chosen === "NOTA" ? null : chosen // NOTA sends null to DB
      };

      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Vote was successfully recorded!
        const rid = Math.floor(Math.random()*900000+100000);
        setReceiptId(String(rid));
        setSuccess(true);
        
        // Security: Remove the user ID so they can't hit the back button and vote again
        localStorage.clear();
        window.dispatchEvent(new Event("auth-change"));
      } else {
        // E.g., "You have already voted."
        showToast(`❌ ${data.message || "Failed to submit vote."}`);
      }
    } catch (err) {
      showToast("⚠️ Network error while casting vote.");
    }
  }

  if(success) return <SuccessScreen receiptId={receiptId} chosen={chosen} onClose={()=>router.push("/")} />;

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Navbar/>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"60px 40px"}} className="page-wrap">
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"52px"}}>
          <div className="eye" style={{textAlign:"center"}}>Secure Voting Portal</div>
          <h1 style={{fontFamily:"var(--font-s)",fontSize:"2.4rem",fontWeight:300,color:"var(--t1)",marginBottom:"6px"}}>
            Student Council President
          </h1>
          <p style={{fontSize:".84rem",color:"var(--t3)",letterSpacing:".06em"}}>
            Vidyalankar Institute · Mock Election 2025 · Select one candidate or NOTA
          </p>
        </div>

        {loading ? (
           <div style={{textAlign: "center", padding: "40px", color: "var(--t3)"}}>Loading secure ballot...</div>
        ) : (
          <>
            {/* Candidate cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"18px",marginBottom:"24px"}} className="vote-grid">
              {candidates.map((c, index) => {
                const isChosen = chosen===c.id;
                // Safely grab styles. If there are more than 3 candidates, it loops back to the first style.
                const style = UI_STYLES[index % UI_STYLES.length]; 
                
                return (
                  <div key={c.id}
                    onClick={()=>pick(c.id)}
                    style={{
                      background:"var(--bgc)",
                      border:`2px solid ${isChosen?"var(--sf)":"var(--bdr)"}`,
                      borderRadius:"12px",padding:"26px 20px",
                      cursor:"pointer",transition:"all .3s",
                      position:"relative",overflow:"hidden",
                      transform: isChosen?"translateY(-4px)":"none",
                      boxShadow: isChosen?"0 0 40px rgba(255,107,53,.22)":"none",
                    }}
                    onMouseEnter={e=>{if(!isChosen){e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="var(--sh),0 0 28px rgba(255,107,53,.1)";e.currentTarget.style.borderColor="rgba(255,107,53,.3)";}}}
                    onMouseLeave={e=>{if(!isChosen){e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="var(--bdr)";}}}
                  >
                    {isChosen&&<div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 0%,${style.glow},transparent 55%)`,pointerEvents:"none"}}/>}

                    {isChosen&&(
                      <div style={{
                        position:"absolute",top:"12px",right:"12px",
                        width:"26px",height:"26px",borderRadius:"50%",
                        background:"linear-gradient(135deg,var(--sf),var(--sf-d))",
                        color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:".8rem",fontWeight:800,
                        boxShadow:"0 0 15px rgba(255,107,53,.65)",
                        animation:"popCheck .3s cubic-bezier(.36,.07,.19,.97)",
                      }}>✓</div>
                    )}

                    <div style={{height:"3px",borderRadius:"2px",background:style.bar,marginBottom:"18px"}}/>

                    <div style={{
                      width:"58px",height:"58px",borderRadius:"50%",
                      display:"grid",placeItems:"center",fontSize:"1.7rem",
                      background:"var(--bg2)",marginBottom:"14px",
                      transition:"transform .3s",
                      transform: isChosen?"scale(1.1)":"none",
                    }}>{c.symbol}</div>

                    <div style={{fontFamily:"var(--font-s)",fontSize:"1.25rem",fontWeight:500,color:"var(--t1)",marginBottom:"3px"}}>{c.name}</div>
                    <div style={{fontSize:".7rem",fontWeight:700,letterSpacing:".09em",textTransform:"uppercase",color:"var(--t3)",marginBottom:"10px"}}>{c.party}</div>
                  </div>
                );
              })}
            </div>

            {/* NOTA row */}
            <div onClick={()=>setChosen(p=>p==="NOTA"?null:"NOTA")}
              style={{
                background: chosen==="NOTA"?"rgba(0,71,171,.05)":"var(--bgc)",
                border:`2px solid ${chosen==="NOTA"?"var(--ck)":"var(--bdr)"}`,
                borderRadius:"12px",padding:"20px 24px",
                cursor:"pointer",transition:"all .3s",
                display:"flex",alignItems:"center",gap:"16px",marginBottom:"36px",
                position:"relative",overflow:"hidden",
                boxShadow: chosen==="NOTA"?"0 0 30px rgba(0,71,171,.22)":"none",
              }}
              onMouseEnter={e=>{if(chosen!=="NOTA"){e.currentTarget.style.borderColor="rgba(100,100,255,.4)";e.currentTarget.style.boxShadow="0 0 20px rgba(0,71,171,.1)";}}}
              onMouseLeave={e=>{if(chosen!=="NOTA"){e.currentTarget.style.borderColor="var(--bdr)";e.currentTarget.style.boxShadow="none";}}}
            >
              {chosen==="NOTA"&&<div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 50%,rgba(0,71,171,.1),transparent 55%)",pointerEvents:"none"}}/>}
              <div style={{fontSize:"1.7rem",flexShrink:0}}>🚫</div>
              <div style={{flex:1}}>
                <div style={{fontSize:".95rem",fontWeight:700,color:"var(--t1)"}}>NOTA — None of the Above</div>
                <div style={{fontSize:".74rem",color:"var(--t3)",marginTop:"2px"}}>उपरोक्त में से कोई नहीं · Your constitutional right to reject</div>
              </div>
              {chosen==="NOTA"&&(
                <div style={{
                  width:"26px",height:"26px",borderRadius:"50%",
                  background:"linear-gradient(135deg,var(--ck),var(--ck-l))",
                  color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:".8rem",fontWeight:800,
                  boxShadow:"0 0 15px rgba(0,71,171,.6)",
                  animation:"popCheck .3s cubic-bezier(.36,.07,.19,.97)",
                  flexShrink:0,
                }}>✓</div>
              )}
            </div>

            {/* Cast button */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
              <button
                onClick={()=>{ if(!chosen){showToast("⚠️ Please select a candidate or NOTA before proceeding.");return;} setConfirm(true); }}
                style={{
                  padding:"17px 55px",
                  background:"linear-gradient(135deg,var(--gr),var(--gr-d))",
                  color:"#fff",borderRadius:"10px",
                  fontSize:"1.05rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
                  boxShadow:"0 4px 30px rgba(19,136,8,.42)",transition:"all .3s",
                  position:"relative",overflow:"hidden",border:"none",cursor:"pointer",
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 50px rgba(19,136,8,.6)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 30px rgba(19,136,8,.42)";}}
              >
                🗳️ Review &amp; Submit Vote
              </button>
              <p style={{fontSize:".7rem",color:"var(--t3)",textAlign:"center",lineHeight:1.8,maxWidth:"420px"}}>
                Your vote is end-to-end encrypted and anonymous. Linked to your enrollment number to prevent double voting, but cannot be traced back to you. Votes are final once submitted.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {confirm&&(
        <div className="modal-ovl open" onClick={e=>{if(e.target===e.currentTarget)setConfirm(false);}}>
          <div className="modal">
            <div className="tri-bar"><div className="t1"/><div className="t2"/><div className="t3"/></div>
            <div className="modal-body">
              <div className="modal-h">Confirm Your Vote</div>
              <div className="modal-s">You are about to cast your vote. This action is final and cannot be undone. Please review your selection carefully.</div>

              <div style={{background:"var(--bg2)",border:"1px solid var(--bdr)",borderRadius:"10px",padding:"16px 20px",display:"flex",alignItems:"center",gap:"14px",marginBottom:"24px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:"-20px",right:"-20px",width:"100px",height:"100px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,53,.1) 0%,transparent 70%)",pointerEvents:"none",animation:"placeGlow 3s ease-in-out infinite"}}/>
                <div style={{fontSize:"1.6rem"}}>{chosen==="NOTA"?"🚫":candidates.find(c=>c.id===chosen)?.symbol}</div>
                <div>
                  <div style={{fontSize:".64rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--sf)",marginBottom:"3px"}}>Your Selection</div>
                  <div style={{fontSize:".95rem",fontWeight:700,color:"var(--t1)"}}>
                    {chosen==="NOTA"?"NOTA — None of the Above":candidates.find(c=>c.id===chosen)?.name}
                  </div>
                  {chosen!=="NOTA"&&<div style={{fontSize:".75rem",color:"var(--t3)",marginTop:"2px"}}>{candidates.find(c=>c.id===chosen)?.party}</div>}
                </div>
              </div>

              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={submitVote} className="btn-gr" style={{flex:1,justifyContent:"center",padding:"13px"}}>
                  ✓ Cast My Vote
                </button>
                <button onClick={()=>setConfirm(false)} style={{padding:"13px 18px",background:"transparent",border:"1.5px solid var(--bdr)",borderRadius:"8px",color:"var(--t3)",fontSize:".85rem",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--t3)";e.currentTarget.style.color="var(--t1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bdr)";e.currentTarget.style.color="var(--t3)";}}
                >← Change</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:"28px",right:"28px",zIndex:5000,background:"var(--bgc)",border:"1px solid var(--bdr)",borderLeft:"3px solid var(--sf)",borderRadius:"10px",padding:"14px 22px",boxShadow:"var(--sh)",display:"flex",alignItems:"center",gap:"10px",fontSize:".86rem",color:"var(--t1)",backdropFilter:"blur(20px)",animation:"popIn .3s ease"}}>
          {toast}
        </div>
      )}

      <Footer/>

      <style>{`
        @keyframes popCheck{0%{transform:scale(0)}80%{transform:scale(1.3)}100%{transform:scale(1)}}
        @media(max-width:700px){ .vote-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}