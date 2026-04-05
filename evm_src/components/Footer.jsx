"use client";
import Link from "next/link";
import { AshokChakra } from "../components/AshokChakra";

export function Footer() {
  return (
    <footer style={{background:"var(--bgc)",borderTop:"1px solid var(--bdr)",padding:"48px 40px 28px",position:"relative",zIndex:1,overflow:"hidden",transition:"background .5s, border-color .5s"}}>
      {/* Contained ambient glow — doesn't leak outside footer */}
      <div style={{position:"absolute",bottom:"-80px",left:"50%",transform:"translateX(-50%)",width:"700px",height:"250px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,53,.06) 0%,transparent 70%)",pointerEvents:"none",animation:"placeGlow 4s ease-in-out infinite"}}/>

      <div style={{maxWidth:"1260px",margin:"0 auto"}}>
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
              <AshokChakra size={30} opacity={0.8}/>
              <div>
                <div style={{fontFamily:"var(--font-s)",fontSize:"1rem",fontWeight:600,color:"var(--t1)"}}>Vidyalankar Institute</div>
                <div style={{fontSize:".56rem",fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--sf)"}}>e-Ballot 2025-26</div>
              </div>
            </div>
            <p style={{fontSize:".8rem",color:"var(--t3)",lineHeight:1.85,maxWidth:"320px"}}>
              A fully digital mock election for the Student  President at Vidyalankar Institute of Technology &amp; Management, Mumbai.
            </p>
            <div style={{display:"flex",gap:"8px",marginTop:"16px",flexWrap:"wrap"}}>
              {["🔒 AES-256","📱 OTP Verified","🕵️ Anonymous"].map(t=>(
                <span key={t} style={{padding:"3px 9px",borderRadius:"100px",border:"1px solid var(--bdr)",fontSize:".6rem",fontWeight:600,color:"var(--t3)"}}>{t}</span>
              ))}
            </div>
          </div>
          {/* Portal */}
          <div>
            <div style={{fontSize:".62rem",fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--t2)",marginBottom:"14px"}}>Portal</div>
            <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:"10px"}}>
              {[["Home","/"],["Candidates","/candidates"],["Vote","/vote"],["Results","/results"],["About","/about"]].map(([l,h])=>(
                <li key={l}><Link href={h} style={{color:"var(--t3)",fontSize:".8rem",transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--sf)"}
                  onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
                >{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Election info */}
          <div>
            <div style={{fontSize:".62rem",fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--t2)",marginBottom:"14px"}}>Election Info</div>
            <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:"10px"}}>
              {["Student Election 2025-26","Date: 18 April 2026","09:00 AM – 05:00 PM","Main Campus, Mumbai","EC Office: Room B-204"].map(t=>(
                <li key={t} style={{fontSize:".8rem",color:"var(--t3)"}}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{paddingTop:"22px",borderTop:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",fontSize:".68rem",color:"var(--t3)"}}>
          <span>© 2026 Vidyalankar Institute of Technology &amp; Management. All rights reserved by Shreshth Singh.</span>
          <div style={{display:"flex",gap:"7px",alignItems:"center"}}>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"var(--sf)",boxShadow:"0 0 6px rgba(255,107,53,.55)"}}/>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#ccc"}}/>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"var(--gr)",boxShadow:"0 0 6px rgba(19,136,8,.55)"}}/>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display:grid;grid-template-columns:2fr 1fr 1fr;
          gap:60px;margin-bottom:32px;
        }
        @media(max-width:768px){
          .footer-grid{grid-template-columns:1fr;gap:28px;}
          footer{padding:40px 18px 24px;}
        }
      `}</style>
    </footer>
  );
}