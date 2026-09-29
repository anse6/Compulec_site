import React from 'react';
import { Avatar, Popover, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';

// Palette de couleurs stable par utilisateur
const COLORS = [
  '#023B6A', '#0E7490', '#7C3AED',
  '#B45309', '#059669', '#C026D3',
  '#DC2626', '#EA580C',
];

function getColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AvatarWithPopover({ name, email, size = 36 }) {
  const color    = getColor(name);
  const initials = getInitials(name);

  const popoverContent = (
    <div style={{ width: 220 }}>
      {/* Header */}
      <div
        style={{ backgroundColor: color, borderRadius: '12px 12px 0 0', margin: '-12px -16px 0 -16px', padding: '16px' }}
        className="flex items-center gap-3"
      >
        {/* Mini avatar inversé : fond blanc, texte coloré */}
        <Avatar
          size={44}
          style={{ backgroundColor: '#ffffff', color: color, fontWeight: 700, fontSize: 16, flexShrink: 0 }}
        >
          {initials}
        </Avatar>
        <div className="overflow-hidden">
          <p className="text-white font-bold text-[14px] m-0 truncate">{name}</p>
          <p className="text-white/70 text-[11px] m-0 truncate">{email}</p>
        </div>
      </div>

      {/* Body */}
      <div className="pt-3 flex flex-col gap-2">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider m-0">Adresse email</p>
        <a
          href={`mailto:${email}`}
          className="text-[13px] font-semibold text-[#023B6A] hover:underline break-all"
        >
          {email}
        </a>
        <Button
          type="primary"
          icon={<MailOutlined />}
          size="small"
          href={`mailto:${email}`}
          style={{ background: color, borderColor: color, marginTop: 4 }}
          block
        >
          Envoyer un email
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="hover"
      placement="bottom"
      styles={{ body: { padding: '12px 16px 14px', borderRadius: 14 } }}
      overlayStyle={{ minWidth: 240 }}
      mouseEnterDelay={0.1}
      mouseLeaveDelay={0.15}
    >
      <Avatar
        size={size}
        style={{
          backgroundColor: color,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: size * 0.38,
          cursor: 'default',
          transition: 'transform 0.15s',
          flexShrink: 0,
        }}
        className="hover:scale-110"
      >
        {initials}
      </Avatar>
    </Popover>
  );
}
