import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/authSlice";
import {
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Tag,
  Skeleton,
  message,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LockOutlined,
  GlobalOutlined,
  SaveOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useGetMyMfaQuery,
  useRegenerateBackupCodesMutation,
} from "../../../services/api/usersApi";
import BackupCodesList from "../../BackupCodesList";
import AvatarWithPopover from "../Users/AvatarWithPopover";

// ── Helper

const SectionHeader = ({ title, subtitle }) => {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: primary,
          margin: "0 0 4px",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 13,
          color: textSub,
          margin: 0,
        }}
      >
        {subtitle}
      </p>
      <div
        style={{
          height: 1,
          background: isDark ? "#334155" : "#F1F5F9",
          marginTop: 16,
        }}
      />
    </div>
  );
};

//  Tab: Profile

function ProfileTab({ user, loading }) {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const fullName = user ? `${user.prenom || ""} ${user.nom || ""}`.trim() : "—";
  const email = user?.email || "";

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div
      style={{
        maxWidth: 680,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* Avatar + Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "20px 24px",
          backgroundColor: bgCard,
          borderRadius: 16,
          border: `1px solid ${border}`,
        }}
      >
        <AvatarWithPopover name={fullName} email={email} size={72} />
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: textMain,
              marginBottom: 6,
            }}
          >
            {fullName}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag
              color="blue"
              style={{
                fontWeight: 600,
                borderRadius: 999,
                padding: "2px 12px",
              }}
            >
              {user?.role || t('admin.settings.administrator')}
            </Tag>
            <Tag
              color={user?.actif ? "success" : "default"}
              style={{
                fontWeight: 600,
                borderRadius: 999,
                padding: "2px 12px",
              }}
            >
              {user?.actif ? t('admin.settings.active') : t('admin.settings.inactive')}
            </Tag>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div>
        <SectionHeader
          title={t('admin.settings.accountInfo')}
          subtitle={t('admin.settings.accountInfoDesc')}
        />
        <Descriptions
          column={1}
          bordered
          size="middle"
          labelStyle={{
            fontWeight: 600,
            color: textSub,
            fontSize: 13,
            width: 130,
            background: isDark ? "#0F172A" : "#FAFAFA",
          }}
          contentStyle={{ fontSize: 13, color: primary, fontWeight: 600 }}
        >
          <Descriptions.Item label={t('admin.settings.firstName')}>
            {user?.prenom || "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t('admin.settings.lastName')}>
            {user?.nom || "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t('admin.settings.email')}>
            {user?.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t('admin.settings.phone')}>
            {user?.phone || "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t('admin.settings.function')}>
            {user?.fonction || "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t('admin.settings.role')}>
            <Tag
              color="blue"
              style={{
                borderRadius: 999,
                fontWeight: 600,
                padding: "2px 10px",
              }}
            >
              {user?.role || "—"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
}

//  Tab: Security (Change Password)

function SecurityTab() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    if (values.nouveauMotDePasse !== values.confirmNouveauMotDePasse) {
      form.setFields([
        {
          name: "confirmNouveauMotDePasse",
          errors: [t('admin.settings.passwordMismatch')],
        },
      ]);
      return;
    }
    try {
      const result = await changePassword({
        ancienMotDePasse: values.ancienMotDePasse,
        nouveauMotDePasse: values.nouveauMotDePasse,
        confirmNouveauMotDePasse: values.confirmNouveauMotDePasse,
      }).unwrap();
      // Les autres sessions sont fermées : on enregistre la nouvelle session renvoyée
      if (result.data?.access_token) dispatch(setCredentials(result.data));
      message.success(result.message || t('admin.settings.passwordSuccess'));
      form.resetFields();
    } catch (err) {
      const errMsg =
        err?.data?.message || t('admin.settings.passwordError');
      message.error(errMsg);
      if (errMsg.toLowerCase().includes("ancien")) {
        form.setFields([{ name: "ancienMotDePasse", errors: [errMsg] }]);
      }
    }
  };

  return (
    <div style={{ maxWidth: 540 }}>
      <SectionHeader
        title={t('admin.settings.securityTitle')}
        subtitle={t('admin.settings.securitySubtitle')}
      />

      <div
        style={{
          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: "28px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: isDark ? "rgba(56, 189, 248, 0.1)" : "#EFF6FF",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KeyOutlined style={{ color: primary, fontSize: 18 }} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: textMain,
              }}
            >
              {t('admin.settings.passwordUpdate')}
            </div>
            <div
              style={{
                fontSize: 12,
                color: textSub,
              }}
            >
              {t('admin.settings.passwordMinDesc')}
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="ancienMotDePasse"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                {t('admin.settings.currentPassword')}
              </span>
            }
            rules={[
              {
                required: true,
                message: t('admin.settings.enterCurrentRequired'),
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: textSub }} />}
              placeholder={t('admin.settings.currentPasswordPlaceholder')}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="nouveauMotDePasse"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                {t('admin.settings.newPassword')}
              </span>
            }
            rules={[
              {
                required: true,
                message: t('admin.settings.enterNewRequired'),
              },
              {
                min: 12,
                message: t('admin.settings.min8CharsRequired'),
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: textSub }} />}
              placeholder={t('admin.settings.newPasswordPlaceholder')}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="confirmNouveauMotDePasse"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                {t('admin.settings.confirmNewPassword')}
              </span>
            }
            rules={[
              {
                required: true,
                message: t('admin.settings.confirmNewRequired'),
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: textSub }} />}
              placeholder={t('admin.settings.confirmNewPasswordPlaceholder')}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Button
            htmlType="submit"
            size="large"
            loading={isLoading}
            icon={<SaveOutlined />}
            style={{
              padding: "10px 22px",
              border: "none",
              borderRadius: 10,
              backgroundColor: primary,
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 10px rgba(2,59,106,0.25)",
              transition: "background 0.15s",
            }}
          >
            {t('admin.settings.updatePassword')}
          </Button>
        </Form>
      </div>

      <MfaSection />
    </div>
  );
}

//  Bloc : double authentification (état + nouveaux codes de secours)

function MfaSection() {
  const isDark = useAdminTheme();
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { data } = useGetMyMfaQuery();
  const [regenerate, { isLoading }] = useRegenerateBackupCodesMutation();
  const [newCodes, setNewCodes] = useState(null);

  const status = data?.data;

  const handleSubmit = async (values) => {
    try {
      const result = await regenerate(String(values.code).replace(/[^0-9]/g, "")).unwrap();
      setNewCodes(result.data);
      form.resetFields();
      message.success(result.message);
    } catch (err) {
      message.error(err?.data?.message || t("mfa.settings.error"));
      form.resetFields();
    }
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: "28px 32px",
        marginTop: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <SafetyCertificateOutlined style={{ color: primary, fontSize: 22 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: textMain }}>{t("mfa.settings.title")}</div>
          <div style={{ fontSize: 12, color: textSub }}>{t("mfa.settings.subtitle")}</div>
        </div>
        {status && (
          <Tag color={status.enabled ? "success" : "error"} style={{ borderRadius: 999, fontWeight: 600 }}>
            {status.enabled ? t("mfa.settings.enabled") : t("mfa.settings.disabled")}
          </Tag>
        )}
      </div>

      {status && !status.enabled && (
        <p style={{ fontSize: 13, color: textSub, margin: 0 }}>{t("mfa.settings.notConfiguredHint")}</p>
      )}

      {status?.enabled && (
        <>
          <p style={{ fontSize: 13, color: status.remainingBackupCodes <= 2 ? "#DC2626" : textSub, marginBottom: 16 }}>
            {t("mfa.settings.remaining", { count: status.remainingBackupCodes })}
          </p>

          {newCodes ? (
            <BackupCodesList codes={newCodes} onDone={() => setNewCodes(null)} doneLabel={t("mfa.settings.close")} />
          ) : (
            <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
              <Form.Item
                name="code"
                label={<span style={{ fontSize: 13, fontWeight: 600, color: primary }}>{t("mfa.settings.codeLabel")}</span>}
                rules={[{ required: true, len: 6, message: t("mfa.codeInvalid") }]}
              >
                <Input.OTP length={6} size="large" />
              </Form.Item>
              <Button htmlType="submit" loading={isLoading} icon={<KeyOutlined />}
                style={{ borderRadius: 10, fontWeight: 700 }}>
                {t("mfa.settings.regenerate")}
              </Button>
            </Form>
          )}
        </>
      )}
    </div>
  );
}

//  Tab: Notifications

function NotificationsTab() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const { t } = useTranslation();

  const items = [
    {
      key: "msg",
      title: t('admin.settings.newMsgAlert'),
      desc: t('admin.settings.newMsgDesc'),
      defaultChecked: true,
    },
    {
      key: "chat",
      title: t('admin.settings.aiChatTransfers'),
      desc: t('admin.settings.aiChatDesc'),
      defaultChecked: true,
    },
    {
      key: "weekly",
      title: t('admin.settings.weeklySummary'),
      desc: t('admin.settings.weeklySummaryDesc'),
      defaultChecked: false,
    },
    {
      key: "consult",
      title: t('admin.settings.newConsult'),
      desc: t('admin.settings.newConsultDesc'),
      defaultChecked: true,
    },
  ];

  return (
    <div style={{ maxWidth: 620 }}>
      <SectionHeader
        title={t('admin.settings.notifTitle')}
        subtitle={t('admin.settings.notifSubtitle')}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
              border: `1px solid ${border}`,
              borderRadius: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: textMain,
                  marginBottom: 2,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: textSub,
                }}
              >
                {item.desc}
              </div>
            </div>
            <Switch
              defaultChecked={item.defaultChecked}
              style={{ flexShrink: 0, marginLeft: 16 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

//  Tab: General

function GeneralTab() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const { t } = useTranslation();

  return (
    <div
      style={{
        maxWidth: 620,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <SectionHeader
        title={t('admin.settings.generalTitle')}
        subtitle={t('admin.settings.generalSubtitle')}
      />

      <Form
        layout="vertical"
        requiredMark={false}
        initialValues={{
          companyName: "COMPULEC",
          supportEmail: "contact@compulec.com",
          address: "Douala, Cameroon",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Form.Item
            name="companyName"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                {t('admin.settings.companyName')}
              </span>
            }
          >
            <Input size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item
            name="supportEmail"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                {t('admin.settings.supportEmail')}
              </span>
            }
          >
            <Input size="large" type="email" style={{ borderRadius: 10 }} />
          </Form.Item>
        </div>
        <Form.Item
          name="address"
          label={
            <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
              {t('admin.settings.address')}
            </span>
          }
        >
          <Input.TextArea rows={3} style={{ borderRadius: 10 }} />
        </Form.Item>
      </Form>

      <div style={{ height: 1, background: isDark ? "#334155" : "#F1F5F9" }} />

      {/* <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: "#FFF7ED",
          border: "1px solid #FED7AA",
          borderRadius: 12,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#92400E",
              marginBottom: 2,
            }}
          >
            Maintenance Mode
          </div>
          <div style={{ fontSize: 12, color: "#B45309" }}>
            Temporarily disable access to the public website and show a
            maintenance page.
          </div>
        </div>
        <Switch style={{ flexShrink: 0, marginLeft: 16 }} />
      </div> */}
    </div>
  );
}

//  Main Component

export default function AdminSettings() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const { t } = useTranslation();

  const { data: userData, isLoading } = useGetCurrentUserQuery();
  const user = userData?.data ?? null;

  const tabItems = [
    {
      key: "profile",
      label: (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <UserOutlined /> {t('admin.settings.profile')}
        </span>
      ),
      children: <ProfileTab user={user} loading={isLoading} />,
    },
    {
      key: "general",
      label: (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <SettingOutlined /> {t('admin.settings.general')}
        </span>
      ),
      children: <GeneralTab />,
    },
    {
      key: "notifications",
      label: (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <BellOutlined /> {t('admin.settings.notifications')}
        </span>
      ),
      children: <NotificationsTab />,
    },
    {
      key: "security",
      label: (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          <LockOutlined /> {t('admin.settings.security')}
        </span>
      ),
      children: <SecurityTab />,
    },
  ];

  return (
    <div style={{ paddingBottom: 40, fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: primary,
            margin: "0 0 4px",
          }}
        >
          {t('admin.settings.title')}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: textSub,
            margin: 0,
          }}
        >
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "0 24px 24px",
        }}
      >
        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          tabPosition="top"
          size="large"
          style={{ minHeight: 520 }}
          tabBarStyle={{
            marginBottom: 24,
            paddingTop: 8,
          }}
        />
      </div>
    </div>
  );
}
