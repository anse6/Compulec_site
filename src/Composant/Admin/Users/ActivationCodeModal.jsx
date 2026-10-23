import React from "react";
import { Modal, Button, Alert, message as antMessage } from "antd";
import { SafetyCertificateOutlined, CopyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";

/**
 * Affiche UNE SEULE FOIS le code d'activation d'une invitation.
 * Le code n'est jamais envoyé par e-mail : l'admin le transmet au manager
 * de vive voix, par téléphone ou par message (second canal).
 *
 * Props :
 *  - invitation : ManagerCreatedResponse { user, activationCode, invitationExpiresAt, emailSent } | null
 *  - onClose
 */
export default function ActivationCodeModal({ invitation, onClose }) {
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const textSub = isDark ? "#94A3B8" : "#64748B";

  if (!invitation) return null;

  const { user, activationCode, invitationExpiresAt, emailSent } = invitation;
  const expires = invitationExpiresAt
    ? new Date(invitationExpiresAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
    : "";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activationCode);
      antMessage.success(t("admin.users.invite.copied"));
    } catch {
      antMessage.error(t("admin.users.invite.copyError"));
    }
  };

  return (
    <Modal
      open
      onCancel={onClose}
      maskClosable={false}
      keyboard={false}
      width={520}
      footer={
        <Button type="primary" size="large" onClick={onClose} style={{ background: primary, borderColor: primary }}>
          {t("admin.users.invite.done")}
        </Button>
      }
      title={
        <div className="flex items-center gap-3 py-1">
          <SafetyCertificateOutlined style={{ fontSize: 28, color: primary }} />
          <div>
            <p className="text-[18px] font-bold m-0 leading-tight" style={{ color: primary }}>
              {t("admin.users.invite.title")}
            </p>
            <p className="text-[12px] m-0" style={{ color: textSub }}>
              {user?.prenom} {user?.nom} · {user?.email}
            </p>
          </div>
        </div>
      }
    >
      {!emailSent && (
        <Alert type="warning" showIcon message={t("admin.users.invite.emailFailed")} style={{ marginBottom: 16, borderRadius: 8 }} />
      )}

      <p style={{ color: textSub, fontSize: 13, marginBottom: 12 }}>{t("admin.users.invite.explain")}</p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "20px 12px",
          borderRadius: 12,
          border: `1px dashed ${primary}`,
          background: isDark ? "rgba(56,189,248,0.08)" : "#EFF6FF",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: 10,
            color: primary,
            userSelect: "all",
          }}
        >
          {activationCode}
        </span>
        <Button icon={<CopyOutlined />} onClick={copyCode} title={t("admin.users.invite.copy")} />
      </div>

      <p style={{ color: textSub, fontSize: 12, textAlign: "center", marginBottom: 16 }}>
        {t("admin.users.invite.expires", { date: expires })}
      </p>

      <Alert
        type="error"
        showIcon
        message={t("admin.users.invite.onlyOnce")}
        description={t("admin.users.invite.neverEmail")}
        style={{ borderRadius: 8 }}
      />
    </Modal>
  );
}
