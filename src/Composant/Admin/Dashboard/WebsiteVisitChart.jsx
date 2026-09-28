import React from 'react';
import { Skeleton } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useGetInteractionChartDataQuery } from '../../../services/api/dashboardApi';

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #EEF2F7',
        borderRadius: 8,
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <p style={{ fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
            <span style={{ fontSize: 13, color: '#64748B' }}>
              {entry.name}: <strong style={{ color: '#0F172A' }}>{entry.value}</strong>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function WebsiteVisitChart() {
  const { data, isLoading } = useGetInteractionChartDataQuery();
  const chartData = data?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EEF2F7', padding: 24, height: '100%' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
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
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #EEF2F7',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', margin: '0 0 4px' }}>
            Platform Interactions
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Messages, AI Chats, Projects & Articles over time
          </p>
        </div>
      </div>

      {/* Chart Area */}
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
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DB2777" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DB2777" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: 13, color: '#475569', paddingTop: 20 }} 
              />
              <Area 
                type="monotone" 
                dataKey="messages" 
                name="Messages" 
                stroke="#059669" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMessages)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
              />
              <Area 
                type="monotone" 
                dataKey="chats" 
                name="AI Chats" 
                stroke="#6C5CE7" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorChats)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6C5CE7' }}
              />
              <Area 
                type="monotone" 
                dataKey="projects" 
                name="Projects" 
                stroke="#F59E0B" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProjects)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }}
              />
              <Area 
                type="monotone" 
                dataKey="articles" 
                name="Articles" 
                stroke="#DB2777" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorArticles)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#DB2777' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
