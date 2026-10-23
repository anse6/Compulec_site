import React from 'react';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAdminTheme } from '../AdminThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import WidgetError from './WidgetError';
import { formatChartMonth } from './dashboardFormat';
import {
  useGetInteractionChartDataQuery,
  DASHBOARD_QUERY_OPTIONS,
} from '../../../services/api/dashboardApi';

const SERIES = [
  { key: 'messages', color: '#059669' },
  { key: 'chats',    color: '#6C5CE7' },
  { key: 'projects', color: '#F59E0B' },
  { key: 'articles', color: '#DB2777' },
];

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    const bg     = isDark ? '#1E293B' : '#fff';
    const border = isDark ? '#334155' : '#EEF2F7';
    const title  = isDark ? '#F8FAFC' : '#0F172A';
    const sub    = isDark ? '#94A3B8' : '#64748B';
    return (
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <p style={{ fontWeight: 700, margin: '0 0 8px', color: title }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
            <span style={{ fontSize: 13, color: sub }}>
              {entry.name}: <strong style={{ color: title }}>{entry.value}</strong>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function WebsiteVisitChart() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const bgCard  = isDark ? '#1E293B' : '#fff';
  const border  = isDark ? '#334155' : '#EEF2F7';
  const textMain = isDark ? '#F8FAFC' : '#0F172A';
  const textSub  = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#334155' : '#EEF2F7';
  const tickColor = isDark ? '#64748B' : '#94A3B8';
  const legendColor = isDark ? '#94A3B8' : '#475569';

  const { data, isLoading, isError, refetch } = useGetInteractionChartDataQuery(undefined, DASHBOARD_QUERY_OPTIONS);
  const chartData = React.useMemo(
    () => (data?.data ?? []).map((point) => ({ ...point, label: formatChartMonth(point.month, i18n.language) })),
    [data, i18n.language],
  );
  // Le backend renvoie toujours 6 mois : "vide" = tous les compteurs à 0
  const hasData = chartData.some((p) => SERIES.some((s) => p[s.key] > 0));

  if (isLoading) {
    return (
      <div style={{ background: bgCard, borderRadius: 18, border: `1px solid ${border}`, padding: 24, height: '100%' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: textMain, margin: '0 0 4px' }}>
            {t('admin.dashboard.platformInteractions')}
          </h3>
          <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
            {t('admin.dashboard.interactionsSubtitle')}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 24px 24px 0', minHeight: 0 }}>
        {isError ? (
          <WidgetError onRetry={refetch} />
        ) : !hasData ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
            {t('admin.dashboard.noChartData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {SERIES.map(({ key, color }) => (
                  <linearGradient key={key} id={`dashboard-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dx={-10} />
              <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13, color: legendColor, paddingTop: 20 }} />
              {SERIES.map(({ key, color }) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={t(`admin.dashboard.series.${key}`)}
                  stroke={color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#dashboard-gradient-${key})`}
                  activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
