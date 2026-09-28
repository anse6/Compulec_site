import React from 'react';
import { Skeleton } from 'antd';
import { useGetDashboardRecentActivityQuery } from '../../../services/api/dashboardApi';

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconActivityProject = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H13.236C12.8645 6.99999 12.5004 6.89651 12.1844 6.70116C11.8684 6.50581 11.6131 6.22631 11.447 5.894L10.553 4.106C10.3869 3.77353 10.1314 3.49394 9.8152 3.29858C9.49902 3.10322 9.13466 2.99983 8.763 3H4C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11V14M12 14V17M12 14H15M12 14H9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconActivityMessage = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4.09453 20.0555L7.26562 18.9984L7.82109 19.275C9.11937 19.9203 10.5502 20.2542 12 20.25C16.9641 20.25 21 16.3406 21 12C21 7.65938 16.9641 3.75 12 3.75C7.03594 3.75 3 7.65938 3 12C3 13.6195 3.58594 15.2648 4.65938 16.6688L5.17969 17.3438L4.09453 20.0555Z" fill="white"/>
  </svg>
);

const IconActivityArticle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 12H15M9 16H12M5 22H19C20.1046 22 21 21.1046 21 20V4C21 2.89543 20.1046 2 19 2H5C3.89543 2 3 2.89543 3 4V20C3 21.1046 3.89543 22 5 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 8H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconActivityGallery = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 14C2 10.2288 2 8.34315 3.17157 7.17157C4.34315 6 6.22876 6 10 6H14C17.7712 6 19.6569 6 20.8284 7.17157C22 8.34315 22 10.2288 22 14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14Z" stroke="white" strokeWidth="1.5"/>
    <path d="M2 14.5001L3.75159 12.9675C4.66286 12.1702 6.03628 12.2159 6.89249 13.0721L11.1822 17.3618C11.8694 18.0491 12.9512 18.1428 13.7464 17.5839L14.0446 17.3744C15.1888 16.5702 16.7369 16.6634 17.7765 17.599L21 20.5001" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconActivityAIChat = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.0282 22.4434C18.1825 22.3305 19.3347 22.1968 20.4842 22.0422C20.8573 21.9933 21.2036 21.8218 21.4687 21.5546C21.7337 21.2874 21.9024 20.9398 21.9482 20.5662C22.0854 19.4639 22.2208 18.3171 22.3305 17.1428M6.97392 1.55652C5.81959 1.66934 4.6674 1.80308 3.51792 1.95766C3.14473 2.00612 2.79823 2.17724 2.53291 2.44412C2.26759 2.71099 2.09849 3.05848 2.05221 3.43195C1.9074 4.57165 1.77995 5.7135 1.66992 6.85709M17.0282 1.55652C18.2111 1.66966 19.3682 1.81023 20.4842 1.95766C20.8571 2.00647 21.2032 2.17775 21.4682 2.44459C21.7332 2.71144 21.902 3.05874 21.9482 3.43195C22.0854 4.53595 22.2208 5.6828 22.3305 6.85709M6.97392 22.4434C5.81971 22.3295 4.66754 22.1958 3.51792 22.0422C3.14448 21.9937 2.79778 21.8223 2.53243 21.5551C2.26708 21.2879 2.09814 20.94 2.05221 20.5662C1.90741 19.4271 1.77997 18.2858 1.66992 17.1428" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const IconActivityUsers = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 19.75C21 17.66 19.33 14.682 17 14.023M15 19.75C15 17.099 12.314 13.75 9 13.75C5.686 13.75 3 17.099 3 19.75M15 10.25C15.7956 10.25 16.5587 9.93393 17.1213 9.37132C17.6839 8.80871 18 8.04565 18 7.25C18 6.45435 17.6839 5.69129 17.1213 5.12868C16.5587 4.56607 15.7956 4.25 15 4.25M12 7.25C12 8.04565 11.6839 8.80871 11.1213 9.37132C10.5587 9.93393 9.79565 10.25 9 10.25C8.20435 10.25 7.44129 9.93393 6.87868 9.37132C6.31607 8.80871 6 8.04565 6 7.25C6 6.45435 6.31607 5.69129 6.87868 5.12868C7.44129 4.56607 8.20435 4.25 9 4.25C9.79565 4.25 10.5587 4.56607 11.1213 5.12868C11.6839 5.69129 12 6.45435 12 7.25Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Icon Map ──────────────────────────────────────────────────────────────────
const ICON_MAP = {
  PROJECT: { Icon: IconActivityProject, bg: '#6C5CE7' },
  MESSAGE: { Icon: IconActivityMessage, bg: '#059669' },
  ARTICLE: { Icon: IconActivityArticle, bg: '#2563EB' },
  GALLERY: { Icon: IconActivityGallery, bg: '#D97706' },
  CHAT:    { Icon: IconActivityAIChat,  bg: '#D97706' },
  USER:    { Icon: IconActivityUsers,   bg: '#DC2626' },
};

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffH = (now - d) / (1000 * 60 * 60);
  if (diffH < 24) return 'Today, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Yesterday, ' + d.toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RecentActivity() {
  const { data, isLoading } = useGetDashboardRecentActivityQuery(20);
  const activities = data?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', padding: 24 }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      border: '1px solid #EEF2F7',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #EEF2F7' }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', margin: '0 0 4px' }}>
          Recent Activity
        </h3>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
          Latest changes across the website
        </p>
      </div>

      {/* Style for invisible scrollbar */}
      <style>{`
        .recent-activity-list::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* List */}
      <div 
        className="recent-activity-list"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflowY: 'auto', 
          maxHeight: '415px', // ~5 items of ~83px each
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE 10+
        }}
      >
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
            No recent activity yet.
          </div>
        ) : (
          activities.map((item, index) => {
            const cfg = ICON_MAP[item.type] || ICON_MAP['USER'];
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '20px 24px',
                  borderBottom: index !== activities.length - 1 ? '1px solid #EEF2F7' : 'none',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: cfg.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <cfg.Icon size={18} />
                </div>

                {/* Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
