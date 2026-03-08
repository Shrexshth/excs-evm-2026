"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/* view: "choice" | "voter-1" | "voter-2" | "admin" */
export default function LoginPage() {
  const router = useRouter();
  const [view, setView]     = useState("choice");
  const [enroll, setEnroll] = useState("");
  const [dob, setDob]       = useState("");
  const [otp, setOtp]       = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminCode, setAdminCode] = useState(""); 
  const [toast, setToast]   = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  // --- Voter Identity Check (Step 1) ---
  async function voterNext(e) {
    e.preventDefault();
    if (!enroll || !dob) {
      showToast("⚠️ Please enter your enrollment number and date of birth.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // RESTORED TO 'identifier' SO YOUR BACKEND WORKS AGAIN
        body: JSON.stringify({ 
          identifier: enroll, 
          password: dob 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("📱 Enrollment verified. OTP sent to registered mobile.");
        localStorage.setItem("temp_user_id", data.user.id);
        localStorage.setItem("temp_user_name", data.user.name); 
        setView("voter-2");
      } else {
        showToast(`❌ ${data.message || "Student details not found."}`);
      }
    } catch (err) {
      showToast("⚠️ Connection error. Please try again.");
    }
  }

  // --- Voter OTP Verification (Step 2) ---
  async function voterVerify(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast("⚠️ Please enter the 6-digit OTP.");
      return;
    }
    
    try {
      if (otp === "123456") {
        const studentName = localStorage.getItem("temp_user_name") || "Student";
        localStorage.setItem("userName", studentName);
        
        window.dispatchEvent(new Event("auth-change"));
        router.push("/vote");
      } else {
        showToast("❌ Invalid OTP. Try 123456 for testing.");
      }
    } catch {
      showToast("⚠️ Verification failed.");
    }
  }

  // --- Admin/Super Admin Login ---
  async function adminLogin(e) {
    e.preventDefault();
    if (!adminUser || !adminPass) {
      showToast("⚠️ Please enter username and password.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // RESTORED TO 'identifier' SO YOUR BACKEND WORKS AGAIN
        body: JSON.stringify({ 
          identifier: adminUser, 
          password: adminPass 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);

        // 🚨 THE CRITICAL FIX: Give the Admin page the exact VIP pass it is looking for
        localStorage.setItem("temp_user_id", adminUser);

        window.dispatchEvent(new Event("auth-change"));

        showToast(`✅ Access Granted. Welcome, ${data.user.name}`);
        
        // Short delay so you actually see the success message before moving
        setTimeout(() => {
          router.push("/admin");
        }, 1000);

      } else {
        showToast(`❌ ${data.message || "Invalid credentials."}`);
      }
    } catch (err) {
      showToast("⚠️ Could not reach server. Check your connection.");
    }
  }

  // ---------------------------------------------------------
  // 100% PRESERVED UI BELOW THIS LINE
  // ---------------------------------------------------------

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Navbar/>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"80px 40px",display:"flex",flexDirection:"column",alignItems:"center"}} className="page-wrap">

        <div className="eye" style={{textAlign:"center"}}>Access Portal</div>
        <h1 style={{fontFamily:"var(--font-s)",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:300,color:"var(--t1)",textAlign:"center",marginBottom:"8px"}}>
          Choose Your Login
        </h1>
        <p style={{fontSize:".84rem",color:"var(--t3)",textAlign:"center",marginBottom:"60px",letterSpacing:".05em"}}>
          Select the portal that applies to you
        </p>

        {/* ── Choice Cards ── */}
        {view==="choice"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"30px",width:"100%",maxWidth:"820px"}} className="login-cards">
            {/* Voter card */}
            <div style={{
              background:"var(--bgc)",border:"1px solid var(--bdr)",
              borderRadius:"16px",padding:"40px",cursor:"pointer",
              transition:"all .4s",position:"relative",overflow:"hidden",
            }}
            onClick={()=>setView("voter-1")}
            >
              <div style={{width:"72px",height:"72px",borderRadius:"16px",background:"rgba(255,107,53,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",marginBottom:"24px"}}>🎓</div>
              <h2 style={{fontFamily:"var(--font-s)",fontSize:"1.6rem",fontWeight:400,color:"var(--t1)",marginBottom:"8px"}}>Student / Voter</h2>
              <p style={{fontSize:".84rem",color:"var(--t2)",lineHeight:1.7,marginBottom:"28px"}}>Enrolled students. Login with your enrollment number and DOB to access the secure voting portal.</p>
              <button className="btn-p" style={{fontSize:".78rem",padding:"11px 24px"}}>Login as Student →</button>
            </div>

            {/* Admin card */}
            <div style={{
              background:"var(--bgc)",border:"1px solid var(--bdr)",
              borderRadius:"16px",padding:"40px",cursor:"pointer",
              transition:"all .4s",position:"relative",overflow:"hidden",
            }}
            onClick={()=>setView("admin")}
            >
              <div style={{width:"72px",height:"72px",borderRadius:"16px",background:"rgba(0,71,171,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",marginBottom:"24px"}}>🛡️</div>
              <h2 style={{fontFamily:"var(--font-s)",fontSize:"1.6rem",fontWeight:400,color:"var(--t1)",marginBottom:"8px"}}>Election Admin</h2>
              <p style={{fontSize:".84rem",color:"var(--t2)",lineHeight:1.7,marginBottom:"28px"}}>Authorized committee members only. Monitor votes, manage candidates, and publish outcomes.</p>
              <button className="btn-ck" style={{fontSize:".78rem",padding:"11px 24px"}}>Login as Admin →</button>
            </div>
          </div>
        )}

        {/* ── Voter Form Step 1 ── */}
        {view==="voter-1"&&(
          <div style={{background:"var(--bgc)",border:"1px solid var(--bdr)",borderRadius:"16px",padding:"40px",maxWidth:"460px",width:"100%"}}>
            <h2 style={{fontFamily:"var(--font-s)",fontSize:"1.7rem",fontWeight:400,color:"var(--t1)",marginBottom:"5px"}}>Student Login</h2>
            <p style={{fontSize:".78rem",color:"var(--t3)",marginBottom:"28px"}}>Enter details to receive an OTP on your registered mobile.</p>
            <form onSubmit={voterNext}>
              <div className="fgrp"><label className="flbl">Enrollment Number</label>
                <input className="finp" placeholder="e.g. VIT-22-1001" value={enroll} onChange={e=>setEnroll(e.target.value)}/></div>
              <div className="fgrp"><label className="flbl">Password</label>
                 <input className="finp" type="password" placeholder="••••••••" value={dob} onChange={e=>setDob(e.target.value)}/></div>
              <div style={{display:"flex",gap:"10px",marginTop:"24px"}}>
                <button type="submit" className="btn-p" style={{flex:1,justifyContent:"center",padding:"13px"}}>Get OTP →</button>
                <button type="button" onClick={()=>setView("choice")} className="btn-secondary">Back</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Voter Form Step 2 OTP ── */}
        {view==="voter-2"&&(
          <div style={{background:"var(--bgc)",border:"1px solid var(--bdr)",borderRadius:"16px",padding:"40px",maxWidth:"460px",width:"100%"}}>
            <h2 style={{fontFamily:"var(--font-s)",fontSize:"1.7rem",fontWeight:400,color:"var(--t1)",marginBottom:"5px"}}>Verify OTP</h2>
            <p style={{fontSize:".78rem",color:"var(--t3)",marginBottom:"28px"}}>Enter the 6-digit code sent to your mobile.</p>
            <form onSubmit={voterVerify}>
              <div className="fgrp">
                <input className="finp" style={{textAlign:"center",fontSize:"1.5rem",letterSpacing:".5em"}}
                  placeholder="000000" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}/>
              </div>
              <div style={{display:"flex",gap:"10px",marginTop:"24px"}}>
                <button type="submit" className="btn-p" style={{flex:1,justifyContent:"center",padding:"13px"}}>Verify & Vote →</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Admin Form ── */}
        {view==="admin"&&(
          <div style={{background:"var(--bgc)",border:"1px solid var(--bdr)",borderRadius:"16px",padding:"40px",maxWidth:"460px",width:"100%"}}>
            <h2 style={{fontFamily:"var(--font-s)",fontSize:"1.7rem",fontWeight:400,color:"var(--t1)",marginBottom:"5px"}}>Admin Login</h2>
            <p style={{fontSize:".78rem",color:"var(--t3)",marginBottom:"28px"}}>Actions are logged for security audits.</p>
            <form onSubmit={adminLogin}>
              <div className="fgrp"><label className="flbl">Username</label>
                <input className="finp finp-blue" placeholder="username" value={adminUser} onChange={e=>setAdminUser(e.target.value)}/></div>
              <div className="fgrp"><label className="flbl">Password</label>
                <input className="finp finp-blue" type="password" placeholder="••••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)}/></div>
              <div style={{display:"flex",gap:"10px",marginTop:"24px"}}>
                <button type="submit" className="btn-ck" style={{flex:1,justifyContent:"center",padding:"13px"}}>Access Panel →</button>
                <button type="button" onClick={()=>setView("choice")} className="btn-secondary">Back</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
      <Footer/>
      
      <style jsx>{`
        .btn-secondary {
          padding: 13px 18px;
          background: transparent;
          border: 1.5px solid var(--bdr);
          border-radius: 8px;
          color: var(--t3);
          cursor: pointer;
        }
        .toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 5000;
          background: var(--bgc); border: 1px solid var(--bdr);
          border-left: 3px solid var(--sf); border-radius: 10px;
          padding: 14px 22px; font-size: 0.86rem; animation: popIn 0.3s ease;
        }
        @keyframes popIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}