import React from 'react';
import { Skeleton } from 'antd';
import AvatarWithPopover from '../Users/AvatarWithPopover';
import MessageStatusToggle from '../Messages/MessageStatusToggle';
import { useGetDashboardRecentMessagesQuery } from '../../../services/api/dashboardApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffH = diffMs / (1000 * 60 * 60);

  if (diffH < 24) {
    return 'Today, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffH < 48) {
    return 'Yesterday, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewEnquiries() {
  const { data, isLoading } = useGetDashboardRecentMessagesQuery(6);
  const messages = data?.data ?? [];

  const [localMessages, setLocalMessages] = React.useState([]);

  // Sync local state when real data arrives (pour le toggle de statut local)
  React.useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(
        messages.map((m) => ({
          id: m.id,
          name: m.nom,
          email: m.email,
          subject: m.objet,
          date: formatDate(m.createdAt),
          status: m.lu ? 'Completed' : 'NEW',
        }))
      );
    }
  }, [data]);

  const handleStatusChange = (id, newStatus) => {
    setLocalMessages((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
  };

  if (isLoading) {
    return (
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
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
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '24px',
          borderBottom: '1px solid #EEF2F7',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', margin: '0 0 4px' }}>
            Review Enquiries
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Most recent enquiries from the website contact form
          </p>
        </div>
        <a
          href="/admin/messages"
          style={{ fontSize: 13, fontWeight: 700, color: '#023B6A', textDecoration: 'none', cursor: 'pointer' }}
        >
          View all messages
        </a>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {localMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
            No messages yet.
          </div>
        ) : (
          localMessages.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                borderBottom: index !== localMessages.length - 1 ? '1px solid #EEF2F7' : 'none',
              }}
            >
              {/* Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <AvatarWithPopover name={item.name} email={item.email} size={40} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#023B6A', margin: '0 0 2px' }}>
                    {item.name}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#94A3B8',
                      margin: 0,
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.subject}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{item.date}</span>
                <MessageStatusToggle
                  initialStatus={item.status}
                  onChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
