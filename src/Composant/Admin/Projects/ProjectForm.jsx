import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Select, Button, Upload, Spin, message } from "antd";
import {
  ArrowLeftOutlined, InboxOutlined, DeleteOutlined,
  CheckCircleOutlined, SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProjetByIdQuery,
  useCreateProjetMutation,
  useUpdateProjetMutation,
} from "../../../services/api/projetApi";

const { TextArea } = Input;
const { Dragger }  = Upload;

const BASE_IMG = "http://localhost:8080/api";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img.startsWith("/") ? img : `/${img}`}`;
}

// ── Tag list editor (besoins / technologies) ────────────────────────────────

function TagListEditor({ label, value = [], onChange }) {
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
      <span style={{ display: "block", fontWeight: 600, color: "#023B6A", marginBottom: 8 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {value.map((item, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#F1F5F9", border: "1px solid var(--ant-color-border)", borderRadius: 8, padding: "4px 10px 4px 12px" }}
          >
            <span style={{ fontSize: 13, color: "var(--ant-color-text)" }}>{item}</span>
            <DeleteOutlined onClick={() => remove(item)} style={{ color: "var(--ant-color-error)", cursor: "pointer", fontSize: 11 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type and press Add…" 
          style={{ borderRadius: 8, width: 280 }} 
          onPressEnter={add} 
        />
        <Button type="primary" style={{ background: "#2563EB", borderRadius: 8 }} onClick={add}>+ Add</Button>
      </div>
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────

export default function ProjectForm() {
  const navigate     = useNavigate();
  const { id }       = useParams();
  const isEdit       = !!id;
  const [form]       = Form.useForm();

  // New image files to upload
  const [newFiles,  setNewFiles]  = useState([]);   // File[]
  // Existing images from backend (for edit mode)
  const [existingImgs, setExistingImgs] = useState([]); // string[]
  // Publish flag
  const [publishNow, setPublishNow] = useState(false);

  const { data: projetData, isLoading: loadingDetail } = useGetProjetByIdQuery(id, { skip: !isEdit });
  const [createProjet, { isLoading: creating }] = useCreateProjetMutation();
  const [updateProjet, { isLoading: updating }] = useUpdateProjetMutation();

  const isSaving = creating || updating;

  // ── Pre-fill form in edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (isEdit && projetData?.data) {
      const p = projetData.data;
      form.setFieldsValue({
        titre:       p.titre,
        sousTitre:   p.sousTitre,
        categorie:   p.categorie,
        service:     p.service,
        clientName:  p.clientName,
        secteur:     p.secteur,
        localisation: p.localisation,
        status:      p.status,
        overview:    p.overview,
        contexte:    p.contexte,
        besoins:     p.besoins      || [],
        solution:    p.solution,
        technologies: p.technologies || [],
        resultat:    p.resultat,
      });
      setExistingImgs(p.images || []);
      setPublishNow(p.publie);
    } else if (!isEdit) {
      form.resetFields();
      setNewFiles([]);
      setExistingImgs([]);
    }
  }, [isEdit, projetData, form]);

  // ── Build FormData ────────────────────────────────────────────────────────
  function buildFormData(values) {
    const fd = new FormData();

    const appendIfNotEmpty = (key, val) => {
      if (val !== undefined && val !== null && val !== "") fd.append(key, val);
    };

    appendIfNotEmpty("titre",       values.titre);
    appendIfNotEmpty("sousTitre",   values.sousTitre || "");
    appendIfNotEmpty("categorie",   values.categorie);
    appendIfNotEmpty("service",     values.service || "");
    appendIfNotEmpty("clientName",  values.clientName || "");
    appendIfNotEmpty("secteur",     values.secteur);
    appendIfNotEmpty("localisation", values.localisation);
    appendIfNotEmpty("status",      values.status || "Planned");
    appendIfNotEmpty("overview",    values.overview);
    appendIfNotEmpty("contexte",    values.contexte);
    appendIfNotEmpty("solution",    values.solution);
    appendIfNotEmpty("resultat",    values.resultat);

    (values.besoins || []).forEach((b) => fd.append("besoins", b));
    (values.technologies || []).forEach((t) => fd.append("technologies", t));

    newFiles.forEach((file) => fd.append("images", file));

    return fd;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    try {
      const fd = buildFormData(values);
      let result;

      if (isEdit) {
        result = await updateProjet({ id, formData: fd }).unwrap();
      } else {
        result = await createProjet(fd).unwrap();
      }

      message.success(result.message || (isEdit ? "Projet mis à jour !" : "Projet créé !"));
      setTimeout(() => navigate("/admin/projects"), 800);
    } catch (err) {
      message.error(err?.data?.message || "Une erreur est survenue.");
    }
  };

  if (isEdit && loadingDetail) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <Spin size="large" tip="Chargement du projet…" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", paddingBottom: 60 }}>
      {/* Top Bar */}
      <div style={{ marginBottom: 24 }}>
        <div
          onClick={() => navigate("/admin/projects")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#023B6A", fontWeight: 600, cursor: "pointer", marginBottom: 16 }}
        >
          <ArrowLeftOutlined /> Back to Projects
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 26, color: "var(--ant-color-text)", margin: "0 0 6px" }}>
              {isEdit ? "Edit Project" : "Add Project"}
            </h1>
            <p style={{ fontSize: 13, color: "var(--ant-color-text-description)", margin: 0 }}>
              Record a completed engagement and choose how it appears on the website.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button
              size="large"
              style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--ant-color-border)" }}
              onClick={() => navigate("/admin/projects")}
            >
              Cancel
            </Button>
            <Button
              size="large"
              icon={<SaveOutlined />}
              loading={isSaving}
              style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--ant-color-border)" }}
              onClick={() => {
                setPublishNow(false);
                form.submit();
              }}
            >
              Save Draft
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
                borderRadius: 8, fontWeight: 700,
                background: "#FDE047", color: "#713F12", border: "none",
                boxShadow: "0 2px 8px rgba(253,224,71,0.4)",
              }}
            >
              Publish Project
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Project Identity */}
            <div style={{ backgroundColor: "var(--ant-color-bg-container)", border: "1px solid var(--ant-color-border-secondary)", borderRadius: 12 }}>
              <div style={{ padding: "24px 24px 0" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ant-color-text)", margin: "0 0 4px" }}>Project identity</h2>
                <p style={{ fontSize: 13, color: "var(--ant-color-text-description)", margin: "0 0 24px" }}>Core information shown in listings</p>
                <div style={{ height: 1, background: "#EEF2F7", margin: "0 -24px 24px" }} />
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <Form.Item name="titre" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Project Title *</span>} rules={[{ required: true, message: "Required" }]}>
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="sousTitre" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Project Subtitle</span>}>
                  <Input size="large" style={{ borderRadius: 8 }} />
                </Form.Item>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Form.Item name="categorie" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Category *</span>} rules={[{ required: true, message: "Required" }]}>
                    <Select size="large" style={{ width: "100%" }}>
                      <Select.Option value="Infrastructure & Network">Infrastructure & Network</Select.Option>
                      <Select.Option value="Computer Security">Computer Security</Select.Option>
                      <Select.Option value="Energy Solutions">Energy Solutions</Select.Option>
                      <Select.Option value="Digital Solutions">Digital Solutions</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="service" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Service</span>}>
                    <Select size="large" style={{ width: "100%" }} allowClear>
                      <Select.Option value="Network & System Administration Installation">Network & System Administration Installation</Select.Option>
                      <Select.Option value="Video Surveillance">Video Surveillance</Select.Option>
                      <Select.Option value="Access Control">Access Control</Select.Option>
                      <Select.Option value="Energy & Power">Energy & Power</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Form.Item name="clientName" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Client Name</span>}>
                    <Input size="large" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="secteur" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Sector *</span>} rules={[{ required: true, message: "Required" }]}>
                    <Input size="large" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
                  <Form.Item name="localisation" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Location *</span>} rules={[{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                    <Input size="large" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="status" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Completion Status</span>} style={{ marginBottom: 0 }}>
                    <Select size="large" style={{ width: "100%" }}>
                      <Select.Option value="Planned">Planned</Select.Option>
                      <Select.Option value="In progress">In Progress</Select.Option>
                      <Select.Option value="Completed">Completed</Select.Option>
                      <Select.Option value="On Hold">On Hold</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Project Narrative */}
            <div style={{ backgroundColor: "var(--ant-color-bg-container)", border: "1px solid var(--ant-color-border-secondary)", borderRadius: 12 }}>
              <div style={{ padding: "24px 24px 0" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ant-color-text)", margin: "0 0 4px" }}>Project narrative</h2>
                <p style={{ fontSize: 13, color: "var(--ant-color-text-description)", margin: "0 0 24px" }}>Content shown on the public project page</p>
                <div style={{ height: 1, background: "#EEF2F7", margin: "0 -24px 24px" }} />
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <Form.Item name="overview" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Project Overview *</span>} rules={[{ required: true, message: "Required" }]}>
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="contexte" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Context *</span>} rules={[{ required: true, message: "Required" }]}>
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>

                {/* Besoins */}
                <Form.Item name="besoins" noStyle>
                  <TagListEditorWrapper label="The Need" />
                </Form.Item>

                <Form.Item name="solution" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Solution Implemented *</span>} rules={[{ required: true, message: "Required" }]}>
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>

                {/* Technologies */}
                <Form.Item name="technologies" noStyle>
                  <TagListEditorWrapper label="Technology Used" />
                </Form.Item>

                <Form.Item name="resultat" label={<span style={{ fontWeight: 600, color: "#023B6A" }}>Result *</span>} rules={[{ required: true, message: "Required" }]} style={{ marginBottom: 0 }}>
                  <TextArea rows={3} style={{ borderRadius: 8 }} />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Images */}
            <div style={{ backgroundColor: "var(--ant-color-bg-container)", border: "1px solid var(--ant-color-border-secondary)", borderRadius: 12 }}>
              <div style={{ padding: "24px 24px 0" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ant-color-text)", margin: "0 0 4px" }}>Project Images</h2>
                <p style={{ fontSize: 13, color: "var(--ant-color-text-description)", margin: "0 0 24px" }}>First image becomes the cover</p>
                <div style={{ height: 1, background: "#EEF2F7", margin: "0 -24px 24px" }} />
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <Dragger
                  name="file"
                  multiple
                  listType="picture"
                  beforeUpload={(file) => {
                    // Generate a local preview URL so the user sees the image
                    file.url = URL.createObjectURL(file);
                    setNewFiles((prev) => [...prev, file]);
                    return false; // prevent auto-upload
                  }}
                  onRemove={(file) => {
                    if (file.url) URL.revokeObjectURL(file.url);
                    setNewFiles((prev) => prev.filter((f) => f.uid !== file.uid));
                  }}
                  fileList={newFiles}
                  style={{ backgroundColor: "var(--ant-color-bg-layout)", borderColor: "var(--ant-color-border)", borderRadius: 12 }}
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: "var(--ant-color-text-description)" }} /></p>
                  <p className="ant-upload-text" style={{ color: "var(--ant-color-text)", fontWeight: 600 }}>Drag & drop images here</p>
                  <p className="ant-upload-hint" style={{ color: "var(--ant-color-text-description)", fontSize: 13 }}>or browse files — JPG, PNG, WebP</p>
                </Dragger>

                {/* Existing images in edit mode */}
                {existingImgs.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ant-color-text-description)" }}>EXISTING IMAGES</span>
                    {existingImgs.map((img, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid var(--ant-color-border-secondary)", borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img src={getImageUrl(img)} alt="cover" style={{ width: 60, height: 40, borderRadius: 4, objectFit: "cover" }} />
                          <span style={{ fontSize: 12, color: "var(--ant-color-text-description)" }}>{i === 0 ? "Cover" : `Image ${i + 1}`}</span>
                        </div>
                        <DeleteOutlined
                          style={{ color: "var(--ant-color-error)", cursor: "pointer" }}
                          onClick={() => setExistingImgs((prev) => prev.filter((_, idx) => idx !== i))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visibility info */}
            <div style={{ backgroundColor: "var(--ant-color-bg-container)", border: "1px solid var(--ant-color-border-secondary)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ant-color-text)", margin: "0 0 16px" }}>Visibility</h2>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--ant-color-border-secondary)", padding: 16, borderRadius: 8 }}>
                <div>
                  <span style={{ display: "block", fontWeight: 600, color: "var(--ant-color-text)", fontSize: 14 }}>
                    {publishNow ? "Will be published" : "Will be saved as draft"}
                  </span>
                  <span style={{ color: "var(--ant-color-text-description)", fontSize: 13 }}>
                    {publishNow ? "Visible on the public website" : "Not visible to the public"}
                  </span>
                </div>
                <div
                  style={{
                    width: 44, height: 24, borderRadius: 999, cursor: "pointer",
                    background: publishNow ? "#023B6A" : "#E2E8F0",
                    position: "relative", transition: "background 0.2s",
                  }}
                  onClick={() => setPublishNow(!publishNow)}
                >
                  <div style={{
                    position: "absolute", top: 3, left: publishNow ? 23 : 3,
                    width: 18, height: 18, borderRadius: 999, backgroundColor: "var(--ant-color-bg-container)",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </Form>
    </div>
  );
}

/**
 * Wrapper pour utiliser TagListEditor avec Form.Item (qui passe value/onChange)
 */
function TagListEditorWrapper({ label, value, onChange }) {
  return <TagListEditor label={label} value={value || []} onChange={onChange} />;
}
