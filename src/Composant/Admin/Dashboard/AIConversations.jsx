import React, { useState } from 'react';
import { Tag, Popconfirm, Button, Skeleton } from 'antd';
import { EyeOutlined, UserSwitchOutlined, SearchOutlined, CheckCircleOutlined, WarningOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardAiSessionsQuery } from '../../../services/api/dashboardApi';

// --- Transfer Status Toggle ---
const TRANSFER_STATUS_CONFIG = {
  'WAITING_ADMIN': { color: 'gold',  label: 'Waiting',     icon: <UserSwitchOutlined />,   next: 'IN_REVIEW'   },
  'WITH_ADMIN':    { color: 'blue',  label: 'With Admin',  icon: <SearchOutlined />,        next: 'CLOSED'      },
  'ACTIVE':        { color: 'green', label: 'Active',       icon: <CheckCircleOutlined />,   next: 'WAITING_ADMIN'},
  'CLOSED':        { color: 'default', label: 'Closed',    icon: <CheckCircleOutlined />,   next: 'WAITING_ADMIN'},
  'IN_REVIEW':     { color: 'blue',  label: 'In Review',   icon: <SearchOutlined />,        next: 'CLOSED'      },
};

function TransferStatusTag({ status }) {
  const cfg = TRANSFER_STATUS_CONFIG[status] || { color: 'default', label: status, icon: <WarningOutlined /> };
  return (
    <Tag
      icon={cfg.icon}
      color={cfg.color}
      style={{ borderRadius: 999, padding: '2px 10px', fontWeight: 600, margin: 0, fontSize: 11 }}
    >
      {cfg.label}
    </Tag>
  );
}

// --- Date formatter ---
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffH = (now - d) / (1000 * 60 * 60);
  if (diffH < 24) return 'Today, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Yesterday';
  return d.toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' });
}

// --- Session token formatter (show short token for readability) ---
function shortToken(token) {
  if (!token) return '—';
  return '#' + token.substring(0, 8).toUpperCase();
}

// --- Component ---
export default function AIConversations() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetDashboardAiSessionsQuery(8);
  const sessions = data?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', padding: 24 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1px solid #EEF2F7',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #EEF2F7',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', margin: '0 0 4px' }}>
            AI Conversations Requiring Attention
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Conversations transferred to the COMPULEC team
          </p>
        </div>
        <a
          onClick={() => navigate('/admin/aichat')}
          style={{ fontSize: 13, fontWeight: 700, color: '#023B6A', textDecoration: 'none', cursor: 'pointer' }}
        >
          Open AI Chat
        </a>
      </div>

      {/* Table */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
          No active or transferred sessions at the moment.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={thStyle}>SESSION</th>
                <th style={thStyle}>VISITOR</th>
                <th style={thStyle}>EMAIL</th>
                <th style={thStyle}>DATE</th>
                <th style={thStyle}>STATUS</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: idx !== sessions.length - 1 ? '1px solid #EEF2F7' : 'none' }}
                >
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#023B6A' }}>
                    {shortToken(row.sessionToken)}
                  </td>
                  <td style={{ ...tdStyle, color: '#023B6A', fontWeight: 600 }}>
                    {row.visitorName || '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#64748B' }}>
                    {row.visitorEmail || '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#64748B' }}>
                    {formatDate(row.createdAt)}
                  </td>
                  <td style={tdStyle}>
                    <TransferStatusTag status={row.status} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <Button
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => navigate('/admin/aichat')}
                      style={{ borderRadius: 8, fontWeight: 600, fontSize: 12 }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '16px 24px',
  fontSize: 11,
  fontWeight: 600,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #EEF2F7',
};
const tdStyle = { padding: '16px 24px', fontSize: 13, verticalAlign: 'middle' };
