import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, ConfigProvider, message, theme } from "antd";
import { CopyOutlined, DownloadOutlined, WarningFilled, CheckCircleFilled } from "@ant-design/icons";

// Thème clair isolé : le bloc s'affiche de la même façon sur la page de connexion
// et dans le back-office (y compris en mode sombre).
const lightTheme = {
  inherit: false,
  algorithm: theme.defaultAlgorithm,
  token: { colorPrimary: "#023B6A", colorTextBase: "#1a2b4a", borderRadius: 8, fontFamily: "'Poppins', sans-serif" },
};

/**
 * Affiche les codes de secours 2FA (une seule fois) et oblige à confirmer
 * qu'ils ont été sauvegardés avant de continuer.
 */
export default function BackupCodesList({ codes, onDone, doneLabel }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const text = codes.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t("mfa.backup.copied"));
    } catch {
      message.error(t("mfa.backup.copyError"));
    }
  };

  const download = () => {
    const blob = new Blob(
      [`COMPULEC – ${t("mfa.backup.fileTitle")}\n${new Date().toLocaleString()}\n\n${text}\n`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compulec-codes-de-secours.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ConfigProvider theme={lightTheme}>
      <div style={{ background: "#ffffff", borderRadius: 12, color: "#1a2b4a" }}>
        {/* Avertissement */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: 13,
            lineHeight: 1.5,
            color: "#92400E",
          }}
        >
          <WarningFilled style={{ color: "#D97706", fontSize: 16, marginTop: 2 }} />
          <span>{t("mfa.backup.warning")}</span>
        </div>

        {/* Codes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 8,
            padding: 14,
            borderRadius: 10,
            background: "#F1F5F9",
            border: "1.5px solid #CBD5E1",
            marginBottom: 12,
          }}
        >
          {codes.map((code, i) => (
            <div
              key={code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 16, textAlign: "right" }}>{i + 1}.</span>
              <code
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: "#0F172A",
                  background: "transparent",
                  userSelect: "all",
                }}
              >
                {code}
              </code>
            </div>
          ))}
        </div>

        {/* Copier / Télécharger */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <Button icon={<CopyOutlined />} onClick={copy}>{t("mfa.backup.copy")}</Button>
          <Button icon={<DownloadOutlined />} onClick={download}>{t("mfa.backup.download")}</Button>
        </div>

        {/* Confirmation : la case d'Ant Design est elle-même un <label>, toute la zone est cliquable.
            (Ne pas l'imbriquer dans un autre <label> : le clic cocherait puis décocherait aussitôt.) */}
        <Checkbox
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            margin: "0 0 16px 0",
            padding: "12px 14px",
            borderRadius: 10,
            border: `1.5px solid ${saved ? "#10B981" : "#CBD5E1"}`,
            background: saved ? "#ECFDF5" : "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            color: saved ? "#065F46" : "#1a2b4a",
            transition: "all 0.2s",
          }}
        >
          {t("mfa.backup.confirm")}
        </Checkbox>

        {onDone && (
          <button
            type="button"
            disabled={!saved}
            onClick={onDone}
            style={{
              width: "100%",
              height: 50,
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: saved ? "pointer" : "not-allowed",
              background: saved ? "#023B6A" : "#E2E8F0",
              color: saved ? "#ffffff" : "#64748B",
              transition: "background 0.2s",
            }}
          >
            {saved && <CheckCircleFilled />}
            {saved ? doneLabel : t("mfa.backup.checkFirst")}
          </button>
        )}
      </div>
    </ConfigProvider>
  );
}
