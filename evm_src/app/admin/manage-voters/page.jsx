"use client";

export default function ManageVoters() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", color: "var(--t1)", fontFamily: "var(--font-s)" }}>Voter Database</h1>
            <p style={{ color: "var(--t3)" }}>Oversee the student enrollment list and voting status.</p>
          </div>
          <button style={{ padding: "12px 24px", background: "transparent", color: "var(--t1)", border: "1px solid var(--bdr)", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Import CSV List
          </button>
        </div>

        <div style={{ background: "var(--bgc)", border: "1px solid var(--bdr)", borderRadius: "12px", padding: "20px" }}>
           <input 
              type="text" 
              placeholder="Search by Enrollment Number..." 
              style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", border: "1px solid var(--bdr)", background: "var(--bg2)", color: "var(--t1)" }}
            />
          <p style={{ color: "var(--t3)", textAlign: "center", padding: "20px 0" }}>
            Database connection established. Loading registry...
          </p>
        </div>

      </div>
    </div>
  );
}