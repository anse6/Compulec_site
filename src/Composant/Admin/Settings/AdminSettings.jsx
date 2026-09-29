import React from "react";
import { useAdminTheme } from "../AdminThemeContext";
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
} from "@ant-design/icons";
import {
  useGetCurrentUserQuery,
  useChangePasswordMutation,
} from "../../../services/api/usersApi";
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
              {user?.role || "Administrator"}
            </Tag>
            <Tag
              color={user?.actif ? "success" : "default"}
              style={{
                fontWeight: 600,
                borderRadius: 999,
                padding: "2px 12px",
              }}
            >
              {user?.actif ? "Active" : "Inactive"}
            </Tag>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div>
        <SectionHeader
          title="Account Information"
          subtitle="Your account details registered in the system."
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
          <Descriptions.Item label="First Name">
            {user?.prenom || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {user?.nom || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user?.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {user?.phone || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Function">
            {user?.fonction || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
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

  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (values) => {
    if (values.nouveauMotDePasse !== values.confirmNouveauMotDePasse) {
      form.setFields([
        {
          name: "confirmNouveauMotDePasse",
          errors: ["Les mots de passe ne correspondent pas."],
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
      message.success(result.message || "Mot de passe modifié avec succès !");
      form.resetFields();
    } catch (err) {
      const errMsg =
        err?.data?.message || "Erreur lors du changement de mot de passe.";
      message.error(errMsg);
      if (errMsg.toLowerCase().includes("ancien")) {
        form.setFields([{ name: "ancienMotDePasse", errors: [errMsg] }]);
      }
    }
  };

  return (
    <div style={{ maxWidth: 540 }}>
      <SectionHeader
        title="Change Password"
        subtitle="Update your password to keep your account secure."
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
              Password Update
            </div>
            <div
              style={{
                fontSize: 12,
                color: textSub,
              }}
            >
              Minimum 8 characters required.
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
                Current Password
              </span>
            }
            rules={[
              {
                required: true,
                message: "Veuillez entrer votre mot de passe actuel.",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: textSub }} />}
              placeholder="Enter current password"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="nouveauMotDePasse"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                New Password
              </span>
            }
            rules={[
              {
                required: true,
                message: "Veuillez entrer un nouveau mot de passe.",
              },
              {
                min: 8,
                message: "Le mot de passe doit contenir au moins 8 caractères.",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: textSub }} />}
              placeholder="Enter new password"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            name="confirmNouveauMotDePasse"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                Confirm New Password
              </span>
            }
            rules={[
              {
                required: true,
                message: "Veuillez confirmer le nouveau mot de passe.",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: textSub }} />}
              placeholder="Confirm new password"
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
            Update Password
          </Button>
        </Form>
      </div>
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

  const items = [
    {
      key: "msg",
      title: "New Message Alerts",
      desc: "Receive an email when a new message is received via the contact form.",
      defaultChecked: true,
    },
    {
      key: "chat",
      title: "AI Chat Transfers",
      desc: "Receive an email when the AI assistant transfers a chat session to a human agent.",
      defaultChecked: true,
    },
    {
      key: "weekly",
      title: "Weekly Summary",
      desc: "Receive a weekly digest of website activity and new leads.",
      defaultChecked: false,
    },
    {
      key: "consult",
      title: "New Consultation Requests",
      desc: "Get notified when a new consultation request is submitted on the website.",
      defaultChecked: true,
    },
  ];

  return (
    <div style={{ maxWidth: 620 }}>
      <SectionHeader
        title="Notification Preferences"
        subtitle="Manage how and when you receive alerts from the system."
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
        title="General Settings"
        subtitle="Update the core information of your website."
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
                Company Name
              </span>
            }
          >
            <Input size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item
            name="supportEmail"
            label={
              <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>
                Support Email
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
              Physical Address
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
          <UserOutlined /> Profile
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
          <SettingOutlined /> General
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
          <BellOutlined /> Notifications
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
          <LockOutlined /> Security
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
          Settings
        </h1>
        <p
          style={{
            fontSize: 13,
            color: textSub,
            margin: 0,
          }}
        >
          Configure global preferences and options for the COMPULEC admin panel.
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
