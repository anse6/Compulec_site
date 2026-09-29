import React, { useState, useEffect } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { Modal, Form, Input, Button, Avatar, Tag, Divider, DatePicker, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUpdateUserMutation } from '../../../services/api/usersApi';
import { message as antMessage } from 'antd';

const { Option } = Select;

const COLORS = ['#023B6A','#0E7490','#7C3AED','#B45309','#059669','#C026D3','#DC2626','#EA580C'];
function getColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function getInitials(name = '') {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? (p[0][0] || '?').toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function EditUserModal({ isOpen, onClose, user }) {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [form] = Form.useForm();
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const fullName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '';
  const color    = getColor(fullName);
  const initials = getInitials(fullName);

  useEffect(() => {
    if (isOpen && user) {
      form.setFieldsValue({
        nom:          user.nom || '',
        prenom:       user.prenom || '',
        phone:        user.phone || '',
        fonction:     user.fonction || '',
        sexe:         user.sexe || undefined,
        dateNaissance: user.dateNaissance ? dayjs(user.dateNaissance) : null,
      });
    }
    if (!isOpen) form.resetFields();
  }, [isOpen, user, form]);

  const handleFinish = async (values) => {
    try {
      await updateUser({
        id: user.id,
        nom:           values.nom.trim(),
        prenom:        values.prenom.trim(),
        phone:         values.phone.trim(),
        fonction:      values.fonction.trim(),
        sexe:          values.sexe,
        dateNaissance: values.dateNaissance?.format('YYYY-MM-DD'),
      }).unwrap();
      antMessage.success('Informations mises à jour avec succès !');
      onClose();
    } catch (err) {
      antMessage.error(err?.data?.message || 'Erreur lors de la mise à jour.');
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={640}
      title={
        <div className="flex items-center gap-3 py-1">
          <Avatar size={42} style={{ background: color, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {initials}
          </Avatar>
          <div>
            <p className="text-[18px] font-bold  m-0 leading-tight" style={{ color: primary }}>Edit User</p>
            {fullName && (
              <p className="text-[12px] text-slate-400 m-0">
                Editing <span className="font-semibold text-slate-500">{fullName}</span>
              </p>
            )}
          </div>
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }, content: { borderRadius: 16 } }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false} className="pt-4">

        {/* Email (lecture seule) */}
        <Form.Item label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Email Address</span>}>
          <Input
            value={user?.email || ''}
            disabled
            size="large"
            className="rounded-lg bg-slate-50 text-slate-400"
          />
          <span className="text-[11px] text-slate-400">L'email ne peut pas être modifié.</span>
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Prénom</span>}
            name="prenom" rules={[{ required: true, message: 'Requis' }]} className="flex-1"
          >
            <Input size="large" placeholder="Prénom" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Nom</span>}
            name="nom" rules={[{ required: true, message: 'Requis' }]} className="flex-1"
          >
            <Input size="large" placeholder="Nom" className="rounded-lg" />
          </Form.Item>
        </div>

        <div className="flex gap-4">
          <Form.Item
            label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Téléphone</span>}
            name="phone"
            rules={[{ required: true, message: 'Requis' }, { pattern: /^[0-9]{9}$/, message: '9 chiffres requis' }]}
            className="flex-1"
          >
            <Input size="large" placeholder="690000000" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Sexe</span>}
            name="sexe" rules={[{ required: true, message: 'Requis' }]} className="flex-1"
          >
            <Select size="large" placeholder="Sélectionner" className="rounded-lg">
              <Option value="HOMME">Homme</Option>
              <Option value="FEMME">Femme</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="flex gap-4">
          <Form.Item
            label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Fonction</span>}
            name="fonction" rules={[{ required: true, message: 'Requis' }]} className="flex-1"
          >
            <Input size="large" placeholder="Ex: Responsable IT" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Date de naissance</span>}
            name="dateNaissance" rules={[{ required: true, message: 'Requis' }]} className="flex-1"
          >
            <DatePicker size="large" className="w-full rounded-lg" format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <Form.Item label={<span className="text-[13px] font-semibold " style={{ color: primary }}>Rôle</span>}>
          <div className="flex items-center h-[42px] px-3 bg-[#EEF2FF] border border-[#E0E7FF] rounded-lg gap-2">
            <Tag color="blue" style={{ margin: 0 }}>{user?.role || 'Manager'}</Tag>
            <span className="text-[11px] text-slate-400 ml-auto">Modifiable via "Change Role"</span>
          </div>
        </Form.Item>

        <Divider className="my-4" />

        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onClose} className="rounded-lg px-6">Annuler</Button>
          <Button size="large" type="primary" htmlType="submit" icon={<EditOutlined />} loading={isLoading}
            style={{ background: primary, borderColor: primary }} className="rounded-lg px-6">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
