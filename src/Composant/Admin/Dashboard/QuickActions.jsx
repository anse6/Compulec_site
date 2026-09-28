import React from "react";
import { useNavigate } from "react-router-dom";
import {
  IconNewProject,
  IconUploadImages,
  IconReviewEnquiries,
} from "../component/AdminIcons";

/**
 * QuickActions — Panneau des actions rapides
 */

// Icône flèche droite
function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACTIONS = [
  {
    label: "New Project",
    desc: "Publish a case study",
    Icon: IconNewProject,
    path: "/admin/projects",
  },
  {
    label: "Upload Images",
    desc: "Add to the gallery",
    Icon: IconUploadImages,
    path: "/admin/gallery",
  },
  {
    label: "Publish News",
    desc: "Write a new article",
    Icon: IconReviewEnquiries, // Using a generic icon or the existing one
    path: "/admin/news",
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: "22px 22px",
        border: "1px solid #EEF2F7",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          fontWeight: 800,
          fontSize: 17,
          color: "#0F172A",
          margin: "0 0 20px",
        }}
      >
        Quick actions
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {ACTIONS.map(({ label, desc, Icon, path }) => (
          <ActionRow
            key={label}
            label={label}
            desc={desc}
            Icon={Icon}
            onClick={() => navigate(path)}
          />
        ))}
      </div>
    </div>
  );
}

function ActionRow({ label, desc, Icon, onClick }) {
  const [hovered, setHovered] = React.useState(false);

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
        border: `1.5px solid ${hovered ? "#C7D2FE" : "#EEF2F7"}`,
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: hovered ? "0 2px 10px rgba(108,92,231,0.10)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Icône dans un carré bleu marine */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            background: "#1E3A8A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} color="#fff" />
        </div>

        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "#0F172A",
              margin: "0 0 2px",
            }}
          >
            {label}
          </p>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{desc}</p>
        </div>
      </div>

      <ArrowRight />
    </div>
  );
}
