import React from 'react';
import { Skeleton } from 'antd';
import { useAdminTheme } from '../AdminThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useGetInteractionChartDataQuery } from '../../../services/api/dashboardApi';

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
  const bgCard  = isDark ? '#1E293B' : '#fff';
  const border  = isDark ? '#334155' : '#EEF2F7';
  const textMain = isDark ? '#F8FAFC' : '#0F172A';
  const textSub  = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#334155' : '#EEF2F7';
  const tickColor = isDark ? '#64748B' : '#94A3B8';
  const legendColor = isDark ? '#94A3B8' : '#475569';

  const { data, isLoading } = useGetInteractionChartDataQuery();
  const chartData = data?.data ?? [];

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
            Platform Interactions
          </h3>
          <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
            Messages, AI Chats, Projects &amp; Articles over time
          </p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 24px 24px 0', minHeight: 0 }}>
        {chartData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DB2777" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DB2777" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dx={-10} />
              <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13, color: legendColor, paddingTop: 20 }} />
              <Area type="monotone" dataKey="messages"  name="Messages" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorMessages)"  activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }} />
              <Area type="monotone" dataKey="chats"     name="AI Chats" stroke="#6C5CE7" strokeWidth={3} fillOpacity={1} fill="url(#colorChats)"     activeDot={{ r: 6, strokeWidth: 0, fill: '#6C5CE7' }} />
              <Area type="monotone" dataKey="projects"  name="Projects" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorProjects)"  activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }} />
              <Area type="monotone" dataKey="articles"  name="Articles" stroke="#DB2777" strokeWidth={3} fillOpacity={1} fill="url(#colorArticles)"  activeDot={{ r: 6, strokeWidth: 0, fill: '#DB2777' }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
