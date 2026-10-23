import { useTranslation } from "react-i18next";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

// Doit rester aligné avec PasswordPolicy.java (backend)
export const PASSWORD_MIN_LENGTH = 12;
const FORBIDDEN_WORDS = ["password", "motdepasse", "compulec", "azerty", "qwerty", "123456", "admin"];

export function getPasswordChecks(password, confirm, t) {
  const lower = password.toLowerCase();
  return [
    { label: t("login.newPassword.req1"), ok: password.length >= PASSWORD_MIN_LENGTH },
    { label: t("login.newPassword.req2"), ok: /[a-zA-Z]/.test(password) && /\d/.test(password) },
    { label: t("login.newPassword.req3"), ok: password.length > 0 && password === confirm },
    {
      label: t("login.newPassword.req4"),
      ok: password.length > 0 && !FORBIDDEN_WORDS.some((w) => lower.includes(w)),
    },
  ];
}

/**
 * Liste des règles du mot de passe avec jauge de force.
 */
export default function PasswordChecklist({ password, confirm }) {
  const { t } = useTranslation();
  const checks = getPasswordChecks(password, confirm, t);
  const strength = checks.filter((c) => c.ok).length;

  return (
    <div style={{ background: "#f7f9fc", border: "1.5px solid #e5eaf3", borderRadius: 10, padding: "16px 18px", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#023B6A" }}>{t("login.newPassword.reqTitle")}</span>
        <span style={{ fontSize: 12, color: "#a0aec0" }}>{t("login.newPassword.strength")} {strength}/4</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 999,
              background: i < strength ? (strength <= 1 ? "#ef4444" : strength <= 2 ? "#f59e0b" : "#10b981") : "#e2e8f0",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      {checks.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          {c.ok
            ? <CheckCircleFilled style={{ color: "#10b981", fontSize: 14 }} />
            : <CloseCircleFilled style={{ color: "#cbd5e1", fontSize: 14 }} />
          }
          <span style={{ fontSize: 12, color: c.ok ? "#374151" : "#9ca3af" }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
