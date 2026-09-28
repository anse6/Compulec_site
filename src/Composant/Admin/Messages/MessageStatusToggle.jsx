import React, { useState } from 'react';
import { Tag, Popconfirm } from 'antd';
import { StarOutlined, SyncOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';

export const STATUS_CONFIG = {
  'NEW':         { color: 'gold',    label: 'New',         icon: <StarOutlined />,          next: 'In Progress' },
  'In Progress': { color: 'green',   label: 'In Progress', icon: <SyncOutlined spin />,     next: 'Completed'   },
  'Completed':   { color: 'purple',  label: 'Completed',   icon: <CheckCircleOutlined />,   next: 'NEW'          },
};

export default function MessageStatusToggle({ initialStatus = 'NEW', onChange }) {
  const [status,  setStatus]  = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const cfg     = STATUS_CONFIG[status] || STATUS_CONFIG['NEW'];
  const nextCfg = STATUS_CONFIG[cfg.next] || STATUS_CONFIG['NEW'];

  const handleConfirm = () => {
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
      color={loading ? 'processing' : cfg.color}
      style={{ cursor: 'pointer', borderRadius: 999, padding: '2px 10px', fontWeight: 600, userSelect: 'none', margin: 0 }}
    >
      {loading ? 'Updating…' : cfg.label}
    </Tag>
  );

  if (loading) return tag;

  return (
    <Popconfirm
      title={<span className="font-semibold text-[13px]">Change status?</span>}
      description={
        <span className="text-[12px] text-slate-500">
          Mark as <strong>{nextCfg.label}</strong> ?
        </span>
      }
      onConfirm={handleConfirm}
      okText={`→ ${nextCfg.label}`}
      cancelText="Cancel"
      placement="top"
      okButtonProps={{ style: { background: '#023B6A', borderColor: '#023B6A' } }}
    >
      {tag}
    </Popconfirm>
  );
}
