import React, { useState } from 'react';
import { Popconfirm, Tag, message as antMessage } from 'antd';
import { CheckCircleFilled, StopOutlined, LoadingOutlined } from '@ant-design/icons';
import { useActivateUserMutation, useDeactivateUserMutation } from '../../../services/api/usersApi';

/**
 * StatusToggle — Ant Design Popconfirm + Tag
 * Props:
 *  - userId      : id of the user in the backend
 *  - initialStatus : boolean (true = active, false = disabled)
 */
export default function StatusToggle({ userId, initialStatus = true }) {
  const [localActive, setLocalActive] = useState(initialStatus);
  const [activate, { isLoading: activating }] = useActivateUserMutation();
  const [deactivate, { isLoading: deactivating }] = useDeactivateUserMutation();

  const loading = activating || deactivating;

  const handleConfirm = async () => {
    try {
      if (localActive) {
        await deactivate(userId).unwrap();
        setLocalActive(false);
        antMessage.success('Compte désactivé avec succès.');
      } else {
        await activate(userId).unwrap();
        setLocalActive(true);
        antMessage.success('Compte activé avec succès.');
      }
    } catch {
      antMessage.error('Erreur lors du changement de statut.');
    }
  };

  const tag = loading ? (
    <Tag icon={<LoadingOutlined spin />} color="processing"
      style={{ cursor: 'wait', userSelect: 'none', borderRadius: 999, padding: '2px 10px' }}>
      En cours…
    </Tag>
  ) : localActive ? (
    <Tag icon={<CheckCircleFilled />} color="success"
      style={{ cursor: 'pointer', userSelect: 'none', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>
      Active
    </Tag>
  ) : (
    <Tag icon={<StopOutlined />} color="error"
      style={{ cursor: 'pointer', userSelect: 'none', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>
      Disabled
    </Tag>
  );

  if (loading) return tag;

  return (
    <Popconfirm
      title={<span className="font-semibold text-[13px]">{localActive ? 'Désactiver cet utilisateur ?' : 'Réactiver cet utilisateur ?'}</span>}
      description={
        <span className="text-[12px] text-slate-500">
          {localActive ? 'Il ne pourra plus se connecter au tableau de bord.' : 'Il pourra à nouveau accéder au tableau de bord.'}
        </span>
      }
      onConfirm={handleConfirm}
      okText={localActive ? 'Désactiver' : 'Activer'}
      cancelText="Annuler"
      okButtonProps={{ danger: localActive, style: !localActive ? { background: '#059669', borderColor: '#059669' } : {} }}
      placement="top"
      icon={localActive ? <StopOutlined style={{ color: '#DC2626' }} /> : <CheckCircleFilled style={{ color: '#059669' }} />}
    >
      {tag}
    </Popconfirm>
  );
}
