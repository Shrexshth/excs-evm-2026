"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { AshokChakra } from "./AshokChakra";
import { Vote, LogOut, Menu, X, Sun, Moon } from "lucide-react";

const LINKS = [
  { href:"/",            label:"Home"       },
  { href:"/candidates",  label:"Candidates" },
  { href:"/vote",        label:"Vote"       },
  { href:"/results",     label:"Results"    },
  { href:"/about",       label:"About"      },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [mob, setMob] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // --- Smart Auth State ---
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    
    // Function to check localStorage
    const syncAuth = () => {
      setUserName(localStorage.getItem("userName") || null);
    };

    // Check immediately on load
    syncAuth();

    // Listen for custom login/logout events from other pages
    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth-change", syncAuth);
    };
  }, [pathname]); // Re-run if URL changes

  // --- Logout Handler ---
  function handleLogout() {
    localStorage.clear();
    setUserName(null);
    setMob(false);
    window.dispatchEvent(new Event("auth-change")); // Tell app we logged out
    router.push("/login");
  }

  const isOn = href => href==="/"?pathname==="/":pathname.startsWith(href);

  return (
    <>
      {/* ── Glowing tricolor strip ── */}
      <div className="tristrip">
        <div className="ts-s"/><div className="ts-s"/><div className="ts-s"/>
      </div>

      <nav style={{
        position:"fixed", top:"4px", left:0, right:0,
        zIndex:1000, height:"66px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 40px",
        background: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
        borderBottom:"1px solid var(--bdr)",
        backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        transition:"background .5s, border-color .5s",
      }}>
        {/* Logo */}
        <Link href="/" style={{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"}}>
          <AshokChakra size={36} opacity={0.9}/>
          <div>
            <div style={{fontFamily:"var(--font-s)",fontSize:"1.1rem",fontWeight:600,color:"var(--t1)",letterSpacing:".02em",lineHeight:1.1}}>
              Vidyalankar Institute
            </div>
            <div style={{fontSize:".57rem",fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"var(--sf)",marginTop:"2px"}}>
              e-Ballot 2025
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{display:"flex",alignItems:"center",gap:"2px"}} className="nav-desktop">
          {LINKS.map(({href,label})=>(
            <Link key={href} href={href} style={{
              padding:"8px 14px",
              background: isOn(href)?"rgba(255,107,53,.08)":"transparent",
              fontSize:".77rem", fontWeight:600,
              letterSpacing:".08em", textTransform:"uppercase",
              color: isOn(href)?"var(--sf)":"var(--t3)",
              borderRadius:"8px", transition:"all .2s", textDecoration:"none",
            }}
            onMouseEnter={e=>{if(!isOn(href)){e.currentTarget.style.color="var(--sf)";e.currentTarget.style.background="rgba(255,107,53,.06)";}}}
            onMouseLeave={e=>{if(!isOn(href)){e.currentTarget.style.color="var(--t3)";e.currentTarget.style.background="transparent";}}}
            >{label}</Link>
          ))}
        </div>

        {/* Right */}
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <button onClick={toggle} style={{
            width:"36px",height:"36px",borderRadius:"8px",
            border:"1px solid var(--bdr)",background:"var(--bgc)",
            color:"var(--t2)",
            display:"flex",alignItems:"center",justifyContent:"center",
            transition:"all .2s",cursor:"pointer",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--sf)";e.currentTarget.style.color="var(--sf)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bdr)";e.currentTarget.style.color="var(--t2)";}}
          >
            {theme==="dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* ── Smart Auth Button (Desktop) ── */}
          <div className="nav-desktop">
            {userName ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "10px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--t2)", letterSpacing: ".05em", textTransform: "uppercase" }}>
                  Hi, <span style={{ color: "var(--sf)" }}>{userName.split(" ")[0]}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: "8px 16px", background: "transparent", border: "1px solid var(--bdr)",
                    borderRadius: "8px", color: "var(--t3)", fontSize: ".72rem", fontWeight: 700,
                    letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", transition: "all .2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--sf)"; e.currentTarget.style.color = "var(--sf)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.color = "var(--t3)"; }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" style={{
                padding:"9px 20px", background:"linear-gradient(135deg,var(--sf),var(--sf-d))",
                color:"#fff", borderRadius:"8px", fontSize:".77rem", fontWeight:700,
                letterSpacing:".1em", textTransform:"uppercase", boxShadow:"var(--glow-sf)", 
                transition:"all .3s", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"6px",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 0 50px rgba(255,107,53,.62)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="var(--glow-sf)";}}
              >
                <Vote size={14} /> Login to Vote
              </Link>
            )}
          </div>

          <button onClick={()=>setMob(o=>!o)} className="nav-ham"
            style={{display:"none",background:"none",border:"none",color:"var(--t1)",cursor:"pointer",padding:"4px"}}>
            {mob ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mob&&(
        <div style={{position:"fixed",top:"70px",left:0,right:0,background:"var(--bgc)",borderBottom:"1px solid var(--bdr)",zIndex:999,padding:"12px 18px",display:"flex",flexDirection:"column",gap:"2px",transition:"background .5s, border-color .5s"}}>
          {LINKS.map(({href,label})=>(
            <Link key={href} href={href} onClick={()=>setMob(false)} style={{
              padding:"13px 16px",fontSize:".84rem",fontWeight:600,
              letterSpacing:".07em",textTransform:"uppercase", color:"var(--t1)",borderRadius:"8px",textDecoration:"none",
            }}>{label}</Link>
          ))}
          
          {/* ── Smart Auth Button (Mobile) ── */}
          {userName ? (
             <button onClick={handleLogout} style={{
              marginTop:"8px",padding:"13px 16px", background:"transparent", border: "1px solid var(--sf)",
              color:"var(--sf)",borderRadius:"8px", cursor: "pointer", fontSize:".84rem",fontWeight:700,
              letterSpacing:".1em",textTransform:"uppercase", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition: "all .2s"
            }}>
              <LogOut size={16} /> Logout ({userName.split(" ")[0]})
            </button>
          ) : (
            <Link href="/login" onClick={()=>setMob(false)} style={{
              marginTop:"8px",padding:"13px 16px", background:"linear-gradient(135deg,var(--sf),var(--sf-d))",
              color:"#fff",borderRadius:"8px",textDecoration:"none", fontSize:".84rem",fontWeight:700,
              letterSpacing:".1em",textTransform:"uppercase", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
            }}>
              <Vote size={16} /> Login to Vote
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:900px){
          .nav-desktop{display:none!important;}
          .nav-ham{display:block!important;}
          nav{padding:0 18px!important;}
        }
      `}</style>
    </>
  );
}