import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// For demo, reuse the same INITIAL_DATA (could be fetched from a store)
const INITIAL_DATA = [
  { id: 1, title: 'Technical room rack alignment', img: 'https://picsum.photos/500/300?random=20' },
  { id: 2, title: 'Exterior surveillance camera', img: 'https://picsum.photos/500/300?random=21' },
  { id: 3, title: 'Biometric access reader', img: 'https://picsum.photos/500/300?random=22' },
  { id: 4, title: 'Server room cabling overview', img: 'https://picsum.photos/500/300?random=23' },
  { id: 5, title: 'Network technician configuring switch', img: 'https://picsum.photos/500/300?random=24' },
  { id: 6, title: 'Conference room screen setup', img: 'https://picsum.photos/500/300?random=25' },
];

export default function AdminGalleryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = INITIAL_DATA.find(i => i.id === Number(id)) || {};

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: 40, background: '#F8FAFC' }}>
      {/* Back */}
      <div
        onClick={() => navigate('/admin/gallery')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#023B6A', fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}
      >
        <ArrowLeftOutlined /> Back to Gallery
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        {/* Large Image */}
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #EEF2F7' }}>
          <img src={item.img} alt={item.title} style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'contain' }} />
        </div>

        {/* Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#023B6A', margin: 0 }}>{item.title}</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={actionBtnStyle} onClick={() => navigate(`/admin/gallery/edit/${item.id}`)}>
              <EditOutlined /> Edit
            </button>
            <button style={{ ...actionBtnStyle, color: '#EF4444' }}>
              <DeleteOutlined /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 600,
  color: '#023B6A',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all 0.2s',
};
