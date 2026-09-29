import React from 'react';
import { Skeleton } from 'antd';
import { useAdminTheme } from '../AdminThemeContext';
import AvatarWithPopover from '../Users/AvatarWithPopover';
import MessageStatusToggle from '../Messages/MessageStatusToggle';
import { useGetDashboardRecentMessagesQuery } from '../../../services/api/dashboardApi';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffH = (now - d) / (1000 * 60 * 60);
  if (diffH < 24) return 'Today, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Yesterday, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReviewEnquiries() {
  const isDark = useAdminTheme();
  const bgCard  = isDark ? '#1E293B' : '#fff';
  const border  = isDark ? '#334155' : '#EEF2F7';
  const textMain = isDark ? '#F8FAFC' : '#0F172A';
  const textSub  = isDark ? '#94A3B8' : '#64748B';
  const primary  = isDark ? '#38bdf8' : '#023B6A';
  const nameColor = isDark ? '#38bdf8' : '#023B6A';

  const { data, isLoading } = useGetDashboardRecentMessagesQuery(6);
  const messages = data?.data ?? [];

  const [localMessages, setLocalMessages] = React.useState([]);

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
    setLocalMessages((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  if (isLoading) {
    return (
      <div style={{ background: bgCard, borderRadius: 18, border: `1px solid ${border}`, padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: bgCard,
        borderRadius: 18,
        border: `1px solid ${border}`,
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
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: textMain, margin: '0 0 4px' }}>
            Review Enquiries
          </h3>
          <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
            Most recent enquiries from the website contact form
          </p>
        </div>
        <a
          href="/admin/messages"
          style={{ fontSize: 13, fontWeight: 700, color: primary, textDecoration: 'none', cursor: 'pointer' }}
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
                borderBottom: index !== localMessages.length - 1 ? `1px solid ${border}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <AvatarWithPopover name={item.name} email={item.email} size={40} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: nameColor, margin: '0 0 2px' }}>
                    {item.name}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: textSub,
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: textSub, fontWeight: 500 }}>{item.date}</span>
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
