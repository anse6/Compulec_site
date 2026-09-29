import React from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { useNavigate } from "react-router-dom";
import {
  IconNewProject,
  IconUploadImages,
  IconReviewEnquiries,
} from "../component/AdminIcons";

function ArrowRight({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACTIONS = [
  { label: "New Project",    desc: "Publish a case study",  Icon: IconNewProject,      path: "/admin/projects" },
  { label: "Upload Images",  desc: "Add to the gallery",    Icon: IconUploadImages,    path: "/admin/gallery" },
  { label: "Publish News",   desc: "Write a new article",   Icon: IconReviewEnquiries, path: "/admin/news" },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const isDark = useAdminTheme();
  const bgCard   = isDark ? "#1E293B" : "#ffffff";
  const border   = isDark ? "#334155" : "#EEF2F7";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub  = isDark ? "#94A3B8" : "#94A3B8";

  return (
    <div
      style={{
        background: bgCard,
        borderRadius: 18,
        padding: "22px 22px",
        border: `1px solid ${border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ fontWeight: 800, fontSize: 17, color: textMain, margin: "0 0 20px" }}>
        Quick actions
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" }}>
        {ACTIONS.map(({ label, desc, Icon, path }) => (
          <ActionRow
            key={label}
            label={label}
            desc={desc}
            Icon={Icon}
            isDark={isDark}
            bgCard={bgCard}
            border={border}
            textMain={textMain}
            textSub={textSub}
            onClick={() => navigate(path)}
          />
        ))}
      </div>
    </div>
  );
}

function ActionRow({ label, desc, Icon, onClick, isDark, bgCard, border, textMain, textSub }) {
  const [hovered, setHovered] = React.useState(false);
  const hoverBorder = isDark ? "#6366F1" : "#C7D2FE";
  const hoverBg     = isDark ? "#0F172A" : bgCard;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: 12,
        border: `1.5px solid ${hovered ? hoverBorder : border}`,
        backgroundColor: hovered ? hoverBg : bgCard,
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: hovered ? "0 2px 10px rgba(108,92,231,0.10)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            background: isDark ? "#38bdf8" : "#1E3A8A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} color="#fff" />
        </div>

        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: textMain, margin: "0 0 2px" }}>
            {label}
          </p>
          <p style={{ fontSize: 11, color: textSub, margin: 0 }}>{desc}</p>
        </div>
      </div>

      <ArrowRight color={isDark ? "#475569" : "#CBD5E1"} />
    </div>
  );
}
