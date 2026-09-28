import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Input, Button, Checkbox, Typography, Alert, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  EyeOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import loginBg from "../assets/login.png";
import logo from "../assets/image.png";
import logoMobile from "../assets/logo.png";
import {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
} from "../services/api/authApi";
import { setCredentials, setResetToken } from "../store/authSlice";

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
            Technology and infrastructure built to last.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 15, lineHeight: 1.75, maxWidth: 320 }}>
            Secure systems. Reliable operations. Built for long-term performance.
          </p>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 10, padding: "0 40px 32px" }}>
        <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 13 }}>
          COMPULEC SARL · Administration System
        </p>
      </div>
    </div>
  );
}

function RightPanel({ children }) {
  return (
    <div
      className="login-right-panel"
      style={{
        flex: 1,
        background: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 48px",
      }}
    >
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
  if (error.status === 404) return "No account found with this email.";
  if (error.status === 400) {
    const msgs = error.data?.errors;
    if (msgs && typeof msgs === "object") return Object.values(msgs).join(" ");
    return error.data?.message || "Invalid request.";
  }
  if (error.status === "FETCH_ERROR") return "Cannot reach the server. Please check your connection.";
  return "An unexpected error occurred. Please try again.";
}

// ── Sign In View ──────────────────────────────────────────────────────────────

function SignInView({ onForgotPassword }) {
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

      // result = ApiResponse<AuthResponse> → { success, message, data: { access_token, refresh_token, user, ... } }
      const authData = result.data ?? result;
      dispatch(setCredentials(authData));

      message.success(result.message || "Connexion réussie !");
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  return (
    <>
      <span style={taglineStyle}>COMPULEC ADMINISTRATION</span>
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
        Welcome back
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        Sign in to manage your website, projects, gallery and communications.
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
          label={<span style={labelStyle}>Email Address</span>}
          rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          style={{ marginBottom: 20 }}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#a0aec0" }} />}
            placeholder="compulec@gmail.com"
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={labelStyle}>Password</span>}
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
            <Checkbox style={{ color: "#023B6A", fontSize: 13 }}>Remember me</Checkbox>
          </Form.Item>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{ background: "none", border: "none", color: "#023B6A", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}
          >
            Forgot password?
          </button>
        </div>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && "Sign In"}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "#a0aec0", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <SafetyOutlined /> Your account and administrative data are protected
          </Text>
        </div>
      </Form>
    </>
  );
}

// ── Forgot Password View ──────────────────────────────────────────────────────

function ForgotPasswordView({ onBack, onCodeSent }) {
  const [form] = Form.useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [apiError, setApiError] = useState(null);
  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const result = await forgotPassword({ email: values.email }).unwrap();
      message.success(result.message || "Code de réinitialisation envoyé !");
      // Wait 1s then proceed to code verification
      setTimeout(() => onCodeSent(values.email), 1000);
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  return (
    <>
      <span style={taglineStyle}>ACCOUNT RECOVERY</span>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 36, color: "#023B6A", margin: "0 0 8px", lineHeight: 1.15 }}>
        Reset your password
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        Enter your email address and we'll send a 6-digit verification code.
      </p>

      {apiError && (
        <Alert type="error" message={apiError} showIcon closable onClose={() => setApiError(null)} style={{ marginBottom: 20, borderRadius: 8 }} />
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label={<span style={labelStyle}>Email Address</span>}
          rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          style={{ marginBottom: 28 }}
        >
          <Input prefix={<MailOutlined style={{ color: "#a0aec0" }} />} placeholder="compulec@gmail.com" style={inputStyle} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && "Send Verification Code"}
          </Button>
        </Form.Item>

        <button type="button" onClick={onBack} style={{ ...btnPrimaryStyle, background: "#fff", border: "1.5px solid #d9e0ea", color: "#023B6A" }}>
          Back to Sign In
        </button>
      </Form>
    </>
  );
}

// ── Verify Code View ──────────────────────────────────────────────────────────

function VerifyCodeView({ email, onVerified, onBack }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [verifyCode, { isLoading }] = useVerifyResetCodeMutation();
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      // Remove any formatting or array characters
      const codeStr = String(values.code).replace(/[^0-9]/g, "");
      const result = await verifyCode({ code: codeStr }).unwrap();
      // The backend returns a temporary access_token for the reset step
      const tempToken = result.data?.access_token ?? result.access_token;
      if (tempToken) {
        dispatch(setResetToken(tempToken));
      }
      message.success(result.message || "Code validé !");
      setTimeout(() => onVerified(), 1000);
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  return (
    <>
      <span style={taglineStyle}>ACCOUNT RECOVERY</span>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 36, color: "#023B6A", margin: "0 0 8px", lineHeight: 1.15 }}>
        Enter your code
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
        We sent a 6-digit code to:
      </p>
      <p style={{ color: "#023B6A", fontWeight: 700, fontSize: 15, marginBottom: 28 }}>{email}</p>

      {apiError && (
        <Alert type="error" message={apiError} showIcon closable onClose={() => setApiError(null)} style={{ marginBottom: 20, borderRadius: 8 }} />
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="code"
          label={<span style={labelStyle}>6-digit Verification Code</span>}
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.reject(new Error("Please enter the code"));
                // Remove anything that isn't a digit (handles commas if it's an array, or spaces if formatted)
                const str = String(value).replace(/[^0-9]/g, "");
                if (str.length === 6) return Promise.resolve();
                return Promise.reject(new Error("Code must be exactly 6 digits"));
              },
            },
          ]}
          style={{ marginBottom: 28 }}
        >
          <Input.OTP className="custom-otp" length={6} size="large" style={{ display: "flex", justifyContent: "center", gap: 8 }} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && "Verify Code"}
          </Button>
        </Form.Item>

        <button type="button" onClick={onBack} style={{ ...btnPrimaryStyle, background: "#fff", border: "1.5px solid #d9e0ea", color: "#023B6A" }}>
          Back
        </button>
      </Form>
    </>
  );
}

// ── New Password View ─────────────────────────────────────────────────────────

function NewPasswordView({ onSuccess }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [apiError, setApiError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const checks = [
    { label: "8 characters minimum", ok: password.length >= 8 },
    { label: "Contains letters and a number", ok: /[a-zA-Z]/.test(password) && /\d/.test(password) },
    { label: "Passwords match", ok: password.length > 0 && password === confirm },
    {
      label: "Avoid easily guessed information",
      ok: password.length >= 8 && !["password", "123456", "compulec"].some((w) => password.toLowerCase().includes(w)),
    },
  ];
  const strength = checks.filter((c) => c.ok).length;

  const handleSubmit = async (values) => {
    setApiError(null);
    try {
      const result = await resetPassword({
        newPassword: values.password,
        confirmNewPassword: values.confirm,
      }).unwrap();
      message.success(result.message || "Votre mot de passe a été réinitialisé avec succès !");
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setApiError(parseError(err));
    }
  };

  return (
    <>
      <span style={taglineStyle}>ACCOUNT RECOVERY</span>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 36, color: "#023B6A", margin: "0 0 8px", lineHeight: 1.15 }}>
        Create a new password
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        Choose a strong password to secure your COMPULEC administration account.
      </p>

      {apiError && (
        <Alert type="error" message={apiError} showIcon closable onClose={() => setApiError(null)} style={{ marginBottom: 20, borderRadius: 8 }} />
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item
          name="password"
          label={<span style={labelStyle}>New Password</span>}
          rules={[{ required: true, message: "Please enter a password" }]}
          style={{ marginBottom: 16 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
            placeholder="••••••••••"
            style={inputStyle}
            onChange={(e) => setPassword(e.target.value)}
            iconRender={(visible) => visible ? <EyeOutlined style={{ color: "#a0aec0" }} /> : <EyeInvisibleOutlined style={{ color: "#a0aec0" }} />}
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label={<span style={labelStyle}>Confirm New Password</span>}
          rules={[
            { required: true, message: "Please confirm your password" },
            () => ({
              validator(_, value) {
                if (!value || password === value) return Promise.resolve();
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
          style={{ marginBottom: 20 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
            placeholder="Re-enter new password"
            style={inputStyle}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Form.Item>

        {/* Strength checker */}
        <div style={{ background: "#f7f9fc", border: "1.5px solid #e5eaf3", borderRadius: 10, padding: "16px 18px", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#023B6A" }}>Your password should:</span>
            <span style={{ fontSize: 12, color: "#a0aec0" }}>Strength {strength}/4</span>
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

        <Form.Item style={{ marginBottom: 0 }}>
          <Button htmlType="submit" loading={isLoading} style={btnPrimaryStyle}>
            {!isLoading && "Update Password"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

// ── Password Updated View ─────────────────────────────────────────────────────

function PasswordUpdatedView({ onBackToLogin }) {
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
      <span style={taglineStyle}>PASSWORD UPDATED</span>
      <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 36, color: "#023B6A", margin: "0 0 12px", lineHeight: 1.2 }}>
        Your password has been updated
      </h2>
      <p style={{ color: "#6b7fa3", fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>
        Your password has been successfully changed. You can now sign in with your new password.
      </p>
      <button onClick={onBackToLogin} style={btnPrimaryStyle}>Continue to Sign In</button>
    </div>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────

export default function LoginPage({ currentView = "signin" }) {
  const navigate = useNavigate();
  // Local state for the forgot-password multi-step flow (email, then code)
  const [forgotEmail, setForgotEmail] = useState("");

  // "newpassword" view is reused for both the route-based flow (from URL)
  // and the internal step (after code verification from forgot-password).
  // We use an internal step state that overrides currentView if needed.
  const [internalStep, setInternalStep] = useState(null); // null | 'verify' | 'newpassword'

  const effectiveView = internalStep ?? currentView;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: "#fff" }}>
      <LeftPanel />
      <RightPanel>
        {/* Mobile logo */}
        <div className="login-mobile-header" style={{ display: "none", marginBottom: 32 }}>
          <img src={logoMobile} alt="COMPULEC" style={{ height: 70, objectFit: "contain" }} />
        </div>

        {effectiveView === "signin" && (
          <SignInView onForgotPassword={() => navigate("/forgot-password")} />
        )}

        {effectiveView === "forgot" && (
          <ForgotPasswordView
            onBack={() => navigate("/login")}
            onCodeSent={(email) => {
              setForgotEmail(email);
              setInternalStep("verify");
            }}
          />
        )}

        {effectiveView === "verify" && (
          <VerifyCodeView
            email={forgotEmail}
            onVerified={() => setInternalStep("newpassword")}
            onBack={() => setInternalStep(null)}
          />
        )}

        {effectiveView === "newpassword" && (
          <NewPasswordView onSuccess={() => {
            setInternalStep(null);
            navigate("/login");
          }} />
        )}
      </RightPanel>
    </div>
  );
}
