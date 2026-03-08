"use client";

const ACCENT = {
  sf:   { color:"var(--sf)",   glow:"rgba(255,107,53,.2)",  bg:"rgba(255,107,53,.08)"  },
  gr:   { color:"var(--gr-l)", glow:"rgba(19,136,8,.2)",    bg:"rgba(19,136,8,.08)"    },
  ck:   { color:"#64B5F6",     glow:"rgba(0,71,171,.2)",    bg:"rgba(0,71,171,.08)"    },
  gold: { color:"var(--gold-l)",glow:"rgba(200,150,30,.22)",bg:"rgba(200,150,30,.08)"  },
};

export function StatCard({ number, label, accent="sf", icon, trend }) {
  const c = ACCENT[accent]||ACCENT.sf;
  return (
    <div style={{
      background:"var(--bgc)",border:"1px solid var(--bdr)",
      borderRadius:"12px",padding:"24px",
      position:"relative",overflow:"hidden",transition:"all .3s",cursor:"default",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="var(--sh)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
    >
      {/* Contained place glow blob */}
      <div className="glow-blob" style={{
        width:"120px",height:"120px",
        top:"-40px",right:"-40px",
        background:`radial-gradient(circle,${c.glow} 0%,transparent 70%)`,
        animationDelay:`${Math.random()*.8}s`,
      }}/>
      {icon&&(
        <div style={{width:"36px",height:"36px",borderRadius:"8px",background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",marginBottom:"12px",border:`1px solid ${c.glow}`,position:"relative",zIndex:1}}>
          {icon}
        </div>
      )}
      <div style={{fontFamily:"var(--font-s)",fontSize:"2.5rem",fontWeight:600,color:c.color,lineHeight:1,position:"relative",zIndex:1}}>
        {number}
      </div>
      <div style={{fontSize:".64rem",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"var(--t3)",marginTop:"6px",position:"relative",zIndex:1}}>
        {label}
      </div>
      {trend&&<div style={{fontSize:".72rem",color:"var(--gr-l)",marginTop:"6px",position:"relative",zIndex:1}}>{trend}</div>}
    </div>
  );
}