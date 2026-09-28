import { useState } from "react";
import PageHeader from "./PageHeader";
import { Form, Input, Button, ConfigProvider, theme, message } from "antd";
import { useCreateContactMutation } from "../services/api/contactApi";
import PhoneInput from "./PhoneInput";

export default function ContactPage({ t }) {
  const [form] = Form.useForm();
  const [createContact, { isLoading }] = useCreateContactMutation();

  const content = t.contactPage;
  const formContent = content.form;

  const handleSubmit = async (values) => {
    // Transformer les clés du formulaire (anglais) vers celles attendues par le backend (français)
    const payload = {
      nom: values.fullName,
      entreprise: values.company || "",
      email: values.email,
      telephone: values.phone,
      objet: values.subject,
      message: values.message,
    };

    try {
      await createContact(payload).unwrap();
      message.success("Message de contact envoyé avec succès !");
      form.resetFields();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      // Afficher les erreurs de validation du serveur
      const serverErrors = error?.data?.errors;
      const serverMessage = error?.data?.message;
      if (serverErrors && typeof serverErrors === "object") {
        // Afficher chaque erreur de validation du serveur
        Object.values(serverErrors).forEach((errMsg) => {
          message.error(errMsg);
        });
      } else if (serverMessage) {
        message.error(serverMessage);
      } else {
        message.error(
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        );
      }
    }
  };

  // Ant Design local light theme
  const lightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: "#ffe052",
      colorText: "#334155",
      colorTextPlaceholder: "#94a3b8",
      colorError: "#ef4444",
      controlHeight: 48,
      borderRadius: 8,
      colorBorder: "#cbd5e1",
    },
    components: {
      Input: {
        colorBgContainer: "#ffffff",
        colorBorder: "#cbd5e1",
        colorText: "#334155",
        colorTextPlaceholder: "#94a3b8",
      },
      Select: {
        colorBgContainer: "#ffffff",
        colorBorder: "#cbd5e1",
        colorText: "#334155",
        colorBgElevated: "#ffffff",
        optionSelectedBg: "#e8f0fe",
        optionActiveBg: "#f1f5f9",
        optionSelectedColor: "#023B6A",
      },
      Button: {
        colorPrimary: "#ffe052",
        colorPrimaryHover: "#fbd319",
        colorPrimaryActive: "#f0c800",
        primaryColor: "#023B6A",
        defaultColor: "#023B6A",
      },
    },
  };

  return (
    <div className="w-full bg-white min-h-screen font-['Outfit',sans-serif]">
      {/* ── PageHeader ── */}
      <PageHeader
        tagline={content.headerTagline}
        title={content.headerTitle}
        subtitle={content.headerSubtitle}
      />

      <section className="w-full bg-white py-16 px-4 sm:px-8 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {/* Map Card */}
          <div className="w-full border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Top Bar Location */}
            <div className="bg-[#e5e7eb] px-6 py-4 flex items-center gap-3">
              <svg
                width="18"
                height="22"
                viewBox="0 0 18 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 0C4.02944 0 0 4.02944 0 9C0 14.8711 7.6258 21.3653 8.35825 21.979C8.72911 22.2897 9.2711 22.2895 9.64175 21.979C10.3742 21.3653 18 14.8711 18 9C18 4.02944 13.9706 0 9 0ZM9 12.5C7.067 12.5 5.5 10.933 5.5 9C5.5 7.067 7.067 5.5 9 5.5C10.933 5.5 12.5 7.067 12.5 9C12.5 10.933 10.933 12.5 9 12.5Z"
                  fill="#023B6A"
                />
              </svg>
              <span className="text-[#023B6A] font-semibold text-sm leading-snug">
                {content.location}
              </span>
            </div>
            {/* Map Frame */}
            <div className="w-full h-[250px] bg-slate-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31835.611130327306!2d11.48834465!3d3.8291772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf7a309a6569%3A0x676e1a1768c85eb9!2sBiyem-Assi%2C%20Yaound%C3%A9!5e0!3m2!1sfr!2scm!4v1716301234567!5m2!1sfr!2scm"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Social Links Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <a
              href="#"
              className="flex justify-center items-center py-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 3C18.76 3 21 5.24 21 8V16C21 18.76 18.76 21 16 21H8C5.24 21 3 18.76 3 16V8C3 5.24 5.24 3 8 3H12H16Z"
                  stroke="#023B6A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z"
                  stroke="#023B6A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8.5C17.8284 8.5 18.5 7.82843 18.5 7C18.5 6.17157 17.8284 5.5 17 5.5C16.1716 5.5 15.5 6.17157 15.5 7C15.5 7.82843 16.1716 8.5 17 8.5Z"
                  fill="#023B6A"
                />
              </svg>
            </a>
            <a
              href="#"
              className="flex justify-center items-center py-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 1.5C6.195 1.5 1.5 6.225 1.5 12.06C1.5 17.325 5.34 21.705 10.365 22.5V15.12H7.695V12.06H10.365V9.735C10.365 7.08 11.94 5.625 14.325 5.625C15.48 5.625 16.68 5.835 16.68 5.835V8.43H15.36C14.055 8.43 13.65 9.24 13.65 10.08V12.06H16.56L16.095 15.12H13.65V22.5C18.675 21.705 22.515 17.34 22.515 12.06C22.515 6.225 17.82 1.5 12.015 1.5H12Z"
                  fill="#023B6A"
                />
              </svg>
            </a>
            <a
              href="#"
              className="flex justify-center items-center py-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1249_4229)">
                  <path
                    d="M14.2341 10.1625L22.9764 0H20.9046L13.3138 8.82375L7.25081 0H0.257812L9.42619 13.3433L0.257812 24H2.32969L10.3461 14.6818L16.7488 24H23.7418L14.2335 10.1625H14.2341ZM11.3964 13.4606L10.4674 12.132L3.07613 1.55962H6.25838L12.2229 10.092L13.1518 11.4206L20.9055 22.5112H17.7236L11.3964 13.4612V13.4606Z"
                    fill="#023B6A"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1249_4229">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a
              href="#"
              className="flex justify-center items-center py-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6002 5.82C15.9167 5.03953 15.5401 4.0374 15.5402 3H12.4502V15.4C12.4268 16.0712 12.1437 16.7071 11.6605 17.1735C11.1773 17.6399 10.5318 17.9004 9.86016 17.9C8.44016 17.9 7.26016 16.74 7.26016 15.3C7.26016 13.58 8.92016 12.29 10.6302 12.82V9.66C7.18016 9.2 4.16016 11.88 4.16016 15.3C4.16016 18.63 6.92016 21 9.85016 21C12.9902 21 15.5402 18.45 15.5402 15.3V9.01C16.7932 9.90985 18.2975 10.3926 19.8402 10.39V7.3C19.8402 7.3 17.9602 7.39 16.6002 5.82Z"
                  fill="#023B6A"
                />
              </svg>
            </a>
            <a
              href="#"
              className="flex justify-center items-center py-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.794 2.64199C18.474 3.54199 21.654 7.596 21.494 12.415C21.347 16.859 17.752 20.733 13.224 21.288C11.4055 21.5176 9.55941 21.2191 7.906 20.428C7.64161 20.3129 7.34765 20.2843 7.066 20.346C5.71 20.671 4.365 21.04 3.016 21.391C2.868 21.429 2.716 21.455 2.5 21.5C2.905 20.018 3.283 18.596 3.687 17.18C3.79 16.822 3.761 16.536 3.596 16.185C2.021 12.84 2.158 9.55799 4.304 6.52499C6.455 3.48299 9.491 2.18499 13.224 2.56499C13.4 2.58199 13.575 2.60699 13.794 2.64199ZM19.708 13.646C19.976 12.55 20.008 11.439 19.746 10.348C18.958 7.05999 16.912 4.929 13.586 4.25499C10.323 3.595 7.583 4.69499 5.65 7.39299C3.714 10.095 3.672 12.993 5.27 15.896C5.475 16.269 5.53 16.576 5.405 16.974C5.177 17.702 5 18.446 4.777 19.272C5.702 19.032 6.513 18.802 7.335 18.622C7.568 18.571 7.873 18.598 8.077 18.71C12.773 21.295 18.355 18.91 19.708 13.646Z"
                  fill="#023B6A"
                />
                <path
                  d="M9.74595 8.15798C9.92495 8.58498 10.0459 8.99798 10.2559 9.36098C10.5559 9.87898 10.4649 10.314 10.0509 10.679C9.60595 11.071 9.67195 11.404 9.99095 11.854C10.7259 12.89 11.6489 13.667 12.8139 14.176C13.1339 14.316 13.3769 14.34 13.5839 14.019C13.6699 13.887 13.7899 13.779 13.8899 13.655C14.4729 12.929 14.2899 12.935 15.2139 13.336C15.5049 13.463 15.7959 13.598 16.0649 13.764C16.3349 13.929 16.7449 14.099 16.7969 14.334C16.9149 14.854 16.7489 15.382 16.3149 15.768C15.5149 16.48 14.5949 16.598 13.5899 16.32C11.4159 15.72 9.74395 14.416 8.46295 12.61C8.01095 11.973 7.60695 11.266 7.35295 10.532C7.04495 9.63798 7.26295 8.77598 7.89895 8.01898C8.27395 7.57398 8.72895 7.47398 9.22395 7.59298C9.42295 7.64098 9.56195 7.93698 9.74595 8.15798Z"
                  fill="#023B6A"
                />
              </svg>
            </a>
          </div>

          {/* Form */}
          <ConfigProvider theme={lightTheme}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={(label, info) => (
                <>
                  {label}
                  {info.required && (
                    <span className="text-red-500 ml-1 font-bold">*</span>
                  )}
                </>
              )}
              className="flex flex-col gap-0 pt-4"
            >
              {/* Row 1: Full Name & Company */}
              <div className="flex flex-col md:flex-row md:gap-6">
                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {formContent.fullName.replace(" *", "")}
                    </span>
                  }
                  name="fullName"
                  rules={[
                    { required: true, message: "Please input your full name!" },
                  ]}
                  className="flex-1"
                >
                  <Input className="border-slate-200" />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {formContent.company}
                    </span>
                  }
                  name="company"
                  className="flex-1"
                >
                  <Input className="border-slate-200" />
                </Form.Item>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="flex flex-col md:flex-row md:gap-6">
                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {formContent.email.replace(" *", "")}
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Invalid email format!" },
                  ]}
                  className="flex-1"
                >
                  <Input type="email" className="border-slate-200" />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {formContent.phone.replace(" *", "")}
                    </span>
                  }
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Please input your phone number!",
                    },
                  ]}
                  className="flex-1"
                >
                  <PhoneInput className="border-slate-200" />
                </Form.Item>
              </div>

              {/* Row 3: Subject */}
              <Form.Item
                label={
                  <span className="text-[13px] font-bold text-[#023B6A]">
                    {formContent.subject.replace(" *", "")}
                  </span>
                }
                name="subject"
                rules={[{ required: true, message: "Please input a subject!" }]}
              >
                <Input className="border-slate-200" />
              </Form.Item>

              {/* Row 4: Message */}
              <Form.Item
                label={
                  <span className="text-[13px] font-bold text-[#023B6A]">
                    {formContent.message.replace(" *", "")}
                  </span>
                }
                name="message"
                rules={[
                  { required: true, message: "Please input your message!" },
                  {
                    min: 10,
                    message:
                      "Le message doit contenir au moins 10 caractères",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder={formContent.messagePlaceholder}
                  rows={6}
                  className="border-slate-200 resize-y"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item className="pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="bg-[#ffe052] hover:bg-[#fbd319] text-[#023B6A] font-bold text-sm px-6 py-5 rounded-md border-none shadow-none"
                >
                  {formContent.send}
                </Button>
              </Form.Item>
            </Form>
          </ConfigProvider>
        </div>
      </section>
    </div>
  );
}
