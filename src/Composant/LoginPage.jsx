import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Form, Input, Button, Checkbox, Typography, Alert, message, Select, ConfigProvider, theme, QRCode, Spin } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  EyeOutlined,
  KeyOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import loginBg from "../assets/login.png";
import logo from "../assets/image.png";
import logoMobile from "../assets/logo.png";
import {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  usePreviewInvitationMutation,
  useAcceptInvitationMutation,
  useVerifyMfaMutation,
  useStartMfaSetupMutation,
  useConfirmMfaSetupMutation,
} from "../services/api/authApi";
import BackupCodesList from "./BackupCodesList";
import { setCredentials } from "../store/authSlice";
import PasswordChecklist, { getPasswordChecks } from "./PasswordChecklist";

const { Text } = Typography;

const loginCSS = `
  @media (max-width: 767px) {
    .login-left-panel { display: none !important; }
    .login-mobile-header {
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px 24px 0;
    }
    .login-right-panel {
      padding: 24px 24px 40px !important;
      min-height: 100vh;
    }
  }
  @media (min-width: 768px) {
    .login-mobile-header { display: none !important; }
  }
  
  /* OTP Input overrides for permanent borders */
  .custom-otp input {
    border: 1.5px solid #d9e0ea !important;
    border-radius: 8px !important;
    background: #fff !important;
    color: #1a2b4a !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    outline: none !important;
  }
  .custom-otp input:hover,
  .custom-otp input:focus {
    border-color: #023B6A !important;
    box-shadow: 0 0 0 2px rgba(2, 59, 106, 0.1) !important;
  }
`;
if (typeof document !== "undefined") {
  const tag = document.getElementById("login-responsive-css");
  if (!tag) {
    const s = document.createElement("style");
    s.id = "login-responsive-css";
    s.textContent = loginCSS;
    document.head.appendChild(s);
  }
}

// ── Shared Styles ─────────────────────────────────────────────────────────────

const inputStyle = {
  height: 48,
  borderRadius: 8,
  border: "1.5px solid #d9e0ea",
  fontSize: 14,
  color: "#1a2b4a",
  background: "#fff",
};

const btnPrimaryStyle = {
  width: "100%",
  height: 50,
  background: "#023B6A",
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  cursor: "pointer",
  letterSpacing: "0.02em",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#023B6A",
  marginBottom: 6,
  display: "block",
};

const taglineStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.2em",
  color: "#023B6A",
  textTransform: "uppercase",
  marginBottom: 8,
  display: "block",
};

// ── Left Panel ─────────────────────────────────────────────────────────────

function LeftPanel() {
  const { t } = useTranslation();
  return (
    <div
      className="login-left-panel"
      style={{
        position: "relative",
        width: "42%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(180deg, rgba(1,18,45,0.97) 0%, rgba(2,35,80,0.80) 45%, rgba(1,18,45,0.95) 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 10, padding: "36px 40px 0" }}>
        <img src={logo} alt="COMPULEC" style={{ height: 60, objectFit: "contain" }} />
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
        }}
      >
        <div>
          <div
            style={{
              width: 56,
              height: 5,
              background: "#FFE052",
              borderRadius: 3,
              marginBottom: 24,
            }}
          />
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 3.2vw, 44px)",
              color: "#fff",
              lineHeight: 1.18,
              marginBottom: 20,
              letterSpacing: "-0.5px",
            }}
          >
            {t("login.leftPanel.title")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 15, lineHeight: 1.75, maxWidth: 320 }}>
            {t("login.leftPanel.subtitle")}
          </p>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: "0 40px 32px" }}>
        <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 13 }}>
          {t("login.leftPanel.adminSystem")}
        </p>
      </div>
    </div>
  );
}

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || "fr").split("-")[0].toUpperCase();

  return (
    <div style={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <Select
          value={currentLang}
          onChange={(val) => i18n.changeLanguage(val.toLowerCase())}
          options={[
            {
              value: "FR",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{t("login.lang.fr")}</span>
                  <span style={{ fontSize: 16 }}>🇫🇷</span>
                </div>
              )
            },
            {
              value: "EN",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{t("login.lang.en")}</span>
                  <span style={{ fontSize: 16 }}>🇬🇧</span>
                </div>
              )
            }
          ]}
          style={{ width: 130, background: "#f8fafc", borderRadius: 8 }}
          dropdownStyle={{ background: "#ffffff" }}
          bordered={false}
        />
      </ConfigProvider>
    </div>
  );
}

function RightPanel({ children }) {
  return (
    <div
      className="login-right-panel"
      style={{
        flex: 1,
        position: "relative",
        background: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 48px",
      }}
    >
      <LanguageSwitcher />
      <div style={{ width: "100%", maxWidth: 440 }}>{children}</div>
    </div>
  );
}

// ── Helper: parse backend error ───────────────────────────────────────────────

function parseError(error) {
  if (!error) return "An unexpected error occurred.";
  if (error.data?.message) return error.data.message;
  if (error.status === 401) return "Invalid email or password.";
  if (error.status === 403) return "Account is disabled or not active.";
  if (error.status === 423) return "Too many attempts. Please try again later.";
  if (error.status === 400) {
    const msgs = error.data?.errors;
    if (msgs && typeof msgs === "object") return Object.values(msgs).join(" ");
    return error.data?.message || "Invalid request.";
  }
  if (error.status === "FETCH_ERROR") return "Cannot reach the server. Please check your connection.";
  return "An unexpected error occurred. Please try again.";
}

// ── Sign In View ──────────────────────────────────────────────────────────────

function SignInView({ onForgotPassword, onMfaStep }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      const data = result.data ?? {};

      // 2FA activée sur ce compte : étape du code obligatoire, aucune session pour l'instant
      if (data.mfa_required) {
        onMfaStep({ token: data.mfa_token, setup: false });
        return;
      }

      // Pas de 2FA : la session est ouverte, on propose (facultatif) de l'activer
      dispatch(setCredentials(data));
      if (data.mfa_setup_available && data.mfa_token) {
        onMfaStep({ token: data.mfa_token, setup: true });
        return;
      }
      navigate("/admin");
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  return (
    <>
      <span style={taglineStyle}>{t("login.signIn.tagline")}</span>
      <h2
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color: "#023B6A",
          margin: "0 0 8px",
          lineHeight: 1.15,
        }}
      >
        {t("login.signIn.title")}
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        {t("login.signIn.desc")}
      </p>

      {apiError && (
        <Alert
          type="error"
          message={apiError}
          showIcon
          closable
          onClose={() => setApiError(null)}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label={<span style={labelStyle}>{t("login.signIn.emailLabel")}</span>}
          rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          style={{ marginBottom: 20 }}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#a0aec0" }} />}
            placeholder={t("login.signIn.emailPlaceholder")}
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={labelStyle}>{t("login.signIn.passwordLabel")}</span>}
          rules={[{ required: true, message: "Please enter your password" }]}
          style={{ marginBottom: 12 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
            placeholder="••••••••••"
            style={inputStyle}
            iconRender={(visible) =>
              visible ? (
                <EyeTwoTone twoToneColor="#a0aec0" />
              ) : (
                <EyeInvisibleOutlined style={{ color: "#a0aec0" }} />
              )
            }
          />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: "#023B6A", fontSize: 13 }}>{t("login.signIn.rememberMe")}</Checkbox>
          </Form.Item>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{ background: "none", border: "none", color: "#023B6A", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}
          >
            {t("login.signIn.forgotPassword")}
          </button>
        </div>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && t("login.signIn.btnSignIn")}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "#a0aec0", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <SafetyOutlined /> {t("login.signIn.protected")}
          </Text>
        </div>
      </Form>
    </>
  );
}

// ── Helper: lit le jeton placé dans le fragment (#) du lien reçu par e-mail ───
// Le fragment n'est jamais envoyé au serveur ; on l'efface de la barre d'adresse
// pour qu'il ne reste ni dans l'historique ni dans une capture d'écran.

function useHashToken() {
  const [token] = useState(() =>
    typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : ""
  );
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);
  return token;
}

const secondaryBtnStyle = { ...btnPrimaryStyle, background: "#fff", border: "1.5px solid #d9e0ea", color: "#023B6A" };

function PageTitle({ tagline, title, desc }) {
  return (
    <>
      <span style={taglineStyle}>{tagline}</span>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 36, color: "#023B6A", margin: "0 0 8px", lineHeight: 1.15 }}>
        {title}
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>{desc}</p>
    </>
  );
}

function ErrorAlert({ error, onClose }) {
  if (!error) return null;
  return <Alert type="error" message={error} showIcon closable onClose={onClose} style={{ marginBottom: 20, borderRadius: 8 }} />;
}

// Champs « nouveau mot de passe + confirmation » partagés (réinitialisation et activation)
function NewPasswordFields({ password, setPassword, confirm, setConfirm }) {
  const { t } = useTranslation();
  return (
    <>
      <Form.Item
        name="password"
        label={<span style={labelStyle}>{t("login.newPassword.passwordLabel")}</span>}
        rules={[
          { required: true, message: t("login.newPassword.required") },
          () => ({
            validator(_, value) {
              const ok = getPasswordChecks(value || "", value || "", t).every((c) => c.ok);
              return ok || !value ? Promise.resolve() : Promise.reject(new Error(t("login.newPassword.notStrong")));
            },
          }),
        ]}
        style={{ marginBottom: 16 }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
          placeholder="••••••••••••"
          autoComplete="new-password"
          style={inputStyle}
          onChange={(e) => setPassword(e.target.value)}
          iconRender={(visible) => visible ? <EyeOutlined style={{ color: "#a0aec0" }} /> : <EyeInvisibleOutlined style={{ color: "#a0aec0" }} />}
        />
      </Form.Item>

      <Form.Item
        name="confirm"
        label={<span style={labelStyle}>{t("login.newPassword.confirmLabel")}</span>}
        rules={[
          { required: true, message: t("login.newPassword.confirmRequired") },
          () => ({
            validator(_, value) {
              if (!value || password === value) return Promise.resolve();
              return Promise.reject(new Error(t("login.newPassword.mismatch")));
            },
          }),
        ]}
        style={{ marginBottom: 20 }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
          placeholder="••••••••••••"
          autoComplete="new-password"
          style={inputStyle}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Form.Item>

      <PasswordChecklist password={password} confirm={confirm} />
    </>
  );
}

// ── Forgot Password View ──────────────────────────────────────────────────────

function ForgotPasswordView({ onBack, onLinkSent }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      await forgotPassword({ email: values.email.trim() }).unwrap();
      onLinkSent(values.email.trim());
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  return (
    <>
      <PageTitle tagline={t("login.forgot.tagline")} title={t("login.forgot.title")} desc={t("login.forgot.desc")} />
      <ErrorAlert error={apiError} onClose={() => setApiError(null)} />

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label={<span style={labelStyle}>{t("login.signIn.emailLabel")}</span>}
          rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          style={{ marginBottom: 28 }}
        >
          <Input prefix={<MailOutlined style={{ color: "#a0aec0" }} />} placeholder={t("login.signIn.emailPlaceholder")} style={inputStyle} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && t("login.forgot.btnSend")}
          </Button>
        </Form.Item>

        <button type="button" onClick={onBack} style={secondaryBtnStyle}>
          {t("login.forgot.backToLogin")}
        </button>
      </Form>
    </>
  );
}

// ── Link Sent View ────────────────────────────────────────────────────────────

function LinkSentView({ email, onBack }) {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle tagline={t("login.forgot.tagline")} title={t("login.linkSent.title")} desc={t("login.linkSent.desc")} />
      <p style={{ color: "#023B6A", fontWeight: 700, fontSize: 15, marginTop: -16, marginBottom: 20 }}>{email}</p>
      <Alert type="info" showIcon message={t("login.linkSent.hint")} style={{ marginBottom: 28, borderRadius: 8 }} />
      <button type="button" onClick={onBack} style={secondaryBtnStyle}>
        {t("login.forgot.backToLogin")}
      </button>
    </>
  );
}

// ── New Password View (lien de réinitialisation) ──────────────────────────────

function NewPasswordView({ onSuccess, onRequestNewLink }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const token = useHashToken();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [apiError, setApiError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const result = await resetPassword({
        token,
        newPassword: values.password,
        confirmNewPassword: values.confirm,
      }).unwrap();
      message.success(result.message || t("login.newPassword.success"));
      onSuccess();
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  if (!token) {
    return (
      <>
        <PageTitle tagline={t("login.forgot.tagline")} title={t("login.invalidLink.title")} desc={t("login.invalidLink.resetDesc")} />
        <button type="button" onClick={onRequestNewLink} style={btnPrimaryStyle}>
          {t("login.invalidLink.newLink")}
        </button>
      </>
    );
  }

  return (
    <>
      <PageTitle tagline={t("login.forgot.tagline")} title={t("login.newPassword.title")} desc={t("login.newPassword.desc")} />
      <ErrorAlert error={apiError} onClose={() => setApiError(null)} />

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <NewPasswordFields password={password} setPassword={setPassword} confirm={confirm} setConfirm={setConfirm} />
        <Form.Item style={{ marginBottom: 12 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && t("login.newPassword.btnUpdate")}
          </Button>
        </Form.Item>
        <button type="button" onClick={onRequestNewLink} style={secondaryBtnStyle}>
          {t("login.invalidLink.newLink")}
        </button>
      </Form>
    </>
  );
}

// ── Activate Account View (invitation : lien + code de l'admin) ───────────────

function ActivateAccountView({ onActivated }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const token = useHashToken();
  const [previewInvitation] = usePreviewInvitationMutation();
  const [acceptInvitation, { isLoading }] = useAcceptInvitationMutation();
  const [preview, setPreview] = useState(null);
  const [linkError, setLinkError] = useState(token ? null : t("login.invalidLink.inviteDesc"));
  const [apiError, setApiError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!token) return;
    previewInvitation(token)
      .unwrap()
      .then((res) => setPreview(res.data))
      .catch((err) => setLinkError(parseError(err)));
  }, [token, previewInvitation]);

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const result = await acceptInvitation({
        token,
        code: String(values.code).replace(/[^0-9]/g, ""),
        password: values.password,
        confirmPassword: values.confirm,
      }).unwrap();
      message.success(result.message || t("login.activate.success"));
      onActivated();
    } catch (err) {
      const msg = parseError(err);
      // Invitation annulée (trop de codes faux) : on bascule sur l'écran « lien invalide »
      if (/annulée|invalide|expiré/i.test(msg)) setLinkError(msg);
      else setApiError(msg);
    }
  };

  if (linkError) {
    return (
      <>
        <PageTitle tagline={t("login.activate.tagline")} title={t("login.invalidLink.title")} desc={linkError} />
        <Alert type="info" showIcon message={t("login.invalidLink.askAdmin")} style={{ borderRadius: 8 }} />
      </>
    );
  }

  if (!preview) {
    return <PageTitle tagline={t("login.activate.tagline")} title={t("login.activate.checking")} desc="" />;
  }

  return (
    <>
      <PageTitle
        tagline={t("login.activate.tagline")}
        title={t("login.activate.title", { name: preview.prenom })}
        desc={t("login.activate.desc", { email: preview.maskedEmail })}
      />
      <ErrorAlert error={apiError} onClose={() => setApiError(null)} />

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="code"
          label={<span style={labelStyle}><KeyOutlined /> {t("login.activate.codeLabel")}</span>}
          extra={<span style={{ fontSize: 12, color: "#6b7fa3" }}>{t("login.activate.codeHelp")}</span>}
          rules={[
            {
              validator: (_, value) => {
                const str = String(value || "").replace(/[^0-9]/g, "");
                return str.length === 6 ? Promise.resolve() : Promise.reject(new Error(t("login.activate.codeInvalid")));
              },
            },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input.OTP className="custom-otp" length={6} size="large" style={{ display: "flex", justifyContent: "center", gap: 8 }} />
        </Form.Item>

        <NewPasswordFields password={password} setPassword={setPassword} confirm={confirm} setConfirm={setConfirm} />

        <Form.Item style={{ marginBottom: 0 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && t("login.activate.btn")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

// ── Password Updated / Account Activated View ─────────────────────────────────

function DoneView({ title, desc, onBackToLogin }) {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 72, height: 72, background: "#023B6A",
            clipPath: "polygon(50% 0%, 61% 10%, 75% 5%, 80% 19%, 95% 22%, 91% 37%, 100% 50%, 91% 63%, 95% 78%, 80% 81%, 75% 95%, 61% 90%, 50% 100%, 39% 90%, 25% 95%, 20% 81%, 5% 78%, 9% 63%, 0% 50%, 9% 37%, 5% 22%, 20% 19%, 25% 5%, 39% 10%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <PageTitle tagline={t("login.done.tagline")} title={title} desc={desc} />
      <button onClick={onBackToLogin} style={btnPrimaryStyle}>{t("login.done.continue")}</button>
    </div>
  );
}

// ── Code à 6 chiffres (2FA) ───────────────────────────────────────────────────

const otpRule = (t) => ({
  validator: (_, value) => {
    const str = String(value || "").replace(/[^0-9]/g, "");
    return str.length === 6 ? Promise.resolve() : Promise.reject(new Error(t("mfa.codeInvalid")));
  },
});

function isExpiredStep(err) {
  return err?.status === 401 && /expirée/i.test(err?.data?.message || "");
}

// ── MFA Verify View (connexion, étape 2) ──────────────────────────────────────

function MfaVerifyView({ mfaToken, onCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [verifyMfa, { isLoading }] = useVerifyMfaMutation();
  const [useBackup, setUseBackup] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const code = useBackup ? values.backup.trim() : String(values.code).replace(/[^0-9]/g, "");
      const result = await verifyMfa({ mfaToken, code }).unwrap();
      dispatch(setCredentials(result.data));
      message.success(result.message || t("mfa.success"));
      navigate("/admin");
    } catch (err) {
      if (isExpiredStep(err)) {
        message.warning(err.data.message);
        onCancel();
        return;
      }
      setApiError(parseError(err));
      form.resetFields(["code", "backup"]);
    }
  };

  return (
    <>
      <PageTitle tagline={t("mfa.tagline")} title={t("mfa.verify.title")} desc={useBackup ? t("mfa.verify.backupDesc") : t("mfa.verify.desc")} />
      <ErrorAlert error={apiError} onClose={() => setApiError(null)} />

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        {useBackup ? (
          <Form.Item
            name="backup"
            label={<span style={labelStyle}>{t("mfa.verify.backupLabel")}</span>}
            rules={[{ required: true, message: t("mfa.verify.backupRequired") }]}
            style={{ marginBottom: 24 }}
          >
            <Input placeholder="ABCD-EFGH" autoComplete="one-time-code" style={{ ...inputStyle, letterSpacing: 3, textTransform: "uppercase" }} />
          </Form.Item>
        ) : (
          <Form.Item
            name="code"
            label={<span style={labelStyle}><MobileOutlined /> {t("mfa.codeLabel")}</span>}
            rules={[otpRule(t)]}
            style={{ marginBottom: 24 }}
          >
            <Input.OTP className="custom-otp" length={6} size="large" autoFocus style={{ display: "flex", justifyContent: "center", gap: 8 }} />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 12 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && t("mfa.verify.btn")}
          </Button>
        </Form.Item>

        <button
          type="button"
          onClick={() => { setUseBackup(!useBackup); setApiError(null); }}
          style={{ background: "none", border: "none", color: "#023B6A", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 }}
        >
          {useBackup ? t("mfa.verify.useApp") : t("mfa.verify.useBackup")}
        </button>

        <button type="button" onClick={onCancel} style={secondaryBtnStyle}>
          {t("login.forgot.backToLogin")}
        </button>
      </Form>
    </>
  );
}

// ── MFA Offer View (après connexion sans 2FA : activer ou pas maintenant) ────

function MfaOfferView({ onActivate, onSkip }) {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle tagline={t("mfa.tagline")} title={t("mfa.offer.title")} desc={t("mfa.offer.desc")} />

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 28,
          fontSize: 13,
          lineHeight: 1.6,
          color: "#1E3A8A",
        }}
      >
        <MobileOutlined style={{ fontSize: 20, marginTop: 2 }} />
        <span>{t("mfa.offer.how")}</span>
      </div>

      <button type="button" onClick={onActivate} style={{ ...btnPrimaryStyle, marginBottom: 12 }}>
        {t("mfa.offer.activate")}
      </button>
      <button type="button" onClick={onSkip} style={secondaryBtnStyle}>
        {t("mfa.offer.later")}
      </button>
    </>
  );
}

// ── MFA Setup View (activation facultative, session déjà ouverte) ─────────────

function MfaSetupView({ mfaToken, onCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [startSetup] = useStartMfaSetupMutation();
  const [confirmSetup, { isLoading }] = useConfirmMfaSetupMutation();
  const [setup, setSetup] = useState(null);
  const [backupCodes, setBackupCodes] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Un seul secret par enrôlement (StrictMode exécute les effets deux fois en développement)
  const setupStarted = useRef(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;
    startSetup(mfaToken)
      .unwrap()
      .then((res) => setSetup(res.data))
      .catch((err) => {
        message.warning(parseError(err));
        onCancel();
      });
  }, [mfaToken, startSetup, onCancel]);

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const result = await confirmSetup({ mfaToken, code: String(values.code).replace(/[^0-9]/g, "") }).unwrap();
      dispatch(setCredentials(result.data));
      setBackupCodes(result.data.backup_codes || []);
    } catch (err) {
      if (isExpiredStep(err)) {
        message.warning(err.data.message);
        onCancel();
        return;
      }
      setApiError(parseError(err));
      form.resetFields(["code"]);
    }
  };

  if (backupCodes) {
    return (
      <>
        <PageTitle tagline={t("mfa.tagline")} title={t("mfa.backup.title")} desc={t("mfa.backup.desc")} />
        <BackupCodesList codes={backupCodes} onDone={() => navigate("/admin")} doneLabel={t("mfa.backup.continue")} />
      </>
    );
  }

  if (!setup) {
    return <div style={{ textAlign: "center", padding: 40 }}><Spin size="large" /></div>;
  }

  return (
    <>
      <PageTitle tagline={t("mfa.tagline")} title={t("mfa.setup.title")} desc={t("mfa.setup.desc")} />
      <ErrorAlert error={apiError} onClose={() => setApiError(null)} />

      <ol style={{ color: "#4a5b7a", fontSize: 13, lineHeight: 1.7, paddingLeft: 18, marginBottom: 20 }}>
        <li>{t("mfa.setup.step1")}</li>
        <li>{t("mfa.setup.step2")}</li>
        <li>{t("mfa.setup.step3")}</li>
      </ol>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {/* Couleurs forcées : sans cela le QR code hérite du thème sombre du site (modules presque blancs) */}
        <QRCode
          value={setup.otpauthUri}
          size={200}
          color="#000000"
          bgColor="transparent"
          bordered={false}
          errorLevel="M"
        />
        <span style={{ fontSize: 12, color: "#6b7fa3" }}>{t("mfa.setup.manual")}</span>
        <code style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#023B6A", wordBreak: "break-all", textAlign: "center", userSelect: "all" }}>
          {setup.secret.match(/.{1,4}/g).join(" ")}
        </code>
      </div>

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="code"
          label={<span style={labelStyle}><MobileOutlined /> {t("mfa.codeLabel")}</span>}
          rules={[otpRule(t)]}
          style={{ marginBottom: 24 }}
        >
          <Input.OTP className="custom-otp" length={6} size="large" style={{ display: "flex", justifyContent: "center", gap: 8 }} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && t("mfa.setup.btn")}
          </Button>
        </Form.Item>

        <button type="button" onClick={onCancel} style={secondaryBtnStyle}>
          {t("mfa.offer.later")}
        </button>
      </Form>
    </>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────

const loginTheme = {
  inherit: false,
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#023B6A",
    colorTextBase: "#1a2b4a",
    colorBgBase: "#ffffff",
    borderRadius: 8,
    fontFamily: "'Poppins', sans-serif",
  },
};

export default function LoginPage({ currentView = "signin" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sentToEmail, setSentToEmail] = useState(null);
  const [activated, setActivated] = useState(false);
  // Étape 2FA après un mot de passe correct : { token, setup, started }
  //  - setup=false : code exigé (2FA activée)
  //  - setup=true  : connecté, proposition facultative d'activer la 2FA
  const [mfaStep, setMfaStep] = useState(null);
  const cancelMfa = useCallback(() => setMfaStep(null), []);
  // Activation facultative : l'utilisateur est déjà connecté, « Pas maintenant » mène au tableau de bord
  const goToDashboard = useCallback(() => navigate("/admin"), [navigate]);

  return (
    // La page de connexion est claire : on n'hérite pas du thème sombre du site public
    // (sinon textes, alertes, cases à cocher et QR code s'affichent en blanc sur blanc).
    <ConfigProvider theme={loginTheme}>
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "#fff" }}>
      <LeftPanel />
      <RightPanel>
        {/* Mobile logo */}
        <div className="login-mobile-header" style={{ display: "none", marginBottom: 32 }}>
          <img src={logoMobile} alt="COMPULEC" style={{ height: 70, objectFit: "contain" }} />
        </div>

        {currentView === "signin" && !mfaStep && (
          <SignInView onForgotPassword={() => navigate("/forgot-password")} onMfaStep={setMfaStep} />
        )}

        {currentView === "signin" && mfaStep && !mfaStep.setup && (
          <MfaVerifyView mfaToken={mfaStep.token} onCancel={cancelMfa} />
        )}

        {currentView === "signin" && mfaStep?.setup && !mfaStep.started && (
          <MfaOfferView
            onActivate={() => setMfaStep({ ...mfaStep, started: true })}
            onSkip={goToDashboard}
          />
        )}

        {currentView === "signin" && mfaStep?.setup && mfaStep.started && (
          <MfaSetupView mfaToken={mfaStep.token} onCancel={goToDashboard} />
        )}

        {currentView === "forgot" && !sentToEmail && (
          <ForgotPasswordView onBack={() => navigate("/login")} onLinkSent={setSentToEmail} />
        )}

        {currentView === "forgot" && sentToEmail && (
          <LinkSentView email={sentToEmail} onBack={() => navigate("/login")} />
        )}

        {currentView === "newpassword" && (
          <NewPasswordView
            onSuccess={() => navigate("/password-updated", { replace: true })}
            onRequestNewLink={() => navigate("/forgot-password")}
          />
        )}

        {currentView === "updated" && (
          <DoneView
            title={t("login.done.passwordTitle")}
            desc={t("login.done.passwordDesc")}
            onBackToLogin={() => navigate("/login")}
          />
        )}

        {currentView === "activate" && !activated && (
          <ActivateAccountView onActivated={() => setActivated(true)} />
        )}

        {currentView === "activate" && activated && (
          <DoneView
            title={t("login.done.activatedTitle")}
            desc={t("login.done.activatedDesc")}
            onBackToLogin={() => navigate("/login", { replace: true })}
          />
        )}
      </RightPanel>
    </div>
    </ConfigProvider>
  );
}
