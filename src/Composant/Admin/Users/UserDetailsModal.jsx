import React, { useState, useEffect } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { Modal, Avatar, Button, Descriptions, Divider } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import StatusToggle from './StatusToggle';

const COLORS = ['#023B6A','#0E7490','#7C3AED','#B45309','#059669','#C026D3','#DC2626','#EA580C'];
function getColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function getInitials(name = '') {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? (p[0][0] || '?').toUpperCase() : (p[0][0] + p[p.length-1][0]).toUpperCase();
}

export default function UserDetailsModal({ isOpen, onClose, user }) {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  if (!user) return null;

  const color    = getColor(user.name);
  const initials = getInitials(user.name);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
      title={
        <div className="flex items-center gap-3 py-1">
          <Avatar size={42} style={{ background: color, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {initials}
          </Avatar>
          <div>
            <p className="text-[18px] font-bold  m-0 leading-tight" style={{ color: primary }}>User Details</p>
            <p className="text-[12px] text-slate-400 m-0">Administrator account information</p>
          </div>
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }, content: { borderRadius: 16 } }}
    >
      {/* Large Avatar + Name block */}
      <div
        className="flex flex-col items-center gap-3 py-6 rounded-xl mt-4 mb-5"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, border: `1px solid ${color}22` }}
      >
        <Avatar
          size={72}
          style={{ background: color, fontWeight: 800, fontSize: 26, boxShadow: `0 6px 20px ${color}44` }}
        >
          {initials}
        </Avatar>
        <div className="text-center">
          <p className="text-[17px] font-bold text-slate-800 m-0">{user.name}</p>
          <a
            href={`mailto:${user.email}`}
            className="text-[13px]  hover:underline font-medium flex items-center gap-1.5 justify-center mt-1" style={{ color: primary }}
          >
            <MailOutlined /> {user.email}
          </a>
        </div>
      </div>

      {/* Descriptions */}
      <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, color: primary, fontSize: 13, width: 130 }} contentStyle={{ fontSize: 13 }}>
        <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
        <Descriptions.Item label="Last Activity">{user.received}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusToggle initialStatus={user.status} />
        </Descriptions.Item>
      </Descriptions>

      <Divider className="my-4" />

      <div className="flex justify-end">
        <Button size="large" onClick={onClose} className="rounded-lg px-8">Close</Button>
      </div>
    </Modal>
  );
}
