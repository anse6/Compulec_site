import React, { useState } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { Table, ConfigProvider, Input, Button, Segmented, Tag, Popconfirm, message } from 'antd';
import { EyeOutlined, MailOutlined, CheckCircleOutlined, SyncOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AvatarWithPopover from '../Users/AvatarWithPopover';
import {
  useGetAllContactsQuery,
  useGetUnreadContactsQuery,
  useMarkAsReadMutation,
  useDeleteContactMutation,
} from '../../../services/api/contactApi';
import {
  useGetAllConsultationsQuery,
  useGetUnreadConsultationsQuery,
  useMarkConsultationAsReadMutation,
  useDeleteConsultationMutation,
} from '../../../services/api/consultationApi';

// --- Main Component ---
export default function AdminMessages() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [activeType, setActiveType] = useState('Contact'); // 'Contact' or 'Consultation'
  const [activeStatus, setActiveStatus] = useState('Tous'); // 'Tous' or 'Non lus'
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const navigate = useNavigate();

  // Contact Queries
  const { data: allContacts, isLoading: loadingAllContacts, isFetching: fetchingAllContacts } = useGetAllContactsQuery({ page, size, sort: 'createdAt' }, { skip: activeType !== 'Contact' || activeStatus !== 'Tous' });
  const { data: unreadContacts, isLoading: loadingUnreadContacts, isFetching: fetchingUnreadContacts } = useGetUnreadContactsQuery({ page, size }, { skip: activeType !== 'Contact' || activeStatus !== 'Non lus' });
  
  // Consultation Queries
  const { data: allConsultations, isLoading: loadingAllConsultations, isFetching: fetchingAllConsultations } = useGetAllConsultationsQuery({ page, size, sort: 'createdAt' }, { skip: activeType !== 'Consultation' || activeStatus !== 'Tous' });
  const { data: unreadConsultations, isLoading: loadingUnreadConsultations, isFetching: fetchingUnreadConsultations } = useGetUnreadConsultationsQuery({ page, size }, { skip: activeType !== 'Consultation' || activeStatus !== 'Non lus' });

  // Mutations
  const [markContactAsRead] = useMarkAsReadMutation();
  const [deleteContact] = useDeleteContactMutation();
  const [markConsultationAsRead] = useMarkConsultationAsReadMutation();
  const [deleteConsultation] = useDeleteConsultationMutation();

  const handleMarkAsRead = async (id) => {
    try {
      if (activeType === 'Contact') {
        await markContactAsRead(id).unwrap();
      } else {
        await markConsultationAsRead(id).unwrap();
      }
      message.success('Message marqué comme lu.');
    } catch (err) {
      message.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeType === 'Contact') {
        await deleteContact(id).unwrap();
      } else {
        await deleteConsultation(id).unwrap();
      }
      message.success('Message supprimé avec succès.');
    } catch (err) {
      message.error("Erreur lors de la suppression.");
    }
  };

  let dataSource = [];
  let totalElements = 0;
  let isLoading = false;

  if (activeType === 'Contact') {
    isLoading = activeStatus === 'Tous' ? (loadingAllContacts || fetchingAllContacts) : (loadingUnreadContacts || fetchingUnreadContacts);
    const data = activeStatus === 'Tous' ? allContacts?.data : unreadContacts?.data;
    if (data?.content) {
      dataSource = data.content;
      totalElements = data.totalElements;
    }
  } else {
    isLoading = activeStatus === 'Tous' ? (loadingAllConsultations || fetchingAllConsultations) : (loadingUnreadConsultations || fetchingUnreadConsultations);
    const data = activeStatus === 'Tous' ? allConsultations?.data : unreadConsultations?.data;
    if (data?.content) {
      dataSource = data.content;
      totalElements = data.totalElements;
    }
  }

  // Filter local search on the current page data
  const filteredData = dataSource.filter(m => {
    const q = search.toLowerCase();
    const nomField = activeType === 'Contact' ? m.nom : m.fullName;
    const objetField = activeType === 'Contact' ? m.objet : m.serviceOfInterest;
    
    return !q || 
      (nomField && nomField.toLowerCase().includes(q)) || 
      (m.email && m.email.toLowerCase().includes(q)) || 
      (objetField && objetField.toLowerCase().includes(q));
  });

  const columns = [
    {
      title: 'NOM',
      dataIndex: activeType === 'Contact' ? 'nom' : 'fullName',
      key: 'name',
      render: (text, record) => {
        const name = activeType === 'Contact' ? record.nom : record.fullName;
        return (
          <div className="flex items-center gap-3">
            <AvatarWithPopover name={name || 'Anonyme'} email={record.email} />
            <span className="font-semibold  text-[13px]" style={{ color: textMain }}>{name || 'Anonyme'}</span>
          </div>
        );
      },
    },
    {
      title: 'SUJET',
      dataIndex: activeType === 'Contact' ? 'objet' : 'serviceOfInterest',
      key: 'subject',
      render: text => <span className="text-[13px] " style={{ color: textMain }}>{text}</span>,
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      render: email => (
        <a href={`mailto:${email}`} className="text-[13px]  hover:underline flex items-center gap-1">
          <MailOutlined className="text-[11px]" /> {email}
        </a>
      ),
    },
    {
      title: 'TÉLÉPHONE',
      dataIndex: activeType === 'Contact' ? 'telephone' : 'phone',
      key: 'phone',
      render: text => <span className="text-[13px] " style={{ color: textMain }}>{text || '-'}</span>,
    },
    {
      title: 'DATE',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: text => {
        if (!text) return '-';
        return <span className="text-[13px] " style={{ color: textSub }}>{new Date(text).toLocaleString()}</span>;
      },
    },
    {
      title: 'STATUT',
      dataIndex: 'lu',
      key: 'lu',
      render: (lu, record) => {
        if (lu) {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Lu</Tag>;
        }
        return (
          <Popconfirm
            title="Marquer comme lu ?"
            onConfirm={() => handleMarkAsRead(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Tag color="gold" icon={<SyncOutlined />} style={{ cursor: 'pointer' }}>Non lu</Tag>
          </Popconfirm>
        );
      },
    },
    {
      title: 'ACTION',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/admin/messages/preview/${record.id}`, { state: { record, type: activeType } })}
            style={{
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              color: textMain,
              backgroundColor: bgCard,
              borderColor: border,
            }}
          >
            Voir
          </Button>
          <Popconfirm
            title="Supprimer ce message ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
            placement="topRight"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ borderRadius: 6 }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10 font-['Poppins',sans-serif]">

        {/* HEADER */}
        <div>
          <h1 className="text-[26px] font-bold m-0 mb-1" style={{ color: textMain }}>Messages &amp; Consultations</h1>
          <p className="text-[13px]  m-0" style={{ color: textSub }}>
            Gérez les messages de contact et les requêtes de consultation reçus via le site web COMPULEC.
          </p>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <Input
              placeholder="Rechercher par nom, email ou sujet..."
              prefix={<span className="text-slate-400 text-sm">🔍</span>}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 300, borderRadius: 8 }}
              allowClear
            />
            
            {/* Type Tabs */}
            <Segmented
              options={[
                { label: 'Contact', value: 'Contact' },
                { label: 'Consultation', value: 'Consultation' },
              ]}
              value={activeType}
              onChange={(val) => {
                setActiveType(val);
                setPage(0);
              }}
              style={{ borderRadius: 8, fontWeight: 600 }}
            />

            {/* Status Tabs */}
            <Segmented
              options={[
                { label: 'Tous les messages', value: 'Tous' },
                { label: 'Non lus', value: 'Non lus' },
              ]}
              value={activeStatus}
              onChange={(val) => {
                setActiveStatus(val);
                setPage(0);
              }}
              style={{ borderRadius: 8, fontWeight: 600 }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className=" rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={isLoading}
            pagination={{
              position: ['bottomRight'],
              current: page + 1,
              pageSize: size,
              total: totalElements,
              onChange: (p, s) => {
                setPage(p - 1);
                setSize(s);
              },
            }}
          />
        </div>

      </div>
    
  );
}
