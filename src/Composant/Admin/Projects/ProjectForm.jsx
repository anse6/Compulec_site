import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import { Form, Input, Select, Button, Upload, Spin, message, Grid } from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProjetByIdQuery,
  useCreateProjetMutation,
  useUpdateProjetMutation,
} from "../../../services/api/projetApi";
import { BASE_IMG } from "./../../../config";
import {
  SERVICE_CATEGORIES,
  SECTORS,
  findCategory,
  joinServices,
  splitServices,
  toOptions,
} from "../../../services/projectCatalog";
import LocationPicker from "./LocationPicker";

const { TextArea } = Input;
const { Dragger } = Upload;

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img.startsWith("/") ? img : `/${img}`}`;
}

// ── Tag list editor (besoins / technologies)

function TagListEditor({ label, value = [], onChange }) {
  const isDark = useAdminTheme();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const border = isDark ? "#334155" : "#E2E8F0";
  const bgCard = isDark ? "#1E293B" : "#ffffff";

  const [inputValue, setInputValue] = useState("");

  const add = () => {
    const val = inputValue.trim();
    if (val && !value.includes(val)) {
      onChange([...value, val]);
      setInputValue("");
    }
  };

  const remove = (item) => onChange(value.filter((v) => v !== item));

  return (
    <div style={{ marginBottom: 24 }}>
      <span
        style={{
          display: "block",
          fontWeight: 600,
          color: primary,
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}
      >
        {value.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: bgCard,
              border: `1px solid ${border}`,
              borderRadius: 8,
              padding: "4px 10px 4px 12px",
              maxWidth: "100%",
            }}
          >
            <span
              style={{ fontSize: 13, color: textMain, wordBreak: "break-word" }}
            >
              {item}
            </span>
            <DeleteOutlined
              onClick={() => remove(item)}
              style={{
                color: "var(--ant-color-error)",
                cursor: "pointer",
                fontSize: 11,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type and press Add…"
          style={{
            borderRadius: 8,
            flex: 1,
            maxWidth: isMobile ? "100%" : 280,
            minWidth: 0,
          }}
          onPressEnter={(e) => {
            e.preventDefault();
            add();
          }}
        />
        <Button
          type="primary"
          style={{ background: "#2563EB", borderRadius: 8, flexShrink: 0 }}
          onClick={add}
        >
          + Add
        </Button>
      </div>
    </div>
  );
}

/**
 * Wrapper pour utiliser TagListEditor avec Form.Item (qui passe value/onChange)
 */
function TagListEditorWrapper({ label, value, onChange }) {
  return (
    <TagListEditor label={label} value={value || []} onChange={onChange} />
  );
}

// ── Main form

export default function ProjectForm() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "fr").startsWith("en") ? "en" : "fr";
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();

  // Listes dépendantes : les services proposés sont ceux de la catégorie choisie
  const selectedCategory = Form.useWatch("categorie", form);
  const selectedServices = Form.useWatch("service", form) || [];
  const selectedSector = Form.useWatch("secteur", form);
  const latitude = Form.useWatch("latitude", form);
  const longitude = Form.useWatch("longitude", form);

  const categoryOptions = toOptions(SERVICE_CATEGORIES, lang, [selectedCategory]);
  const serviceOptions = toOptions(findCategory(selectedCategory)?.services || [], lang, selectedServices);
  const sectorOptions = toOptions(SECTORS, lang, [selectedSector]);

  const [newFiles, setNewFiles] = useState([]);
  const [existingImgs, setExistingImgs] = useState([]);
  const [publishNow, setPublishNow] = useState(false);

  const { data: projetData, isLoading: loadingDetail } = useGetProjetByIdQuery(
    id,
    { skip: !isEdit },
  );
  const [createProjet, { isLoading: creating }] = useCreateProjetMutation();
  const [updateProjet, { isLoading: updating }] = useUpdateProjetMutation();

  const isSaving = creating || updating;

  // ── Styles responsive réutilisables
  const cardPad = isMobile ? 16 : 24;
  const grid2 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: isMobile ? 0 : 16,
  };
  const sectionHeader = (title, desc) => (
    <div style={{ padding: `${cardPad}px ${cardPad}px 0` }}>
      <h2
        style={{
          fontSize: isMobile ? 16 : 18,
          fontWeight: 700,
          color: textMain,
          margin: "0 0 4px",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 13, color: textSub, margin: "0 0 24px" }}>{desc}</p>
      <div
        style={{
          height: 1,
          background: "#EEF2F7",
          margin: `0 -${cardPad}px 24px`,
        }}
      />
    </div>
  );
  const cardStyle = {
    backgroundColor: bgCard,
    border: `1px solid ${border}`,
    borderRadius: 12,
    minWidth: 0,
  };
  const labelStyle = { fontWeight: 600, color: primary };

  // ── Pre-fill form in edit mode
  useEffect(() => {
    if (isEdit && projetData?.data) {
      const p = projetData.data;
      form.setFieldsValue({
        titre: p.titre,
        sousTitre: p.sousTitre,
        categorie: p.categorie,
        service: splitServices(p.service),
        clientName: p.clientName,
        secteur: p.secteur,
        localisation: p.localisation,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        status: p.status,
        overview: p.overview,
        contexte: p.contexte,
        besoins: p.besoins || [],
        solution: p.solution,
        technologies: p.technologies || [],
        resultat: p.resultat,
      });
      setExistingImgs(p.images || []);
      setPublishNow(p.publie);
    } else if (!isEdit) {
      form.resetFields();
      setNewFiles([]);
      setExistingImgs([]);
    }
  }, [isEdit, projetData, form]);

  // ── Build FormData
  function buildFormData(values) {
    const fd = new FormData();

    const appendIfNotEmpty = (key, val) => {
      if (val !== undefined && val !== null && val !== "") fd.append(key, val);
    };

    appendIfNotEmpty("titre", values.titre);
    appendIfNotEmpty("sousTitre", values.sousTitre || "");
    appendIfNotEmpty("categorie", values.categorie);
    appendIfNotEmpty("service", joinServices(values.service));
    appendIfNotEmpty("clientName", values.clientName || "");
    appendIfNotEmpty("secteur", values.secteur);
    appendIfNotEmpty("localisation", values.localisation);
    if (values.latitude != null && values.longitude != null) {
      fd.append("latitude", String(values.latitude));
      fd.append("longitude", String(values.longitude));
    }
    appendIfNotEmpty("status", values.status || "Planned");
    appendIfNotEmpty("overview", values.overview);
    appendIfNotEmpty("contexte", values.contexte);
    appendIfNotEmpty("solution", values.solution);
    appendIfNotEmpty("resultat", values.resultat);

    (values.besoins || []).forEach((b) => fd.append("besoins", b));
    (values.technologies || []).forEach((t) => fd.append("technologies", t));

    newFiles.forEach((file) => fd.append("images", file));

    return fd;
  }

  // ── Submit
  const handleSubmit = async (values) => {
    try {
      const fd = buildFormData(values);
      let result;

      if (isEdit) {
        result = await updateProjet({ id, formData: fd }).unwrap();
      } else {
        result = await createProjet(fd).unwrap();
      }

      message.success(
        result.message || (isEdit ? "Projet mis à jour !" : "Projet créé !"),
      );
      setTimeout(() => navigate("/admin/projects"), 800);
    } catch (err) {
      message.error(err?.data?.message || "Une erreur est survenue.");
    }
  };

  if (isEdit && loadingDetail) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
        }}
      >
        <Spin size="large" tip="Chargement du projet…" />
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        paddingBottom: 60,
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Top Bar */}
      <div style={{ marginBottom: 24 }}>
        <div
          onClick={() => navigate("/admin/projects")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: primary,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <ArrowLeftOutlined /> {t("admin.projects.back")}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "flex-start",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontWeight: 800,
                fontSize: isMobile ? 22 : 26,
                color: textMain,
                margin: "0 0 6px",
              }}
            >
              {isEdit
                ? t("admin.projects.editProject")
                : t("admin.projects.addProject")}
            </h1>
            <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
              {t("admin.projects.addProjectDesc")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Button
              size="large"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                borderColor: border,
                flex: isMobile ? "1 1 45%" : undefined,
              }}
              onClick={() => navigate("/admin/projects")}
            >
              {t("admin.common.cancel")}
            </Button>
            <Button
              size="large"
              icon={<SaveOutlined />}
              loading={isSaving}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                borderColor: border,
                flex: isMobile ? "1 1 45%" : undefined,
              }}
              onClick={() => {
                setPublishNow(false);
                form.submit();
              }}
            >
              {t("admin.projects.saveDraft")}
            </Button>
            <Button
              size="large"
              icon={<CheckCircleOutlined />}
              loading={isSaving}
              onClick={() => {
                setPublishNow(true);
                form.submit();
              }}
              style={{
                borderRadius: 8,
                fontWeight: 700,
                background: "#FDE047",
                color: "#713F12",
                border: "none",
                boxShadow: "0 2px 8px rgba(253,224,71,0.4)",
                flex: isMobile ? "1 1 100%" : undefined,
              }}
            >
              {t("admin.projects.publishProject")}
            </Button>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "minmax(0, 1fr)"
              : "minmax(0, 1fr) 380px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── LEFT COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              minWidth: 0,
            }}
          >
            {/* Project Identity */}
            <div style={cardStyle}>
              {sectionHeader(
                t("admin.projects.projectIdentity"),
                t("admin.projects.projectIdentityDesc"),
              )}
              <div style={{ padding: `0 ${cardPad}px ${cardPad}px` }}>
                <Form.Item
                  name="titre"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.projectTitle")} *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item
                  name="sousTitre"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.projectSubtitle")}
                    </span>
                  }
                >
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>

                <div style={grid2}>
                  <Form.Item
                    name="categorie"
                    label={
                      <span style={labelStyle}>
                        {t("admin.projects.category")} *
                      </span>
                    }
                    rules={[{ required: true, message: t("admin.projects.selectRequired") }]}
                  >
                    <Select
                      size="large"
                      style={{ width: "100%" }}
                      placeholder={t("admin.projects.categoryPlaceholder")}
                      options={categoryOptions}
                      showSearch
                      optionFilterProp="label"
                      // Changer de catégorie vide les services, qui dépendent de la catégorie
                      onChange={() => form.setFieldsValue({ service: [] })}
                    />
                  </Form.Item>
                  <Form.Item
                    name="service"
                    label={
                      <span style={labelStyle}>
                        {t("admin.projects.services")} *
                      </span>
                    }
                    rules={[{ required: true, type: "array", min: 1, message: t("admin.projects.servicesRequired") }]}
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      style={{ width: "100%" }}
                      disabled={!selectedCategory}
                      placeholder={
                        selectedCategory
                          ? t("admin.projects.servicesPlaceholder")
                          : t("admin.projects.servicesChooseCategory")
                      }
                      options={serviceOptions}
                      optionFilterProp="label"
                      maxTagCount="responsive"
                    />
                  </Form.Item>
                </div>

                <div style={grid2}>
                  <Form.Item
                    name="clientName"
                    label={
                      <span style={labelStyle}>
                        {t("admin.projects.clientName")}
                      </span>
                    }
                  >
                    <Input size="large" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item
                    name="secteur"
                    label={
                      <span style={labelStyle}>
                        {t("admin.projects.sector")} *
                      </span>
                    }
                    rules={[{ required: true, message: t("admin.projects.selectRequired") }]}
                  >
                    <Select
                      size="large"
                      style={{ width: "100%" }}
                      placeholder={t("admin.projects.sectorPlaceholder")}
                      options={sectorOptions}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </div>

                <div style={grid2}>
                  <Form.Item
                    name="status"
                    label={
                      <span style={labelStyle}>
                        {t("admin.projects.status")}
                      </span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <Select size="large" style={{ width: "100%" }}>
                      <Select.Option value="Planned">
                        {t("admin.projects.status_planned")}
                      </Select.Option>
                      <Select.Option value="In progress">
                        {t("admin.projects.status_progress")}
                      </Select.Option>
                      <Select.Option value="Completed">
                        {t("admin.projects.status_completed")}
                      </Select.Option>
                      <Select.Option value="On Hold">
                        {t("admin.projects.status_onhold")}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                {/* Localisation : choisie sur la carte, l'adresse s'affiche et est enregistrée */}
                <Form.Item name="latitude" hidden><Input /></Form.Item>
                <Form.Item name="longitude" hidden><Input /></Form.Item>
                <Form.Item
                  name="localisation"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.location")} *
                    </span>
                  }
                  rules={[{ required: true, whitespace: true, message: t("admin.projects.map.required") }]}
                  style={{ marginTop: 24, marginBottom: 0 }}
                >
                  <LocationPicker
                    coords={{ lat: latitude ?? null, lng: longitude ?? null }}
                    onCoordsChange={({ lat, lng }) => form.setFieldsValue({ latitude: lat, longitude: lng })}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Project Narrative */}
            <div style={cardStyle}>
              {sectionHeader(
                t("admin.projects.projectOverview"),
                t("admin.projects.projectOverviewDesc"),
              )}
              <div style={{ padding: `0 ${cardPad}px ${cardPad}px` }}>
                <Form.Item
                  name="overview"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.projectOverview")} *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item
                  name="contexte"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.context")} *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>

                {/* Besoins */}
                <Form.Item name="besoins" noStyle>
                  <TagListEditorWrapper label={t("admin.projects.theNeed")} />
                </Form.Item>

                <Form.Item
                  name="solution"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.solutionImplemented")} *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>

                {/* Technologies */}
                <Form.Item name="technologies" noStyle>
                  <TagListEditorWrapper
                    label={t("admin.projects.technologyUsed")}
                  />
                </Form.Item>

                <Form.Item
                  name="resultat"
                  label={
                    <span style={labelStyle}>
                      {t("admin.projects.result")} *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                  style={{ marginBottom: 0 }}
                >
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              minWidth: 0,
            }}
          >
            {/* Images */}
            <div style={cardStyle}>
              {sectionHeader(
                t("admin.projects.projectImages"),
                t("admin.projects.imagesDesc"),
              )}
              <div style={{ padding: `0 ${cardPad}px ${cardPad}px` }}>
                <Dragger
                  name="file"
                  multiple
                  listType="picture"
                  beforeUpload={(file) => {
                    file.url = URL.createObjectURL(file);
                    setNewFiles((prev) => [...prev, file]);
                    return false;
                  }}
                  onRemove={(file) => {
                    if (file.url) URL.revokeObjectURL(file.url);
                    setNewFiles((prev) =>
                      prev.filter((f) => f.uid !== file.uid),
                    );
                  }}
                  fileList={newFiles}
                  style={{
                    backgroundColor: bgCard,
                    borderColor: border,
                    borderRadius: 12,
                    padding: isMobile ? "8px 0" : undefined,
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: textSub }} />
                  </p>
                  <p
                    className="ant-upload-text"
                    style={{
                      color: textMain,
                      fontWeight: 600,
                      fontSize: isMobile ? 14 : undefined,
                      padding: "0 8px",
                    }}
                  >
                    {t("admin.projects.addImagesOrVideos")}
                  </p>
                  <p
                    className="ant-upload-hint"
                    style={{ color: textSub, fontSize: 13 }}
                  ></p>
                </Dragger>

                {/* Existing images in edit mode */}
                {existingImgs.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginTop: 20,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, fontWeight: 600, color: textSub }}
                    >
                      {t("admin.projects.existingImages")}
                    </span>
                    {existingImgs.map((img, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          padding: "10px 12px",
                          border: `1px solid ${border}`,
                          borderRadius: 8,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt="cover"
                            style={{
                              width: isMobile ? 72 : 60,
                              height: isMobile ? 48 : 40,
                              borderRadius: 4,
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: textSub,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {i === 0
                              ? t("admin.projects.cover")
                              : `${t("admin.projects.imageX")} ${i + 1}`}
                          </span>
                        </div>
                        <DeleteOutlined
                          style={{
                            color: "var(--ant-color-error)",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: 6,
                            flexShrink: 0,
                          }}
                          onClick={() =>
                            setExistingImgs((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visibility info */}
            <div style={{ ...cardStyle, padding: cardPad }}>
              <h2
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                  color: textMain,
                  margin: "0 0 16px",
                }}
              >
                {t("admin.projects.visibility")}
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  border: `1px solid ${border}`,
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: textMain,
                      fontSize: 14,
                    }}
                  >
                    {publishNow
                      ? t("admin.projects.publish")
                      : t("admin.projects.draft")}
                  </span>
                  <span style={{ color: textSub, fontSize: 13 }}>
                    {publishNow
                      ? t("admin.common.view")
                      : t("admin.common.hiddenFromPublic")}
                  </span>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 999,
                    cursor: "pointer",
                    flexShrink: 0,
                    background: publishNow ? "#023B6A" : "#E2E8F0",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                  onClick={() => setPublishNow(!publishNow)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: publishNow ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      backgroundColor: bgCard,
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
