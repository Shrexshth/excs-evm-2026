"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const STATIC_CANDIDATES = [
  {
    id:1, serial:"A", icon:"🧑🏾‍💼", name:"Aditya Rane",
    year:"Final Year", branch:"B.Tech Computer Engineering", rollNo:"VIT-21CE-047",
    manifesto:`"Three years at Vidyalankar taught me exactly what needs fixing. I'll push for a revamped placement cell with 50+ new company tie-ups, a working 24/7 computer lab, and a transparent student welfare fund — published monthly for everyone to see."`,
    tags:["Placement Cell","24/7 Lab","Fund Transparency"],
    pill:"pill-sf", bar:"linear-gradient(90deg,var(--sf),var(--gold))",
    glowBg:"rgba(255,107,53,.1)",
  },
  {
    id:2, serial:"B", icon:"👩🏽‍🎓", name:"Sneha Patil",
    year:"Final Year", branch:"B.Com Accounting", rollNo:"VIT-21CA-012",
    manifesto:`"Every student deserves to feel safe, respected, and heard regardless of their branch. I will establish a student grievance portal with 7-day SLA, a women's safety cell, and mandatory mental health awareness workshops each semester."`,
    tags:["Grievance Portal","Women's Cell","Mental Health"],
    pill:"pill-gr", bar:"linear-gradient(90deg,var(--gr),var(--gr-l))",
    glowBg:"rgba(19,136,8,.1)",
  },
  {
    id:3, serial:"C", icon:"👨🏾‍🏆", name:"Rahul Desai",
    year:"Final Year", branch:"B.Sc Information Technology", rollNo:"VIT-21IT-031",
    manifesto:`"Vidyalankar has incredible talent — but no stage. I'll double the annual tech-fest budget, launch an inter-college sports league, create a student-run podcast and news channel, and set up a dedicated startup incubation cell."`,
    tags:["Tech Fest","Sports League","Startup Cell"],
    pill:"pill-ck", bar:"linear-gradient(90deg,var(--ck),#2196F3)",
    glowBg:"rgba(0,71,171,.1)",
  },
];

function CandidateCard({ c }) {
  const [hov, setHov] = useState(false);
  
  // Decide whether the symbol is an image URL or an emoji
  const isImage = c.symbol && (c.symbol.startsWith('/') || c.symbol.startsWith('http') || c.symbol.startsWith('data:image'));
  
  return (
    <div style={{
      background:"var(--bgc)",border:"1px solid var(--bdr)",
      borderRadius:"16px",overflow:"hidden",
      transition:"all .4s",cursor:"default",
      position:"relative",
      transform: hov?"translateY(-8px) rotateX(2deg)":"none",
      boxShadow: hov?"var(--sh)":"none",
    }}
    onMouseEnter={()=>setHov(true)}
    onMouseLeave={()=>setHov(false)}
    >
      {/* Internal place glow */}
      <div style={{
        position:"absolute",inset:0,borderRadius:"16px",
        background:`radial-gradient(circle at 50% -10%,${c.color}22,transparent 55%)`,
        opacity: hov?1:0, transition:"opacity .4s",
        pointerEvents:"none",
      }}/>

      {/* Color bar */}
      <div style={{height:"4px",background:c.color}}/>

      <div style={{padding:"30px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"20px"}}>
          {/* Avatar / Symbol */}
          <div style={{
            width:"72px",height:"72px",borderRadius:"50%",
            display:"grid",placeItems:"center",fontSize:"2.2rem",
            border:"2px solid var(--bdr)",background:"var(--bg2)",
            transition:"transform .3s", overflow: "hidden",
            transform: hov?"scale(1.08)":"none",
          }}>
            {isImage ? (
              <img src={c.symbol} alt={c.name} style={{width:"100%", height:"100%", objectFit:"cover"}} />
            ) : (
              c.symbol
            )}
          </div>
          {/* Pill */}
          <span className="tag-pill" style={{background: `${c.color}22`, color: c.color}}>
            {c.party || "Ind."}
          </span>
        </div>

        <div style={{fontFamily:"var(--font-s)",fontSize:"1.55rem",fontWeight:500,color:"var(--t1)",marginBottom:"3px"}}>{c.name}</div>
        <div style={{fontSize:".72rem",color:"var(--t3)",letterSpacing:".06em",marginBottom:"16px"}}>{c.education}</div>
        <div style={{fontSize:".84rem",color:"var(--t2)",lineHeight:1.75}}>{c.bio || "No manifesto provided."}</div>
      </div>

      <div style={{padding:"18px 30px",borderTop:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:".63rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"var(--t3)",marginBottom:"7px"}}>Key Agenda</div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
            {/* Split tags string into an array if it's not one already */}
            {(Array.isArray(c.tags) ? c.tags : []).map(t=>(
              <span key={t} style={{padding:"3px 9px",borderRadius:"100px",border:"1px solid var(--bdr)",fontSize:".63rem",fontWeight:600,color:"var(--t3)"}}>{t}</span>
            ))}
          </div>
        </div>
        <Link href="/login" style={{
          padding:"9px 20px",
          background:"linear-gradient(135deg,var(--sf),var(--sf-d))",
          color:"#fff",borderRadius:"8px",
          fontSize:".74rem",fontWeight:700,
          letterSpacing:".08em",textTransform:"uppercase",
          boxShadow:"var(--glow-sf)",transition:"all .3s",
          flexShrink:0, textDecoration:"none",
          display:"inline-flex",alignItems:"center",
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 40px rgba(255,107,53,.5)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="var(--glow-sf)";}}
        >Vote</Link>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/candidates?status=active")
      .then(r=>r.ok?r.json():null)
      .then(d=>{ 
          if(d?.candidates?.length) {
              setCandidates(d.candidates); 
          }
      })
      .catch(()=>{})
      .finally(() => setLoading(false));
  },[]);

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Navbar/>
      <div className="sec page-wrap">
        <div className="eye">Contesting Candidates</div>
        <div className="bigt">Student Council President — 2025-26</div>
        <p style={{fontSize:".86rem",color:"var(--t3)",marginTop:"8px"}}>
          Polling closes 19 April 2026 at 5:00 PM · One vote per student · NOTA available
        </p>

        {loading ? (
             <div style={{textAlign: "center", padding: "60px", color: "var(--t3)"}}>Loading candidates...</div>
        ) : candidates.length === 0 ? (
             <div style={{textAlign: "center", padding: "60px", color: "var(--t3)", background: "var(--bgc)", borderRadius: "16px", marginTop: "40px", border: "1px solid var(--bdr)"}}>
                 <h3>No active candidates found.</h3>
                 <p style={{fontSize: ".85rem", marginTop: "8px"}}>Candidates will appear here once registered and approved by the Election Commission.</p>
             </div>
        ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"28px",marginTop:"44px"}} className="cand-grid">
            {candidates.map(c=>(
                <CandidateCard key={c.id} c={c}/>
            ))}
            </div>
        )}

        {/* NOTA notice */}
        <div style={{
          marginTop:"32px",
          background:"var(--bgc)",border:"1px solid var(--bdr)",
          borderRadius:"12px",padding:"20px 28px",
          display:"flex",alignItems:"center",gap:"16px",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:"-30px",left:"-30px",width:"120px",height:"120px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,71,171,.1) 0%,transparent 70%)",pointerEvents:"none",animation:"placeGlow 4s ease-in-out infinite"}}/>
          <div style={{fontSize:"1.8rem",flexShrink:0}}>🚫</div>
          <div>
            <div style={{fontSize:".92rem",fontWeight:700,color:"var(--t1)",marginBottom:"3px"}}>NOTA — None of the Above</div>
            <div style={{fontSize:".78rem",color:"var(--t3)"}}>Your constitutional right to reject all candidates is available on the voting page. उपरोक्त में से कोई नहीं.</div>
          </div>
        </div>
      </div>
      <Footer/>
      <style>{`
        @media(max-width:900px){ .cand-grid{grid-template-columns:1fr 1fr!important;} }
        @media(max-width:560px){ .cand-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}