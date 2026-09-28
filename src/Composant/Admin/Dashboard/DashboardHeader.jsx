import React from "react";

/**
 * DashboardHeader — Titre de la page + boutons d'action
 */
export default function DashboardHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 15,
        flexWrap: "wrap",
        gap: 7,
      }}
    >
      <div>
        <h1
          style={{
            fontWeight: 800,
            fontSize: 26,
            color: "#0F172A",
            margin: "0 0 4px",
            letterSpacing: "-0.3px",
          }}
        >
          Dashboard
        </h1>
        {/* <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
          Overview of your COMPULEC website activity.
        </p> */}
      </div>

      {/* <div style={{ display: "flex", gap: 12 }}>
        <button
          style={{
            padding: "10px 22px",
            border: "1.5px solid #CBD5E1",
            borderRadius: 10,
            background: "#fff",
            color: "#334155",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94A3B8")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
        >
          View Message
        </button>

        <button
          style={{
            padding: "10px 22px",
            border: "none",
            borderRadius: 10,
            background: "#023B6A",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 10px rgba(253,224,71,0.5)",
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
            +
          </span>
          Add Project
        </button>
      </div> */}
    </div>
  );
}
