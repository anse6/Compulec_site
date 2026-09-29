import React from "react";
import { useAdminTheme } from "../AdminThemeContext";

export default function DashboardHeader() {
  const isDark = useAdminTheme();
  const textMain = isDark ? "#F8FAFC" : "#0F172A";

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
            color: textMain,
            margin: "0 0 4px",
            letterSpacing: "-0.3px",
          }}
        >
          Dashboard
        </h1>
      </div>
    </div>
  );
}
