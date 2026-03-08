"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// 1. Un-dismissible Success Modal Component
function SuccessModal({ voterId, onContinue }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(voterId);
    setCopied(true);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"popIn 0.3s ease"}}>
      <div style={{background:"var(--bgc)",border:"2px solid var(--sf)",borderRadius:"16px",padding:"40px",maxWidth:"480px",width:"100%",textAlign:"center",boxShadow:"0 0 60px rgba(255,107,53,0.25)"}}>
        <div style={{fontSize:"4.5rem",marginBottom:"10px",animation:"popCheck 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)"}}>🎓</div>
        <h2 style={{fontFamily:"var(--font-s)",fontSize:"2rem",color:"var(--t1)",marginBottom:"10px"}}>Registration Complete!</h2>
        <p style={{color:"var(--t3)",fontSize:"0.95rem",lineHeight:1.6,marginBottom:"24px"}}>
          Your unique Voter ID has been securely generated. <strong style={{color:"var(--sf)"}}>You MUST copy this ID now.</strong> It will not be shown again, and you need it to log in.
        </p>
        
        <div style={{background:"var(--bg2)",padding:"20px",borderRadius:"10px",fontSize:"1.8rem",fontWeight:800,color:"var(--sf)",letterSpacing:"3px",marginBottom:"24px",border:"2px dashed rgba(255,107,53,0.4)"}}>
          {voterId}
        </div>

        <button onClick={handleCopy} style={{background:copied?"var(--gr-l)":"linear-gradient(135deg, var(--sf), var(--sf-d))",color:"#fff",border:"none",padding:"16px",fontSize:"1.05rem",borderRadius:"10px",fontWeight:700,cursor:"pointer",marginBottom:"16px",width:"100%",transition:"all 0.3s",boxShadow:copied?"0 0 20px rgba(46,204,64,0.4)":"0 4px 15px rgba(255,107,53,0.3)"}}>
          {copied ? "✅ ID Copied to Clipboard!" : "📋 Copy My Voter ID"}
        </button>

        <button onClick={onContinue} disabled={!copied} style={{background:"transparent",color:copied?"var(--t1)":"var(--t3)",border:`1.5px solid ${copied?"var(--bdr)":"transparent"}`,padding:"14px",fontSize:"0.95rem",borderRadius:"10px",cursor:copied?"pointer":"not-allowed",width:"100%",transition:"0.3s",opacity:copied?1:0.5}}>
          {copied ? "Proceed to Login →" : "Copy your ID to continue"}
        </button>
      </div>
      <style>{`@keyframes popCheck{0%{transform:scale(0) rotate(-45deg)}80%{transform:scale(1.2) rotate(10deg)}100%{transform:scale(1) rotate(0)}}`}</style>
    </div>
  );
}

// Input Field Component
const Field = ({ label, type = "text", placeholder, maxL, value, onChange }) => (
  <div className="fgrp">
    <label className="flbl">{label}</label>
    <input className="finp" type={type} placeholder={placeholder} maxLength={maxL} value={value} onChange={onChange} />
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName:"", lastName:"", mobile:"", email:"",
    aadhar:"", dob:"", gender:"", password:"", confirmPassword:""
  });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  
  // NEW: State to trigger the success modal
  const [successId, setSuccessId] = useState(null); 

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(""),4000); }

  async function handleRegister(e){
    e.preventDefault();
    if(form.password!==form.confirmPassword){ showToast("❌ Passwords do not match."); return; }
    if(form.password.length<8){ showToast("⚠️ Password must be at least 8 characters."); return; }
    if(!/^\d{10}$/.test(form.mobile)){ showToast("⚠️ Mobile must be exactly 10 digits."); return; }
    if(!/^\d{12}$/.test(form.aadhar)){ showToast("⚠️ Aadhaar must be exactly 12 digits."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });

      const text = await res.text(); 
      try {
        const d = JSON.parse(text);
        if(res.ok){
          // TRIGGER THE UN-DISMISSIBLE MODAL INSTEAD OF TOAST!
          setSuccessId(d.data?.voter_id);
        } else {
          showToast("❌ " + (d.error || "Registration failed."));
        }
      } catch (parseErr) {
        alert("🚨 SERVER CRASH LOG 🚨\n\nStatus Code: " + res.status + "\n\nRaw Response:\n" + text.substring(0, 500));
      }
      
    } catch (networkErr) {
       alert("🚨 NETWORK FATAL ERROR 🚨\n\n" + networkErr.message);
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Navbar/>
      
      {/* 🚨 Show the modal if registration is successful 🚨 */}
      {successId && (
        <SuccessModal 
          voterId={successId} 
          onContinue={() => router.push("/login")} 
        />
      )}

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"80px 40px"}} className="page-wrap">
        <div className="eye" style={{textAlign:"center"}}>New Voter Registration</div>
        <h1 style={{fontFamily:"var(--font-s)",fontSize:"clamp(2rem,4vw,3rem)",fontWeight:300,color:"var(--t1)",textAlign:"center",marginBottom:"8px"}}>
          Register to Vote
        </h1>
        <p style={{fontSize:".84rem",color:"var(--t3)",textAlign:"center",marginBottom:"48px"}}>
          Only enrolled students of Vidyalankar Institute are eligible. Duplicates are strictly prevented.
        </p>

        <div style={{
          background:"var(--bgc)",border:"1px solid var(--bdr)",
          borderRadius:"16px",padding:"48px",
          position:"relative",overflow:"hidden",
          boxShadow:"inset 0 0 60px rgba(255,107,53,.03)",
        }}>
          <div style={{position:"absolute",top:"-80px",right:"-80px",width:"260px",height:"260px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,53,.11) 0%,transparent 68%)",pointerEvents:"none",animation:"placeGlow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-80px",left:"-80px",width:"240px",height:"240px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,71,171,.1) 0%,transparent 68%)",pointerEvents:"none",animation:"placeGlow 5s ease-in-out infinite"}}/>

          <div className="tri-bar" style={{marginBottom:"40px"}}><div className="t1"/><div className="t2"/><div className="t3"/></div>

          <form onSubmit={handleRegister}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 28px"}} className="reg-grid">
              <Field label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="e.g. Aditya"/>
              <Field label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="e.g. Rane"/>
              <Field label="Mobile Number" value={form.mobile} onChange={set("mobile")} placeholder="10-digit mobile" maxL={10}/>
              <Field label="Email Address" value={form.email} onChange={set("email")} type="email" placeholder="student@vit.edu"/>
              <Field label="Aadhaar Number" value={form.aadhar} onChange={set("aadhar")} placeholder="12-digit Aadhaar" maxL={12}/>
              <Field label="Date of Birth" value={form.dob} onChange={set("dob")} type="date"/>
              
              <div className="fgrp">
                <label className="flbl">Gender</label>
                <select className="finp" value={form.gender} onChange={set("gender")} style={{cursor:"pointer"}}>
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div/>
              
              <Field label="Password (min 8 chars)" value={form.password} onChange={set("password")} type="password" placeholder="••••••••"/>
              <Field label="Confirm Password" value={form.confirmPassword} onChange={set("confirmPassword")} type="password" placeholder="••••••••"/>
            </div>

            <button type="submit" disabled={loading} className="btn-p" style={{width:"100%",justifyContent:"center",padding:"15px",fontSize:".9rem",marginTop:"20px",opacity:loading ? 0.6 : 1}}>
              {loading ? "⏳ Verifying & Registering…" : "🗳️ Register as Voter →"}
            </button>
          </form>
        </div>
      </div>

      {toast&&(
        <div style={{position:"fixed",bottom:"28px",right:"28px",zIndex:5000,background:"var(--bgc)",border:"1px solid var(--bdr)",borderLeft:"3px solid var(--sf)",borderRadius:"10px",padding:"14px 22px",boxShadow:"var(--sh)",display:"flex",alignItems:"center",gap:"10px",fontSize:".86rem",color:"var(--t1)",backdropFilter:"blur(20px)",animation:"popIn .3s ease"}}>
          {toast}
        </div>
      )}

      <Footer/>
      <style>{`
        @media(max-width:640px){ .reg-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}