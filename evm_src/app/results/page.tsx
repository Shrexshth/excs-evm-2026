// src/app/results/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AshokChakra } from "@/components/AshokChakra";
import { Lock, Trophy, TrendingUp, ClipboardList, Hourglass } from "lucide-react";

// ── UI Components ─────────────────────────────────────────────────────────────

function LockedState() {
  const [angle, setAngle] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=>setAngle(a=>(a+0.4)%360),16);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div style={{maxWidth:"700px",margin:"0 auto",padding:"80px 40px",textAlign:"center"}}>
      {/* Animated lock visual */}
      <div style={{width:"180px",height:"180px",margin:"0 auto 40px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {/* Contained glow inside the lock area — doesn't bleed out */}
        <div style={{position:"absolute",inset:"-10px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,53,.12) 30%,transparent 70%)",animation:"placeGlow 3.5s ease-in-out infinite"}}/>

        {/* Rotating ring */}
        <div style={{
          position:"absolute",
          width:"160px",height:"160px",borderRadius:"50%",
          border:"1.5px dashed rgba(255,107,53,.28)",
          transform:`rotate(${angle}deg)`,
        }}/>
        <div style={{
          position:"absolute",
          width:"130px",height:"130px",borderRadius:"50%",
          border:"1px dashed rgba(0,71,171,.22)",
          transform:`rotate(${-angle*.7}deg)`,
        }}/>

        {/* Lock icon */}
        <div style={{position:"relative",zIndex:2,filter:"drop-shadow(0 0 20px rgba(255,107,53,.35))", color: "var(--sf)"}}><Lock size={64}/></div>
      </div>

      <div className="eye" style={{textAlign:"center"}}>Results Status</div>
      <h1 style={{fontFamily:"var(--font-s)",fontSize:"2.2rem",fontWeight:300,color:"var(--t1)",marginBottom:"10px"}}>
        Results Not Yet Published
      </h1>
      <p style={{fontSize:".88rem",color:"var(--t3)",lineHeight:1.8,marginBottom:"32px",maxWidth:"480px",margin:"0 auto 32px"}}>
        The Election Committee has sealed the results. They will be made public once the admin publishes them after the close of polling.
      </p>
      <div style={{
        display:"inline-flex",alignItems:"center",gap:"10px",
        padding:"10px 22px",borderRadius:"100px",
        border:"1px solid rgba(255,107,53,.3)",
        background:"rgba(255,107,53,.06)",
        boxShadow:"inset 0 0 20px rgba(255,107,53,.07)",
        fontSize:".78rem",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--sf)",
      }}>
        <Lock size={12} /> Sealed by Election Committee
      </div>
      <p style={{fontSize:".76rem",color:"var(--t3)",marginTop:"24px"}}>
        Check back after polling closes · Admin publishes results at the scheduled time
      </p>
    </div>
  );
}

function RevealedState({ publishedAt, results, totalVotes, status }: { publishedAt: string, results: any[], totalVotes: number, status: string }) {
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(()=>{ setTimeout(()=>setBarsVisible(true),400); },[]);

  // 1. Process Live Data
  const sortedCandidates = [...results].sort((a, b) => b.votes - a.votes);
  const winner = sortedCandidates[0] || { name: "Pending", votes: 0, pct: 0, icon: <Hourglass size={64}/>, meta: "" };
  const isElectionOver = status === "COMPLETED";

  // Pre-calculated stats row
  const statsConfig = [
    { n: "Live", l: "System Status", col: "var(--t1)" },
    { n: totalVotes.toLocaleString(), l: "Votes Cast", col: "var(--sf)" },
    { n: isElectionOver ? "Final" : "Counting", l: "Tally Status", col: "var(--gr-l)" },
    { n: results.length.toString(), l: "Candidates", col: "var(--gold)" },
  ];

  // Helper to assign beautiful gradients based on rank
  const getRankStyle = (index: number, isNota: boolean) => {
    if (isNota) return "var(--t3)";
    if (index === 0) return "linear-gradient(90deg,var(--sf),var(--gold))";
    if (index === 1) return "linear-gradient(90deg,var(--gr),var(--gr-l))";
    if (index === 2) return "linear-gradient(90deg,var(--ck),#2196F3)";
    return "linear-gradient(90deg,#888,#aaa)";
  };

  return (
    <div style={{padding:"60px 40px",maxWidth:"980px",margin:"0 auto", animation: "fadeIn .4s ease"}}>
      {/* Published banner */}
      <div style={{
        background:"linear-gradient(135deg,rgba(19,136,8,.12),rgba(0,71,171,.08))",
        border:"1px solid rgba(19,136,8,.2)",
        borderRadius:"12px",padding:"20px 28px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:"40px",flexWrap:"wrap",gap:"12px",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:"-30px",left:"-30px",width:"120px",height:"120px",borderRadius:"50%",background:"radial-gradient(circle,rgba(19,136,8,.14) 0%,transparent 70%)",pointerEvents:"none",animation:"placeGlow 4s ease-in-out infinite"}}/>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div className="livedot"/>
          <span style={{fontSize:".78rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"var(--gr-l)"}}>Results Published</span>
          <span style={{fontSize:".8rem",color:"var(--t3)",marginLeft:"4px"}}>Official results declared by Election Committee</span>
        </div>
        {publishedAt && <span style={{fontSize:".72rem",color:"var(--t3)"}}>{publishedAt}</span>}
      </div>

      {/* Winner card */}
      <div style={{
        background:"var(--bgc)",border:"1px solid var(--bdr)",
        borderRadius:"16px",padding:"40px",marginBottom:"36px",
        textAlign:"center",position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 0%,rgba(200,150,30,.1),transparent 55%)",pointerEvents:"none",animation:"placeGlow 4s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"-60px",right:"-60px",width:"200px",height:"200px",borderRadius:"50%",background:"radial-gradient(circle,rgba(200,150,30,.14) 0%,transparent 70%)",pointerEvents:"none"}}/>

        <div style={{position:"absolute",top:"-60px",right:"-60px",width:"200px",height:"200px",borderRadius:"50%",background:"radial-gradient(circle,rgba(200,150,30,.14) 0%,transparent 70%)",pointerEvents:"none"}}/>

        <div style={{fontSize:".7rem",fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--gold)",marginBottom:"18px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
          {isElectionOver ? <><Trophy size={16}/> Student Council President 2025 — Winner</> : <><TrendingUp size={16}/> CURRENT LEADER</>}
        </div>
        <div style={{marginBottom:"14px",display:"flex",justifyContent:"center",position:"relative"}}>
          {(winner.symbol && (winner.symbol.startsWith('/') || winner.symbol.startsWith('http') || winner.symbol.startsWith('data:'))) ? (
              <div style={{width:"80px",height:"80px",borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg2)",border:"2px solid var(--gold)"}}>
                <img src={winner.symbol} alt="symbol" style={{width:"100%", height:"100%", objectFit:"cover"}} />
              </div>
          ) : (
             <span style={{fontSize:"4rem"}}>{winner.symbol || winner.icon}</span>
          )}
        </div>
        <div style={{fontFamily:"var(--font-s)",fontSize:"2.8rem",fontWeight:400,color:"var(--t1)",marginBottom:"6px",position:"relative"}}>{winner.name}</div>
        <div style={{fontSize:".84rem",color:"var(--t3)",letterSpacing:".06em",marginBottom:"20px",position:"relative"}}>{winner.party || "Candidate"}</div>
        <div style={{fontFamily:"var(--font-s)",fontSize:"1.6rem",color:"var(--gold)",position:"relative",textShadow:"0 0 20px rgba(200,150,30,.4)"}}>
          {winner.votes} votes · {totalVotes > 0 ? ((winner.votes / totalVotes) * 100).toFixed(1) : 0}% of ballots cast
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"36px"}} className="r-stats">
        {statsConfig.map(({n,l,col})=>(
          <div key={l} style={{background:"var(--bgc)",border:"1px solid var(--bdr)",borderRadius:"12px",padding:"22px",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:"-30px",left:"50%",transform:"translateX(-50%)",width:"100px",height:"100px",borderRadius:"50%",background:`radial-gradient(circle,${col.includes("sf")?"rgba(255,107,53,.12)":col.includes("gr-l")?"rgba(19,136,8,.12)":col.includes("gold")?"rgba(200,150,30,.12)":"rgba(255,255,255,.04)"} 0%,transparent 70%)`,pointerEvents:"none",animation:"placeGlow 3.5s ease-in-out infinite"}}/>
            <div style={{fontFamily:"var(--font-s)",fontSize:"2.1rem",fontWeight:600,color:col}}>{n}</div>
            <div style={{fontSize:".64rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--t3)",marginTop:"6px"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div style={{background:"var(--bgc)",border:"1px solid var(--bdr)",borderRadius:"12px",overflow:"hidden"}}>
        <div style={{padding:"14px 24px",borderBottom:"1px solid var(--bdr)",fontSize:".68rem",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"var(--t3)",display:"flex",alignItems:"center",gap:"8px"}}>
          <ClipboardList size={14}/> Live Vote Tally — Student Council President
        </div>
        
        {sortedCandidates.map((r, i) => {
          const isNota = r.name.toUpperCase() === "NOTA";
          const rank = isNota ? 0 : i + 1;
          const isWinner = isElectionOver && rank === 1 && r.votes > 0;
          const pct = totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : "0.0";
          const barStyle = getRankStyle(i, isNota);

          return (
            <div key={r.id || r.name} style={{
              display:"grid",gridTemplateColumns:"44px 1fr 220px 110px 70px",
              alignItems:"center",gap:"16px",
              padding:"20px 24px",
              borderBottom: i < sortedCandidates.length - 1 ? "1px solid var(--bdr)" : "none",
              transition:"background .15s",
              position:"relative",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg2)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              {/* Rank */}
              <div style={{
                fontFamily:"var(--font-s)",fontSize:"1.6rem",fontWeight:600,
                color: rank === 1 ? "var(--gold)" : "var(--t3)",
                textAlign:"center",
                textShadow: rank === 1 ? "0 0 20px rgba(200,150,30,.45)" : "none",
              }}>{rank === 0 ? "—" : `#${rank}`}</div>

              {/* Name + meta */}
              <div>
                <div style={{fontSize:".92rem",fontWeight:700,color:rank === 0 ? "var(--t3)" : "var(--t1)"}}>
                  {r.name}
                  {isWinner && (
                    <span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"2px 8px",borderRadius:"100px",fontSize:".6rem",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",background:"rgba(200,150,30,.12)",color:"var(--gold)",border:"1px solid rgba(200,150,30,.25)",marginLeft:"8px"}}>
                      <Trophy size={10}/> Winner
                    </span>
                  )}
                </div>
                <div style={{fontSize:".7rem",color:"var(--t3)",marginTop:"2px"}}>
                  {isNota ? "None of the Above" : (r.party || "Candidate")}
                </div>
              </div>

              {/* Bar */}
              <div style={{height:"7px",background:"var(--bg2)",borderRadius:"100px",overflow:"hidden"}}>
                <div style={{
                  height:"100%",borderRadius:"100px",
                  width: barsVisible ? `${pct}%` : "0%",
                  background: barStyle,
                  transition:"width 1.2s cubic-bezier(.4,0,.2,1)",
                  opacity: rank === 0 ? 0.5 : 1,
                }}/>
              </div>

              <div style={{fontSize:".88rem",fontWeight:700,color:rank === 0 ? "var(--t3)" : "var(--t1)",textAlign:"right"}}>{r.votes}</div>
              <div style={{fontSize:".8rem",color:"var(--t3)",textAlign:"right"}}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page Wrapper ─────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Real Database State
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [status, setStatus] = useState("SCHEDULED");

  useEffect(()=>{
    async function fetchResults() {
      try {
        const res = await fetch("/api/results");
        const data = await res.json();
        
        if (data.success && data.published) {
          setPublished(true);
          setResults(data.results || []);
          setTotalVotes(data.totalVotes || 0);
          setStatus(data.status);
          
          // Optional: Set published time if your API returns it, otherwise use current time
          if (!publishedAt) {
            setPublishedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
          }
        } else {
          setPublished(false);
        }
      } catch (err) {
        console.error("Failed to load live results", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
    // Silently refresh the leaderboard every 10 seconds!
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Navbar/>
      <div className="page-wrap">
        {loading ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
            <div style={{textAlign:"center"}}>
              <AshokChakra size={60} style={{animation:"spinCW 2s linear infinite",margin:"0 auto 16px"}}/>
              <div style={{fontSize:".8rem",color:"var(--t3)"}}>Syncing with secure blockchain…</div>
            </div>
          </div>
        ) : published ? (
          <RevealedState publishedAt={publishedAt} results={results} totalVotes={totalVotes} status={status} />
        ) : (
          <LockedState/>
        )}
      </div>
      <Footer/>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media(max-width:700px){
          .r-stats{grid-template-columns:1fr 1fr!important;}
          div[style*="grid-template-columns: 44px 1fr 220px 110px 70px"]{
            grid-template-columns:36px 1fr!important;
          }
          div[style*="grid-template-columns: 44px 1fr 220px 110px 70px"] > div:nth-child(3),
          div[style*="grid-template-columns: 44px 1fr 220px 110px 70px"] > div:nth-child(4),
          div[style*="grid-template-columns: 44px 1fr 220px 110px 70px"] > div:nth-child(5){
            display:none;
          }
        }
      `}</style>
    </div>
  );
}