"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import AshokChakra from "../components/AshokChakra";


const POLL_END = new Date("2025-02-23T17:00:00");

function useCd() {
  const calc = () => {
    const d = Math.max(0, POLL_END - Date.now());
    return {
      d: Math.floor(d/86400000),
      h: Math.floor((d%86400000)/3600000),
      m: Math.floor((d%3600000)/60000),
      s: Math.floor((d%60000)/1000),
    };
  };
  const [cd, setCd] = useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{ setCd(calc()); const t=setInterval(()=>setCd(calc()),1000); return()=>clearInterval(t); },[]);
  return cd;
}

function HeroVis() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative",width:"390px",height:"390px",flexShrink:0}}>
      {/* Contained ambient glow behind the whole vis — stays inside */}
      <div style={{position:"absolute",inset:"-10px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,71,171,.13) 30%,transparent 70%)",animation:"placeGlow 4s ease-in-out infinite",pointerEvents:"none"}}/>

      {/* Orbit rings */}
      {[340,268,200].map((s,i)=>(
        <div key={s} style={{
          position:"absolute",width:s,height:s,borderRadius:"50%",
          border:`1px solid rgba(255,255,255,${.055-i*.014})`,
          animation:`${i%2===0?"spinCW":"spinCCW"} ${20+i*10}s linear infinite`,
        }}/>
      ))}

      {/* Saffron orbit dot */}
      <div style={{position:"absolute",width:0,height:0,top:"50%",left:"50%"}}>
        <div style={{
          position:"absolute",width:"11px",height:"11px",borderRadius:"50%",
          background:"var(--sf)",
          boxShadow:"0 0 14px rgba(255,107,53,.9),0 0 28px rgba(255,107,53,.5)",
          top:"-170px",left:"-5.5px",
          transformOrigin:"5.5px 170px",
          animation:"spinCW 11s linear infinite",
        }}/>
      </div>

      {/* Green orbit dot */}
      <div style={{position:"absolute",width:0,height:0,top:"50%",left:"50%"}}>
        <div style={{
          position:"absolute",width:"8px",height:"8px",borderRadius:"50%",
          background:"var(--gr-l)",
          boxShadow:"0 0 12px rgba(19,136,8,.9),0 0 24px rgba(19,136,8,.5)",
          top:"-134px",left:"-4px",
          transformOrigin:"4px 134px",
          animation:"spinCCW 8.5s linear infinite",
        }}/>
      </div>

      {/* Main chakra — floats + spins */}
      <div style={{animation:"floatY 5s ease-in-out infinite",position:"relative",zIndex:2}}>
        <AshokChakra size={152} opacity={0.92} style={{animation:"spinCW 28s linear infinite"}}/>
        {/* Inner shine on chakra */}
        <div style={{position:"absolute",inset:"-8px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,71,171,.22) 0%,transparent 65%)",pointerEvents:"none"}}/>
      </div>

      {/* Top badge */}
      <div style={{
        position:"absolute",top:"6px",right:"-6px",
        background:"var(--bgc)",border:"1px solid var(--bdr)",
        borderRadius:"12px",padding:"12px 16px",
        boxShadow:"var(--sh)",backdropFilter:"blur(12px)",zIndex:3,
        /* Inner glow shines inside the badge */
        boxShadow:"inset 0 0 20px rgba(0,71,171,.07), var(--sh)",
      }}>
        <div style={{fontSize:"1.4rem",marginBottom:"3px"}}>🏛️</div>
        <div style={{fontSize:".72rem",fontWeight:700,color:"var(--t1)"}}>Vidyalankar Institute</div>
        <div style={{fontSize:".58rem",color:"var(--t3)",letterSpacing:".07em"}}>Mumbai · Est. 1960</div>
      </div>

      {/* Bottom live badge */}
      <div style={{
        position:"absolute",bottom:"20px",left:"-10px",
        background:"var(--bgc)",border:"1px solid var(--bdr)",
        borderRadius:"12px",padding:"12px 16px",
        boxShadow:"inset 0 0 20px rgba(19,136,8,.07), var(--sh)",
        backdropFilter:"blur(12px)",
        display:"flex",alignItems:"center",gap:"10px",zIndex:3,
      }}>
        <div className="livedot"/>
        <div>
          <div style={{fontSize:".72rem",fontWeight:700,color:"var(--t1)"}}>Voting Live</div>
          <div style={{fontSize:".58rem",color:"var(--t3)"}}>847 votes cast</div>
        </div>
      </div>
    </div>
  );
}

function HowCard({ step, icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      background:"var(--bgc)",border:"1px solid var(--bdr)",
      borderRadius:"12px",padding:"28px 22px",
      transition:"all .3s",position:"relative",overflow:"hidden",cursor:"default",
      transform: hov?"translateY(-6px)":"none",
      boxShadow: hov?"var(--sh),0 0 28px rgba(255,107,53,.1)":"none",
    }}
    onMouseEnter={()=>setHov(true)}
    onMouseLeave={()=>setHov(false)}
    >
      {/* Top accent line */}
      <div style={{
        position:"absolute",top:0,left:0,right:0,height:"2px",
        background:"linear-gradient(90deg,var(--sf),var(--gold))",
        transform: hov?"scaleX(1)":"scaleX(0)",
        transformOrigin:"left",transition:"transform .4s",
      }}/>
      {/* Contained place glow — inside the card, fades before border */}
      {hov&&(
        <div style={{
          position:"absolute",top:"-40px",left:"50%",transform:"translateX(-50%)",
          width:"160px",height:"160px",borderRadius:"50%",
          background:"radial-gradient(circle,rgba(255,107,53,.12) 0%,transparent 70%)",
          pointerEvents:"none",
        }}/>
      )}
      <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".22em",color:"var(--t3)",marginBottom:"16px"}}>Step {String(step).padStart(2,"0")}</div>
      <div style={{fontSize:"2rem",marginBottom:"14px"}}>{icon}</div>
      <div style={{fontSize:".95rem",fontWeight:700,color:"var(--t1)",marginBottom:"6px"}}>{title}</div>
      <div style={{fontSize:".8rem",color:"var(--t2)",lineHeight:1.7}}>{desc}</div>
    </div>
  );
}

export default function HomePage() {
  const cd = useCd();
  const p = n=>String(n).padStart(2,"0");

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Navbar/>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{position:"relative",overflow:"hidden"}} className="bg-mesh">
        <div style={{
          maxWidth:"1260px",margin:"0 auto",
          padding:"80px 40px 60px",
          display:"grid",gridTemplateColumns:"1fr 390px",
          gap:"60px",alignItems:"center",
          minHeight:"calc(100vh - 70px)",
        }} className="hero-grid">
          {/* Left */}
          <div>
            {/* Live badge */}
            <div style={{
              display:"inline-flex",alignItems:"center",gap:"8px",
              padding:"5px 14px",borderRadius:"100px",
              border:"1px solid rgba(255,107,53,.35)",
              background:"rgba(255,107,53,.06)",
              marginBottom:"22px",
              /* Subtle inner glow */
              boxShadow:"inset 0 0 16px rgba(255,107,53,.06)",
            }}>
              <div className="bdot"/>
              <span style={{fontSize:".67rem",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"var(--sf)"}}>
                Voting Portal Open · 23 Feb 2025
              </span>
            </div>

            {/* Devanagari */}
            <div style={{fontFamily:"var(--font-d)",fontSize:".85rem",color:"var(--t3)",letterSpacing:".1em",marginBottom:"10px"}}>
              विद्यालंकार संस्थान — छात्र परिषद अध्यक्ष चुनाव २०२५
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily:"var(--font-s)",
              fontSize:"clamp(3rem,5.5vw,4.8rem)",
              fontWeight:300,lineHeight:1.04,
              color:"var(--t1)",marginBottom:"24px",
            }}>
              Your Campus.<br/>
              <em style={{fontStyle:"italic",color:"var(--sf)",textShadow:"0 0 60px rgba(255,107,53,.45)"}}>Your</em>{" "}
              <strong style={{fontWeight:600}}>President.</strong>
            </h1>

            <p style={{fontSize:".97rem",lineHeight:1.8,color:"var(--t2)",maxWidth:"480px",marginBottom:"36px"}}>
              Vidyalankar Institute's first fully digital Student Council President election. Three candidates, one position — your single, encrypted, anonymous vote decides the future of our campus.
            </p>

            <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
              <Link href="/login" className="btn-p" style={{fontSize:".84rem"}}>🗳️ Cast Your Vote</Link>
              <Link href="/candidates" className="btn-o" style={{fontSize:".84rem"}}>Meet the Candidates →</Link>
            </div>

            {/* Countdown */}
            <div style={{
              display:"flex",gap:"24px",flexWrap:"wrap",
              marginTop:"48px",paddingTop:"36px",
              borderTop:"1px solid var(--bdr)",
            }}>
              {[{v:cd.d,l:"Days Left"},{v:cd.h,l:"Hours"},{v:cd.m,l:"Minutes"},{v:cd.s,l:"Seconds"}].map(({v,l})=>(
                <div key={l}>
                  <div style={{
                    fontFamily:"var(--font-s)",fontSize:"2.6rem",fontWeight:600,
                    color:"var(--t1)",lineHeight:1,
                    textShadow:"0 0 30px rgba(255,107,53,.28)",
                  }}>
                    {p(v)}<span style={{color:"var(--sf)"}}>·</span>
                  </div>
                  <div style={{fontSize:".62rem",fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"var(--t3)",marginTop:"4px"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated chakra vis */}
          <div className="hero-vis-wrap" style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
            <HeroVis/>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="bg-alt">
        <div className="sec">
          <div className="eye">How It Works</div>
          <div className="bigt" style={{marginBottom:"44px"}}>Simple. Secure. Democratic.</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"18px"}} className="how-grid">
            <HowCard step={1} icon="🪪" title="Login with Student ID"
              desc="Enter your Vidyalankar enrollment number. One account per student — enforced automatically."/>
            <HowCard step={2} icon="👥" title="Review Candidates"
              desc="Read each candidate's full manifesto and agenda before making your informed choice."/>
            <HowCard step={3} icon="🗳️" title="Cast Your Vote"
              desc="Select your candidate or NOTA. Confirm your choice — it's encrypted, final, and anonymous."/>
            <HowCard step={4} icon="📊" title="Results"
              desc="Results are sealed until the Admin publishes them. Check the Results page after polling day."/>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section>
        <div className="sec" style={{paddingTop:"56px",paddingBottom:"56px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"20px"}} className="stats-grid">
            {[
              {n:"4,827",l:"Registered Students",  a:"sf",   g:"rgba(255,107,53,.2)"},
              {n:"3",    l:"Candidates Running",   a:"ck",   g:"rgba(0,71,171,.2)"},
              {n:"847",  l:"Votes Cast So Far",    a:"gr",   g:"rgba(19,136,8,.2)"},
              {n:"67.2%",l:"Current Turnout",      a:"gold", g:"rgba(200,150,30,.22)"},
            ].map(({n,l,a,g})=>{
              const colors={sf:"var(--sf)",ck:"#64B5F6",gr:"var(--gr-l)",gold:"var(--gold-l)"};
              return (
                <div key={l} style={{
                  background:"var(--bgc)",border:"1px solid var(--bdr)",
                  borderRadius:"12px",padding:"24px",
                  position:"relative",overflow:"hidden",transition:"all .3s",cursor:"default",
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="var(--sh)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
                >
                  {/* Place glow — contained inside card */}
                  <div style={{
                    position:"absolute",top:"-40px",right:"-40px",
                    width:"130px",height:"130px",borderRadius:"50%",
                    background:`radial-gradient(circle,${g} 0%,transparent 70%)`,
                    pointerEvents:"none",animation:"placeGlow 3.5s ease-in-out infinite",
                  }}/>
                  <div style={{fontFamily:"var(--font-s)",fontSize:"2.6rem",fontWeight:600,color:colors[a],lineHeight:1,position:"relative"}}>{n}</div>
                  <div style={{fontSize:".64rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"var(--t3)",marginTop:"6px"}}>{l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="bg-alt">
        <div style={{maxWidth:"700px",margin:"0 auto",padding:"80px 40px",textAlign:"center",position:"relative"}}>
          {/* Contained radial glow in CTA */}
          <div style={{
            position:"absolute",top:"50%",left:"50%",
            transform:"translate(-50%,-50%)",
            width:"500px",height:"300px",borderRadius:"50%",
            background:"radial-gradient(ellipse,rgba(255,107,53,.06) 0%,transparent 65%)",
            pointerEvents:"none",animation:"placeGlow 5s ease-in-out infinite",
          }}/>
          <div className="eye" style={{textAlign:"center"}}>Your Voice Matters</div>
          <h2 style={{fontFamily:"var(--font-s)",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:300,color:"var(--t1)",marginBottom:"16px",lineHeight:1.2,position:"relative"}}>
            Every vote shapes{" "}
            <em style={{fontStyle:"italic",color:"var(--sf)"}}>our campus</em>{" "}future.
          </h2>
          <p style={{fontSize:".88rem",color:"var(--t2)",lineHeight:1.8,marginBottom:"32px",position:"relative"}}>
            Polling is open today. Login with your Vidyalankar enrollment number and OTP to cast your one encrypted, anonymous vote.
          </p>
          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap",position:"relative"}}>
            <Link href="/login" className="btn-p" style={{fontSize:".86rem",padding:"14px 32px"}}>🗳️ Vote Now</Link>
            <Link href="/candidates" className="btn-o" style={{fontSize:".86rem",padding:"14px 32px"}}>View All Candidates</Link>
          </div>
        </div>
      </section>

      <Footer/>

      <style>{`
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;}
          .hero-vis-wrap{display:none!important;}
          .how-grid{grid-template-columns:1fr 1fr!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:560px){
          .how-grid{grid-template-columns:1fr!important;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>
    </div>
  );
}