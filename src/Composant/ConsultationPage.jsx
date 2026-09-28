import { useState } from "react";
import PageHeader from "./PageHeader";
import { Form, Input, Select, Button, ConfigProvider, theme, message } from "antd";
import { useCreateConsultationMutation } from "../services/api/consultationApi";
import PhoneInput from "./PhoneInput";

export default function ConsultationPage({ t }) {
  const [form] = Form.useForm();
  const [createConsultation, { isLoading }] = useCreateConsultationMutation();

  /*
   * ---
   * Fallback de sécurité
   * ---
   * Si la traduction consultationPage n'existe pas encore
   * dans une langue, la page ne va plus planter.
   */
  const defaultContent = {
    headerTagline: "CONSULTATION",
    headerTitle: "Let's discuss your project",
    headerSubtitle:
      "Tell us about your needs and our team will get back to you.",

    form: {
      fullName: "Full Name *",
      company: "Company",
      email: "Email *",
      phone: "Phone *",
      serviceOfInterest: "Service of Interest",
      serviceOfInterestPlaceholder: "Select a service",
      services: [
        "Computer, IT Equipment & Consumables",
        "IT Infrastructure",
        "Cybersecurity & Audit",
        "Surveillance & Access Control",
        "Software Engineering",
        "Electrical & Solar Energy",
      ],
      projectDescription: "Project Description *",
      projectDescriptionPlaceholder:
        "Please describe your project, needs or requirements...",
      preferredContact: "Preferred Contact Method",
      preferredContactPlaceholder: "Select a contact method",
      contactMethods: ["Email", "Phone", "WhatsApp"],
      submit: "Request a Consultation",
    },
  };

  /*
   * Si t est undefined ou si consultationPage n'existe pas,
   * on utilise defaultContent.
   */
  const content = t?.consultationPage || defaultContent;

  /*
   * Même protection pour le formulaire.
   */
  const formContent = content?.form || defaultContent.form;

  /*
   * Protection supplémentaire pour les listes.
   */
  const services =
    Array.isArray(formContent.services) && formContent.services.length > 0
      ? formContent.services
      : defaultContent.form.services;

  const contactMethods =
    Array.isArray(formContent.contactMethods) &&
    formContent.contactMethods.length > 0
      ? formContent.contactMethods
      : defaultContent.form.contactMethods;

  const handleSubmit = async (values) => {
    try {
      await createConsultation(values).unwrap();
      message.success("Demande de consultation envoyée avec succès !");
      form.resetFields();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la consultation:", error);
      const serverErrors = error?.data?.errors;
      const serverMessage = error?.data?.message;
      if (serverErrors && typeof serverErrors === "object") {
        Object.values(serverErrors).forEach((errMsg) => {
          message.error(errMsg);
        });
      } else if (serverMessage) {
        message.error(serverMessage);
      } else {
        message.error("Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.");
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
      <PageHeader
        tagline={content.headerTagline}
        title={content.headerTitle}
        subtitle={content.headerSubtitle}
      />

      <section className="w-full bg-white py-16 px-4 sm:px-8 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto">
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
            >
              <div className="flex flex-col md:flex-row md:gap-8">
                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {String(formContent.fullName || "Full Name").replace(
                        " *",
                        "",
                      )}
                    </span>
                  }
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: "Please input your full name!",
                    },
                  ]}
                  className="flex-1"
                >
                  <Input className="border-slate-200" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {formContent.company || "Company"}
                    </span>
                  }
                  name="company"
                  className="flex-1"
                >
                  <Input className="border-slate-200" />
                </Form.Item>
              </div>

              <div className="flex flex-col md:flex-row md:gap-8">
                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {String(formContent.email || "Email").replace(" *", "")}
                    </span>
                  }
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                    {
                      type: "email",
                      message: "Invalid email format!",
                    },
                  ]}
                  className="flex-1"
                >
                  <Input type="email" className="border-slate-200" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-[13px] font-bold text-[#023B6A]">
                      {String(formContent.phone || "Phone").replace(" *", "")}
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

              <Form.Item
                label={
                  <span className="text-[13px] font-bold text-[#023B6A]">
                    {formContent.serviceOfInterest || "Service of Interest"}
                  </span>
                }
                name="serviceOfInterest"
                rules={[
                  {
                    required: true,
                    message: "Please select a service!",
                  },
                ]}
              >
                <Select
                  placeholder={formContent.serviceOfInterestPlaceholder}
                  className="border-slate-200 rounded-lg"
                  allowClear
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {services.map((service, idx) => (
                    <Select.Option key={`${service}-${idx}`} value={service}>
                      {service}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-[13px] font-bold text-[#023B6A]">
                    {String(formContent.projectDescription).replace(" *", "")}
                  </span>
                }
                name="projectDescription"
                rules={[
                  {
                    required: true,
                    message: "Please provide a project description!",
                  },
                  {
                    min: 10,
                    message: "La description doit contenir au moins 10 caractères",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder={formContent.projectDescriptionPlaceholder}
                  rows={6}
                  className="border-slate-200 resize-y"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-[13px] font-bold text-[#023B6A]">
                    {formContent.preferredContact}
                  </span>
                }
                name="preferredContact"
                rules={[
                  {
                    required: true,
                    message: "Please select a contact method!",
                  },
                ]}
              >
                <Select
                  placeholder={formContent.preferredContactPlaceholder}
                  className="border-slate-200 rounded-lg"
                  allowClear
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {contactMethods.map((method, idx) => (
                    <Select.Option key={`${method}-${idx}`} value={method}>
                      {method}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item className="pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="bg-amber-400 hover:bg-[#023B6A] text-[#023B6A] font-bold text-sm px-6 py-5 rounded-md border-none shadow-none"
                >
                  {formContent.submit}
                </Button>
              </Form.Item>
            </Form>
          </ConfigProvider>
        </div>
      </section>
    </div>
  );
}
