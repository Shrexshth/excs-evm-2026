"use client";


export default function ManageCandidates() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", color: "var(--t1)", fontFamily: "var(--font-s)" }}>Manage Candidates</h1>
            <p style={{ color: "var(--t3)" }}>Add, edit, or remove students from the election ballot.</p>
          </div>
          <button style={{ padding: "12px 24px", background: "var(--sf)", color: "white", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            + Add New Candidate
          </button>
        </div>

        <div style={{ background: "var(--bgc)", border: "1px solid var(--bdr)", borderRadius: "12px", padding: "20px" }}>
          <p style={{ color: "var(--t3)", textAlign: "center", padding: "40px 0" }}>
            No candidates registered yet. Click "Add New Candidate" to start.
          </p>
          {/* We will map the real database candidates here next! */}
        </div>

      </div>
    </div>
  );
}