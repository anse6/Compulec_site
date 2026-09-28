import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ShopOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Card, Button, Avatar, Descriptions, Alert, Tag, Spin, message as antMessage } from "antd";
import {
  useGetContactByIdQuery,
  useMarkAsReadMutation as useMarkContactAsReadMutation,
} from "../../../services/api/contactApi";
import {
  useGetConsultationByIdQuery,
  useMarkConsultationAsReadMutation,
} from "../../../services/api/consultationApi";

const COLORS = [
  "#023B6A", "#0E7490", "#7C3AED", "#B45309",
  "#059669", "#C026D3", "#DC2626", "#EA580C",
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
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminMessageDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const type = state?.type || 'Contact';
  const isConsultation = type === 'Consultation';

  // Contact queries
  const { data: contactData, isLoading: loadingContact } = useGetContactByIdQuery(id, { skip: !id || isConsultation });
  const [markContactAsRead, { isLoading: markingContact }] = useMarkContactAsReadMutation();

  // Consultation queries
  const { data: consultationData, isLoading: loadingConsultation } = useGetConsultationByIdQuery(id, { skip: !id || !isConsultation });
  const [markConsultationAsRead, { isLoading: markingConsultation }] = useMarkConsultationAsReadMutation();

  const isLoading = isConsultation ? loadingConsultation : loadingContact;
  const marking = isConsultation ? markingConsultation : markingContact;

  // Use API data if available, fall back to route state
  let rawData = isConsultation ? consultationData?.data : contactData?.data;
  rawData = rawData || state?.record;

  const handleMarkRead = async () => {
    try {
      if (isConsultation) {
        await markConsultationAsRead(rawData.id).unwrap();
      } else {
        await markContactAsRead(rawData.id).unwrap();
      }
      antMessage.success("Message marqué comme lu.");
    } catch {
      antMessage.error("Erreur lors de la mise à jour.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center pt-20">
        <Spin size="large" tip="Chargement du message..." />
      </div>
    );
  }

  if (!rawData) {
    return (
      <div className="flex flex-col items-center justify-center pt-20">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Message introuvable.</p>
        <Button onClick={() => navigate("/admin/messages")} icon={<ArrowLeftOutlined />}>
          Retour aux messages
        </Button>
      </div>
    );
  }

  // Normalize data depending on type
  const contact = {
    id: rawData.id,
    nom: isConsultation ? rawData.fullName : rawData.nom,
    email: rawData.email,
    telephone: isConsultation ? rawData.phone : rawData.telephone,
    entreprise: isConsultation ? rawData.company : rawData.entreprise,
    objet: isConsultation ? rawData.serviceOfInterest : rawData.objet,
    message: isConsultation ? rawData.projectDescription : rawData.message,
    preferredContact: isConsultation ? rawData.preferredContact : null,
    lu: rawData.lu,
    createdAt: rawData.createdAt,
  };

  const color = getColor(contact.nom || "");
  const initials = getInitials(contact.nom || "?");

  return (
    <div className="pb-10 font-['Poppins',sans-serif] w-full">
      {/* Back Button */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/messages")}
        className="px-0 text-[#023B6A] font-semibold mb-4 hover:text-[#04305a]"
      >
        Retour aux messages
      </Button>

      {/* Header Info */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#023B6A] m-0 mb-1">
            {contact.objet || "Sans objet"}
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mb-3">
            De <strong>{contact.nom}</strong>
            {contact.entreprise && <span> — {contact.entreprise}</span>}
            {" "} — reçu le {formatDate(contact.createdAt)}
          </p>
          {contact.lu ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>Lu</Tag>
          ) : (
            <Tag color="gold" icon={<ClockCircleOutlined />}>Non lu</Tag>
          )}
          {isConsultation && (
            <Tag color="blue" icon={<ProjectOutlined />}>Consultation</Tag>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {!contact.lu && (
            <Button
              loading={marking}
              onClick={handleMarkRead}
              icon={<CheckCircleOutlined />}
              style={{ borderRadius: 8, fontWeight: 600, color: "#059669", borderColor: "#059669" }}
            >
              Marquer comme lu
            </Button>
          )}
          <Button
            type="primary"
            icon={<SendOutlined />}
            href={`mailto:${contact.email}?subject=Re: ${contact.objet || ""}`}
            style={{
              background: "#FDE047", borderColor: "#FDE047",
              color: "#713F12", fontWeight: 600, borderRadius: 8,
            }}
          >
            Répondre
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <Card
            title={<span className="text-[#023B6A] font-bold">{isConsultation ? "Description du Projet" : "Contenu du Message"}</span>}
            bordered={true}
            className="rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <p className="text-[14px] text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed m-0">
              {contact.message || "Aucun contenu fourni."}
            </p>
          </Card>

          <Card
            title={<span className="text-[#023B6A] font-bold">Réponses</span>}
            bordered={true}
            className="rounded-xl border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-800/50/50"
          >
            <p className="text-[13px] text-slate-400 italic m-0">
              Aucune réponse envoyée depuis l'administration pour l'instant.
            </p>
            <Button
              type="primary"
              icon={<SendOutlined />}
              href={`mailto:${contact.email}?subject=Re: ${contact.objet || ""}`}
              style={{
                backgroundColor: "var(--ant-color-primary)", borderColor: "#023B6A",
                marginTop: 16, fontWeight: 600, borderRadius: 8,
              }}
            >
              Répondre par email
            </Button>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <Card
            title={<span className="text-[#023B6A] font-bold">Informations du Contact</span>}
            bordered={true}
            className="rounded-xl border-slate-200 dark:border-slate-700 shadow-sm"
            styles={{ body: { padding: 0 } }}
          >
            <div className="flex flex-col items-center gap-2 pt-6 pb-4">
              <Avatar
                size={64}
                style={{
                  background: color, fontWeight: 800,
                  fontSize: 24, boxShadow: `0 4px 14px ${color}33`,
                }}
              >
                {initials}
              </Avatar>
              <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 m-0 mt-2">
                {contact.nom}
              </h3>
              {contact.entreprise && (
                <p className="text-[13px] text-slate-400 m-0 flex items-center gap-1">
                  <ShopOutlined /> {contact.entreprise}
                </p>
              )}
            </div>

            <Descriptions
              column={1}
              bordered
              size="small"
              labelStyle={{ fontWeight: 600, color: "#023B6A", fontSize: 13, width: 120 }}
              contentStyle={{ fontSize: 13 }}
            >
              <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-[#023B6A] hover:underline flex items-center gap-1.5 break-all"
                >
                  {contact.email}
                </a>
              </Descriptions.Item>
              {contact.telephone && (
                <Descriptions.Item label={<span><PhoneOutlined /> Téléphone</span>}>
                  {contact.telephone}
                </Descriptions.Item>
              )}
              {contact.entreprise && (
                <Descriptions.Item label="Entreprise">
                  {contact.entreprise}
                </Descriptions.Item>
              )}
              {isConsultation && contact.preferredContact && (
                <Descriptions.Item label="Contact Préféré">
                  {contact.preferredContact}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={<span><CalendarOutlined /> Reçu</span>}>
                {formatDate(contact.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                {contact.lu ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>Lu</Tag>
                ) : (
                  <Tag color="gold" icon={<ClockCircleOutlined />}>Non lu</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Info Notice */}
          <Alert
            message="Réponse par Email"
            description="Vos réponses seront envoyées directement à l'adresse email du client."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="rounded-xl border-indigo-100 bg-indigo-50 text-indigo-800"
          />
        </div>
      </div>
    </div>
  );
}
