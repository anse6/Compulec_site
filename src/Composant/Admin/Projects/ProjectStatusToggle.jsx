import React, { useState } from "react";
import { Tag, Popconfirm } from "antd";
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

export const PROJECT_STATUS_CONFIG = {
  Planned: {
    bg: "#eff6ff",
    text: "#2563eb",
    border: "#bfdbfe",
    label: "Planned",
    icon: <ClockCircleOutlined />,
    next: "In progress",
  },
  "In progress": {
    bg: "#f0fdf4",
    text: "#16a34a",
    border: "#bbf7d0",
    label: "In Progress",
    icon: <SyncOutlined spin />,
    next: "Completed",
  },
  Completed: {
    bg: "#f0fdf4",
    text: "#16a34a",
    border: "#bbf7d0",
    label: "Completed",
    icon: <CheckCircleOutlined />,
    next: "On Hold",
  },
  "On Hold": {
    bg: "#fef2f2",
    text: "#dc2626",
    border: "#fecaca",
    label: "On Hold",
    icon: <PauseCircleOutlined />,
    next: "Planned",
  },
};

export default function ProjectStatusToggle({
  initialStatus = "Planned",
  onChange,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  // Normalize status case just in case
  const normalizedStatus =
    Object.keys(PROJECT_STATUS_CONFIG).find(
      (k) => k.toLowerCase() === status.toLowerCase(),
    ) || "Planned";

  const cfg =
    PROJECT_STATUS_CONFIG[normalizedStatus] || PROJECT_STATUS_CONFIG["Planned"];
  const nextCfg =
    PROJECT_STATUS_CONFIG[cfg.next] || PROJECT_STATUS_CONFIG["Planned"];

  const handleConfirm = (e) => {
    e.stopPropagation();
    setLoading(true);
    setTimeout(() => {
      setStatus(cfg.next);
      setLoading(false);
      if (onChange) onChange(cfg.next);
    }, 600);
  };

  const tag = (
    <Tag
      icon={loading ? <LoadingOutlined spin /> : cfg.icon}
      style={{
        cursor: "pointer",
        borderRadius: 999,
        padding: "2px 10px",
        fontWeight: 600,
        userSelect: "none",
        margin: 0,
        fontSize: 11,
        backgroundColor: loading ? "#f8fafc" : cfg.bg,
        color: loading ? "#94a3b8" : cfg.text,
        borderColor: loading ? "#e2e8f0" : cfg.border,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {loading ? "Updating…" : cfg.label}
    </Tag>
  );

  if (loading) return tag;

  return (
    <Popconfirm
      title={
        <span className="font-semibold text-[13px]">
          Change project status?
        </span>
      }
      description={
        <span className="text-[12px] text-slate-500">
          Mark as <strong>{nextCfg.label}</strong> ?
        </span>
      }
      onConfirm={handleConfirm}
      onCancel={(e) => e.stopPropagation()}
      okText={`→ ${nextCfg.label}`}
      cancelText="Cancel"
      placement="top"
      okButtonProps={{
        style: { background: "#023B6A", borderColor: "#023B6A" },
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{tag}</div>
    </Popconfirm>
  );
}
