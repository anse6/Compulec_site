import React from "react";
import { useAdminTheme } from "../AdminThemeContext";

export default function StatCard({
  title,
  value,
  icon,
  iconBg = "#EDE9FE",
  iconColor = "#7C3AED",
  cardBg = "#F1EEFC",
  cardBorder = "#C4B5FD",
  textColor = "#5B21B6",
  subtitle,
  footer,
  onClick,
}) {
  const isDark = useAdminTheme();
  const innerBg = isDark ? "#1E293B" : "#FFFFFF";
  const innerBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const titleColor = isDark ? "#94A3B8" : "#8392A5";
  const valueColor = isDark ? "#F8FAFC" : "#023B6A";

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        border: `1.5px dashed ${cardBorder}`,
        borderRadius: 16,
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.09)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      {/* Inner box */}
      <div
        style={{
          backgroundColor: innerBg,
          borderRadius: 12,
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          border: `1px solid ${innerBorder}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: titleColor,
              margin: "0 0 8px 0",
            }}
          >
            {title}
          </p>
          <h3
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: valueColor,
              margin: 0,
              lineHeight: 1,
            }}
          >
            {value}
          </h3>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: iconColor,
            fontSize: 18,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 8px 8px 8px",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: 12, color: textColor, opacity: 0.85, margin: 0, fontWeight: 500 }}>
            {subtitle}
          </p>
          {footer && (
            <p style={{ fontSize: 12, fontWeight: 700, color: textColor, margin: "4px 0 0" }}>
              {footer}
            </p>
          )}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ flexShrink: 0, marginTop: footer ? "auto" : 0, marginBottom: footer ? 4 : 0 }}
        >
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke={textColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
