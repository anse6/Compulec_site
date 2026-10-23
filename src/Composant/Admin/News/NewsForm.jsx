import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import {
  Form,
  Input,
  Button,
  Upload,
  Spin,
  Switch,
  message as antMessage,
} from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from "../../../services/api/newsApi";
import { BASE_IMG } from "../../../config";

const { TextArea } = Input;
const { Dragger } = Upload;

// Même logique que dans la liste des articles (évite /api/api/...)
function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

// --- Carte de section réutilisable (titre + description + séparateur + contenu) ---
function SectionCard({ title, desc, colors, children }) {
  const { bgCard, border, textMain, textSub } = colors;
  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm min-w-0"
      style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}
    >
      <div className="p-4 sm:p-6 pb-0">
        <h2
          className={`text-base sm:text-[18px] font-bold m-0 ${desc ? "mb-1" : "mb-4 sm:mb-5"}`}
          style={{ color: textMain }}
        >
          {title}
        </h2>
        {desc && (
          <p
            className="text-xs sm:text-[13px] m-0 mb-4 sm:mb-6"
            style={{ color: textSub }}
          >
            {desc}
          </p>
        )}
        {desc && (
          <div
            className="h-px -mx-4 sm:-mx-6 mb-4 sm:mb-6"
            style={{ backgroundColor: border }}
          />
        )}
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">{children}</div>
    </div>
  );
}

export default function NewsForm() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const bgSubtle = isDark ? "#0F172A" : "#F8FAFC";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const colors = { bgCard, border, textMain, textSub };

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const [newFile, setNewFile] = useState(null);
  const [existingImg, setExistingImg] = useState(null);
  const [publishNow, setPublishNow] = useState(false);

  const { data: articleData, isLoading: loadingDetail } =
    useGetArticleByIdQuery(id, { skip: !isEdit });
  const [createArticle, { isLoading: creating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: updating }] = useUpdateArticleMutation();

  const isSaving = creating || updating;

  // Pré-remplissage en édition / reset en création
  useEffect(() => {
    if (isEdit && articleData?.data) {
      const a = articleData.data;
      form.setFieldsValue({
        title: a.title,
        subtitle: a.subtitle,
        heading: a.heading,
        overview: a.overview,
      });
      setExistingImg(a.imageUrl || null);
      setPublishNow(!!a.published);
    } else if (!isEdit) {
      form.resetFields();
      setNewFile(null);
      setExistingImg(null);
    }
  }, [isEdit, articleData, form]);

  // Libère l'URL temporaire de l'aperçu (évite une fuite mémoire)
  useEffect(() => {
    return () => {
      if (newFile?.url) URL.revokeObjectURL(newFile.url);
    };
  }, [newFile]);

  const buildFormData = (values, publish) => {
    const fd = new FormData();
    if (values.title) fd.append("title", values.title);
    if (values.subtitle) fd.append("subtitle", values.subtitle);
    if (values.heading) fd.append("heading", values.heading);
    if (values.overview) fd.append("overview", values.overview);
    fd.append("published", publish);

    if (newFile) {
      fd.append("imageFile", newFile);
    } else if (existingImg) {
      fd.append("imageUrl", existingImg);
    }
    return fd;
  };

  // `publish` est passé explicitement : plus de dépendance à un state pas encore mis à jour
  const handleSubmit = async (values, publish = publishNow) => {
    try {
      const fd = buildFormData(values, publish);
      await (isEdit
        ? updateArticle({ id, formData: fd })
        : createArticle(fd)
      ).unwrap();

      antMessage.success(isEdit ? t("admin.news.updatedOk") : t("admin.news.createdOk"));
      setTimeout(() => navigate("/admin/news"), 800);
    } catch (err) {
      // Les erreurs de validation du backend sont en français : on ne les affiche qu'en français
      const serverMsg = i18n.language === "fr" ? err?.data?.message : null;
      antMessage.error(serverMsg || t("admin.news.saveError"));
    }
  };

  const submitWith = (publish) => {
    setPublishNow(publish);
    form
      .validateFields()
      .then((values) => handleSubmit(values, publish))
      .catch(() => {}); // erreurs de validation déjà affichées par le formulaire
  };

  if (isEdit && loadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[400px]">
        <Spin size="large" />
        <span style={{ color: textSub }}>{t("admin.news.loading")}</span>
      </div>
    );
  }

  const labelStyle = { color: primary };

  return (
    <div className="font-['Poppins'] pb-10 sm:pb-[60px] w-full min-w-0">
      {/* Top Bar */}
      <div className="mb-4 sm:mb-6">
        <div
          onClick={() => navigate("/admin/news")}
          className="inline-flex items-center gap-2 font-semibold cursor-pointer mb-3 sm:mb-4 hover:underline text-sm"
          style={{ color: primary }}
        >
          <ArrowLeftOutlined /> {t("admin.news.backToNews")}
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="min-w-0">
            <h1
              className="font-[800] text-[22px] sm:text-[26px] m-0 mb-1.5"
              style={{ color: textMain }}
            >
              {isEdit
                ? t("admin.news.editArticle")
                : t("admin.news.addArticle")}
            </h1>
            <p
              className="text-xs sm:text-[13px] m-0"
              style={{ color: textSub }}
            >
              {isEdit
                ? t("admin.news.editArticleDesc")
                : t("admin.news.addArticleDesc")}
            </p>
          </div>

          {/* Mobile : Annuler + Brouillon sur une ligne, Publier en pleine largeur
              Tablette+ : les 3 boutons alignés */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 shrink-0">
            <Button
              size="large"
              disabled={isSaving}
              className="rounded-lg font-semibold"
              style={{
                borderColor: border,
                color: textMain,
                backgroundColor: bgCard,
              }}
              onClick={() => navigate("/admin/news")}
            >
              {t("admin.common.cancel")}
            </Button>
            <Button
              size="large"
              icon={<SaveOutlined />}
              loading={isSaving && !publishNow}
              disabled={isSaving && publishNow}
              className="rounded-lg font-semibold"
              style={{
                borderColor: border,
                color: textMain,
                backgroundColor: bgCard,
              }}
              onClick={() => submitWith(false)}
            >
              {t("admin.news.saveDraft")}
            </Button>
            <Button
              size="large"
              icon={<CheckCircleOutlined />}
              loading={isSaving && publishNow}
              disabled={isSaving && !publishNow}
              className="col-span-2 sm:col-span-1 rounded-lg font-bold border-none"
              style={{
                background: "#FDE047",
                color: "#713F12",
                boxShadow: "0 2px 8px rgba(253,224,71,0.4)",
              }}
              onClick={() => submitWith(true)}
            >
              {t("admin.news.publishArticle")}
            </Button>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => handleSubmit(values)}
        requiredMark={false}
      >
        {/* Mobile/tablette : 1 colonne — Desktop large (xl) : contenu + colonne latérale */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-4 sm:gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 sm:gap-6 min-w-0">
            <SectionCard
              title={t("admin.news.articleInfo")}
              desc={t("admin.news.articleInfoDesc")}
              colors={colors}
            >
              <Form.Item
                name="title"
                label={
                  <span className="font-semibold" style={labelStyle}>
                    {t("admin.news.titleLabel")} *
                  </span>
                }
                rules={[{ required: true, whitespace: true, message: t("admin.news.required") }]}
              >
                <Input size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name="subtitle"
                label={
                  <span className="font-semibold" style={labelStyle}>
                    {t("admin.news.subtitle")} *
                  </span>
                }
                rules={[{ required: true, whitespace: true, message: t("admin.news.required") }]}
                className="!mb-0"
              >
                <Input size="large" className="rounded-lg" />
              </Form.Item>
            </SectionCard>

            <SectionCard
              title={t("admin.news.content")}
              desc={t("admin.news.contentDesc")}
              colors={colors}
            >
              <Form.Item
                name="heading"
                label={
                  <span className="font-semibold" style={labelStyle}>
                    {t("admin.news.headingLabel")} *
                  </span>
                }
                rules={[{ required: true, whitespace: true, message: t("admin.news.required") }]}
              >
                <Input
                  size="large"
                  className="rounded-lg"
                  placeholder={t("admin.news.headingPlaceholder")}
                />
              </Form.Item>
              <Form.Item
                name="overview"
                label={
                  <span className="font-semibold" style={labelStyle}>
                    {t("admin.news.overview")} *
                  </span>
                }
                rules={[{ required: true, whitespace: true, message: t("admin.news.required") }]}
                className="!mb-0"
              >
                <TextArea
                  autoSize={{ minRows: 5, maxRows: 14 }}
                  className="rounded-lg"
                />
              </Form.Item>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN : 2 colonnes sur tablette, 1 colonne sur mobile et xl */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6 items-start min-w-0">
            {/* Cover image */}
            <SectionCard title={t("admin.news.coverImage")} colors={colors}>
              <Dragger
                name="file"
                accept="image/*"
                multiple={false}
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!file.type.startsWith("image/")) {
                    antMessage.error(t("admin.news.imageOnly"));
                    return Upload.LIST_IGNORE;
                  }
                  file.url = URL.createObjectURL(file);
                  setNewFile(file);
                  setExistingImg(null); // remplace l'image existante
                  return false; // pas d'upload automatique
                }}
                className="rounded-xl overflow-hidden"
                style={{ borderColor: border, backgroundColor: bgSubtle }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: textSub }} />
                </p>
                <p
                  className="ant-upload-text font-semibold px-2"
                  style={{ color: textMain }}
                >
                  {t("admin.news.uploadDesc")}
                </p>
                <p
                  className="ant-upload-hint text-[13px] px-2"
                  style={{ color: textSub }}
                >
                  {t("admin.news.uploadHint")}
                </p>
              </Dragger>

              {/* Aperçu */}
              {newFile || existingImg ? (
                <div className="mt-4 sm:mt-5">
                  <div
                    className="flex items-center justify-between gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: bgSubtle,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={newFile ? newFile.url : getImageUrl(existingImg)}
                        alt={t("admin.news.coverImage")}
                        className="w-16 h-12 shrink-0 object-cover rounded-md"
                        style={{ border: `1px solid ${border}` }}
                      />
                      <span
                        className="text-[12px] font-medium truncate min-w-0"
                        style={{ color: textSub }}
                      >
                        {newFile ? newFile.name : t("admin.news.coverImage")}
                      </span>
                    </div>
                    <DeleteOutlined
                      className="text-red-500 cursor-pointer p-2 hover:bg-red-50 rounded-md shrink-0"
                      onClick={() => {
                        setNewFile(null);
                        setExistingImg(null);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="mt-4 text-[12px] flex items-center gap-2"
                  style={{ color: textSub }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ border: `1px solid ${border}` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: border }}
                    />
                  </div>
                  {t("admin.news.noImage")}
                </div>
              )}
            </SectionCard>

            {/* Visibilité */}
            <SectionCard title={t("admin.projects.visibility")} colors={colors}>
              <div
                className="flex justify-between items-center gap-3 p-3 sm:p-4 rounded-lg"
                style={{
                  backgroundColor: bgSubtle,
                  border: `1px solid ${border}`,
                }}
              >
                <span
                  className="font-semibold text-[14px]"
                  style={{ color: textMain }}
                >
                  {publishNow
                    ? t("admin.news.published")
                    : t("admin.news.draft")}
                </span>
                <Switch
                  checked={publishNow}
                  onChange={setPublishNow}
                  style={{ backgroundColor: publishNow ? primary : undefined }}
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </Form>
    </div>
  );
}
