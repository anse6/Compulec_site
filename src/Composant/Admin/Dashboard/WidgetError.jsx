import React from "react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

/** Message d'erreur commun aux widgets du dashboard, avec bouton « Réessayer ». */
export default function WidgetError({ onRetry, color = "#94A3B8" }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "40px 16px",
        color,
        fontSize: 13,
        textAlign: "center",
        height: "100%",
      }}
    >
      {t("admin.dashboard.loadError")}
      {onRetry && (
        <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
          {t("admin.dashboard.retry")}
        </Button>
      )}
    </div>
  );
}
