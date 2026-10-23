import React from 'react';
import { Skeleton, Tag, Popconfirm, message } from 'antd';
import { CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../AdminThemeContext';
import AvatarWithPopover from '../Users/AvatarWithPopover';
import WidgetError from './WidgetError';
import { formatDashboardDate } from './dashboardFormat';
import {
  useGetDashboardRecentMessagesQuery,
  DASHBOARD_QUERY_OPTIONS,
} from '../../../services/api/dashboardApi';
import { useMarkAsReadMutation } from '../../../services/api/contactApi';

const tagStyle = { borderRadius: 999, padding: '2px 10px', fontWeight: 600, margin: 0, userSelect: 'none' };

/** Statut réel du message (champ `lu`) ; « Non lu » → confirmation → PATCH /api/contacts/{id}/lire. */
function ReadStatus({ id, lu }) {
  const { t } = useTranslation();
  const [markAsRead, { isLoading }] = useMarkAsReadMutation();

  if (lu) {
    return (
      <Tag color="green" icon={<CheckCircleOutlined />} style={tagStyle}>
        {t('admin.dashboard.read')}
      </Tag>
    );
  }

  const handleConfirm = async () => {
    try {
      await markAsRead(id).unwrap();
      message.success(t('admin.dashboard.markedAsRead'));
    } catch {
      message.error(t('admin.dashboard.markAsReadError'));
    }
  };

  return (
    <Popconfirm
      title={t('admin.dashboard.markAsReadConfirm')}
      onConfirm={handleConfirm}
      okText={t('admin.dashboard.markAsReadOk')}
      cancelText={t('admin.dashboard.cancel')}
      okButtonProps={{ loading: isLoading, style: { background: '#023B6A', borderColor: '#023B6A' } }}
      placement="top"
    >
      <Tag
        color="gold"
        icon={<StarOutlined />}
        style={{ ...tagStyle, cursor: 'pointer' }}
      >
        {t('admin.dashboard.unread')}
      </Tag>
    </Popconfirm>
  );
}

export default function ReviewEnquiries() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const bgCard  = isDark ? '#1E293B' : '#fff';
  const border  = isDark ? '#334155' : '#EEF2F7';
  const textMain = isDark ? '#F8FAFC' : '#0F172A';
  const textSub  = isDark ? '#94A3B8' : '#64748B';
  const primary  = isDark ? '#38bdf8' : '#023B6A';
  const hoverBg  = isDark ? '#243247' : '#F8FAFC';

  const { data, isLoading, isError, refetch } = useGetDashboardRecentMessagesQuery(6, DASHBOARD_QUERY_OPTIONS);
  const messages = data?.data ?? [];

  const openMessage = (id) => navigate(`/admin/messages/preview/${id}`, { state: { type: 'Contact' } });

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
          gap: 12,
          padding: '24px',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: textMain, margin: '0 0 4px' }}>
            {t('admin.dashboard.reviewEnquiries')}
          </h3>
          <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
            {t('admin.dashboard.enquiriesSubtitle')}
          </p>
        </div>
        <Link
          to="/admin/messages"
          style={{ fontSize: 13, fontWeight: 700, color: primary, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          {t('admin.dashboard.viewAllMessages')}
        </Link>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {isError ? (
          <WidgetError onRetry={refetch} />
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
            {t('admin.dashboard.noMessages')}
          </div>
        ) : (
          messages.map((item, index) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => openMessage(item.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') openMessage(item.id); }}
              onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 24px',
                cursor: 'pointer',
                borderBottom: index !== messages.length - 1 ? `1px solid ${border}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <AvatarWithPopover name={item.nom} email={item.email} size={40} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: item.lu ? 600 : 800, fontSize: 14, color: primary, margin: '0 0 2px' }}>
                    {item.nom}
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
                    {item.objet}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: textSub, fontWeight: 500 }}>
                  {formatDashboardDate(item.createdAt, t, i18n.language)}
                </span>
                {/* Les clics du Popconfirm (rendu en portail) remontent dans l'arbre React : on les arrête ici */}
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <ReadStatus id={item.id} lu={item.lu} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
