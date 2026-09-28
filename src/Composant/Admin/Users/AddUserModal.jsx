import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Avatar,
  Divider,
  DatePicker,
  Select,
} from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useCreateManagerMutation } from "../../../services/api/usersApi";
import { message as antMessage } from "antd";

const { Option } = Select;

const COLORS = [
  "#023B6A",
  "#0E7490",
  "#7C3AED",
  "#B45309",
  "#059669",
  "#C026D3",
  "#DC2626",
  "#EA580C",
];
function getColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function getInitials(name = "") {
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? (p[0][0] || "?").toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function AddUserModal({ isOpen, onClose }) {
  const [form] = Form.useForm();
  const prenomVal = Form.useWatch("prenom", form) || "";
  const nomVal = Form.useWatch("nom", form) || "";
  const fullName = `${prenomVal} ${nomVal}`.trim();
  const color = getColor(fullName);
  const initials = getInitials(fullName);

  const [createManager, { isLoading }] = useCreateManagerMutation();

  useEffect(() => {
    if (!isOpen) form.resetFields();
  }, [isOpen]);

  const handleFinish = async (values) => {
    try {
      await createManager({
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        fonction: values.fonction.trim(),
        sexe: values.sexe,
        dateNaissance: values.dateNaissance?.format("YYYY-MM-DD"),
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      antMessage.success(
        "Manager créé avec succès ! Un e-mail de bienvenue a été envoyé.",
      );
      form.resetFields();
      onClose();
    } catch (err) {
      antMessage.error(
        err?.data?.message || "Erreur lors de la création du compte.",
      );
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div className="flex items-center gap-3 py-1">
          <Avatar
            size={40}
            style={{
              background: fullName ? color : "#023B6A",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {fullName ? initials : <UserAddOutlined />}
          </Avatar>
          <div>
            <p className="text-[18px] font-bold text-[#023B6A] m-0 leading-tight">
              Add Manager
            </p>
            <p className="text-[12px] text-slate-400 m-0">
              Créer un nouveau compte Manager
            </p>
          </div>
        </div>
      }
      styles={{
        header: { borderBottom: "1px solid #F1F5F9", paddingBottom: 16 },
        content: { borderRadius: 16 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        className="pt-4"
      >
        {/* Nom & Prénom */}
        <div className="flex gap-4">
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Prénom
              </span>
            }
            name="prenom"
            rules={[
              { required: true, message: "Requis" },
              { min: 2, message: "2 caractères minimum" },
            ]}
            className="flex-1"
          >
            <Input size="large" placeholder="Prenom" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Nom
              </span>
            }
            name="nom"
            rules={[
              { required: true, message: "Requis" },
              { min: 2, message: "2 caractères minimum" },
            ]}
            className="flex-1"
          >
            <Input size="large" placeholder="Nom" className="rounded-lg" />
          </Form.Item>
        </div>

        {/* Email & Téléphone */}
        <div className="flex gap-4">
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Email
              </span>
            }
            name="email"
            rules={[
              { required: true, type: "email", message: "Email valide requis" },
            ]}
            className="flex-1"
          >
            <Input
              size="large"
              placeholder="exemple@compulec.cm"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Téléphone
              </span>
            }
            name="phone"
            rules={[
              { required: true, message: "Requis" },
              {
                pattern: /^[0-9]{9}$/,
                message: "9 chiffres requis (ex: 690000000)",
              },
            ]}
            className="flex-1"
          >
            <Input
              size="large"
              placeholder="695683485"
              className="rounded-lg"
            />
          </Form.Item>
        </div>

        {/* Fonction & Sexe */}
        <div className="flex gap-4">
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Fonction
              </span>
            }
            name="fonction"
            rules={[{ required: true, message: "Requis" }]}
            className="flex-1"
          >
            <Input
              size="large"
              placeholder="Ex: Responsable Commercial"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Sexe
              </span>
            }
            name="sexe"
            rules={[{ required: true, message: "Requis" }]}
            className="flex-1"
          >
            <Select
              size="large"
              placeholder="Sélectionner"
              className="rounded-lg"
            >
              <Option value="HOMME">Homme</Option>
              <Option value="FEMME">Femme</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Date de naissance */}
        <Form.Item
          label={
            <span className="text-[13px] font-semibold text-[#023B6A]">
              Date de naissance
            </span>
          }
          name="dateNaissance"
          rules={[{ required: true, message: "Requis" }]}
        >
          <DatePicker
            size="large"
            className="w-full rounded-lg"
            format="DD/MM/YYYY"
            placeholder="jj/mm/aaaa"
          />
        </Form.Item>

        {/* Mot de passe */}
        <div className="flex gap-4">
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Mot de passe
              </span>
            }
            name="password"
            rules={[
              { required: true, message: "Requis" },
              { min: 8, message: "8 caractères minimum" },
            ]}
            className="flex-1"
          >
            <Input.Password
              size="large"
              placeholder="Minimum 8 caractères"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[13px] font-semibold text-[#023B6A]">
                Confirmer le mot de passe
              </span>
            }
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Requis" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Les mots de passe ne correspondent pas !"),
                  );
                },
              }),
            ]}
            className="flex-1"
          >
            <Input.Password
              size="large"
              placeholder="Retaper le mot de passe"
              className="rounded-lg"
            />
          </Form.Item>
        </div>

        <Divider className="my-5" />

        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onClose} className="rounded-lg px-6">
            Annuler
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            icon={<UserAddOutlined />}
            loading={isLoading}
            style={{ background: "#023B6A", borderColor: "#023B6A" }}
            className="rounded-lg px-6"
          >
            Créer le Manager
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
