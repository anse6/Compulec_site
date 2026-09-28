import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  Select,
  message,
  Spin,
  Popconfirm,
  Empty,
} from "antd";
import { InboxOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// Icons are now imported from @ant-design/icons

import {
  useGetAllGalleriesQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
} from "../../../services/api/galleryApi";
import { useGetAllProjetsQuery } from "../../../services/api/projetApi";

const BASE_IMG = "http://localhost:8080/api";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img.startsWith("/") ? img : `/${img}`}`;
}

export default function AdminGallery() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewGallery, setPreviewGallery] = useState(null); // Which gallery's lightbox is open
  const [previewImageIndex, setPreviewImageIndex] = useState(0); // Current image index in the open lightbox
  const [searchText, setSearchText] = useState("");
  const [selectedProjetId, setSelectedProjetId] = useState(null);
  const [form] = Form.useForm();

  const { data: galleriesResp, isLoading } = useGetAllGalleriesQuery();
  const { data: projetsResp, isLoading: loadingProjets } =
    useGetAllProjetsQuery({ page: 0, size: 100 });

  const [createGallery, { isLoading: creating }] = useCreateGalleryMutation();
  const [updateGallery, { isLoading: updating }] = useUpdateGalleryMutation();
  const [deleteGallery] = useDeleteGalleryMutation();

  const galleries = galleriesResp?.data || [];
  const projets = projetsResp?.data?.content || [];

  const filteredGalleries = useMemo(() => {
    let result = galleries;
    if (selectedProjetId) {
      result = result.filter((g) => g.projetId === selectedProjetId);
    }
    if (searchText) {
      result = result.filter(
        (g) =>
          (g.titre && g.titre.toLowerCase().includes(searchText.toLowerCase())) ||
          (g.projetTitre &&
            g.projetTitre.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    return result;
  }, [galleries, searchText, selectedProjetId]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((f) => {
        if (f.url && f.url.startsWith("blob:")) URL.revokeObjectURL(f.url);
      });
    };
  }, [uploadedFiles]);

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setUploadedFiles([]);
    if (mode === "edit" && item) {
      setEditingGalleryId(item.id);
      form.setFieldsValue({ 
        title: item.titre,
        projetId: item.projetId
      });
      
      const existingFiles = (item.images || []).map((img, index) => ({
        id: `existing-${index}`,
        name: `Image ${index + 1}`,
        url: getImageUrl(img),
        type: "image/jpeg", // Fallback type for preview
        isExisting: true,
        backendPath: img // Store the original path
      }));
      setUploadedFiles(existingFiles);
    } else {
      setEditingGalleryId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setUploadedFiles([]);
    setEditingGalleryId(null);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("projetId", values.projetId);
      if (values.title) {
        formData.append("titre", values.title);
      }
      uploadedFiles.forEach((f) => {
        if (f.isExisting) {
          formData.append("existingImages", f.backendPath);
        } else {
          formData.append("images", f.originFileObj);
        }
      });

      if (modalMode === "add") {
        await createGallery(formData).unwrap();
        message.success("Galerie créée avec succès !");
      } else if (modalMode === "edit" && editingGalleryId) {
        await updateGallery({ id: editingGalleryId, formData }).unwrap();
        message.success("Galerie mise à jour avec succès !");
      }
      handleCloseModal();
    } catch (err) {
      message.error(err?.data?.message || "Erreur lors de la sauvegarde.");
    }
  };

  const handleBeforeUpload = (file) => {
    const isImageOrVideo =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isImageOrVideo) {
      alert("You can only upload images or videos!");
      return Upload.LIST_IGNORE;
    }

    const newFile = {
      id: file.uid,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      originFileObj: file,
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    return false; // Prevent auto-upload
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) =>
      prev.filter((f) => {
        if (f.id === id && f.url && f.originFileObj) {
          URL.revokeObjectURL(f.url);
        }
        return f.id !== id;
      }),
    );
  };

  const handleOpenPreview = (galleryIndex) => {
    setPreviewGallery(galleries[galleryIndex]);
    setPreviewImageIndex(0);
  };
  const handleClosePreview = () => {
    setPreviewGallery(null);
    setPreviewImageIndex(0);
  };
  const handlePrevPreview = () => {
    if (previewImageIndex > 0) setPreviewImageIndex(previewImageIndex - 1);
  };
  const handleNextPreview = () => {
    if (
      previewGallery &&
      previewImageIndex < previewGallery.images.length - 1
    ) {
      setPreviewImageIndex(previewImageIndex + 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingBottom: 40,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: 26,
              color: "var(--ant-color-text)",
              margin: "0 0 6px",
              letterSpacing: "-0.3px",
            }}
          >
            Gallery
          </h1>
          <p style={{ fontSize: 13, color: "var(--ant-color-text-description)", margin: 0 }}>
            Manage general images used across the COMPULEC website.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
          style={{
            padding: "10px 22px",
            border: "none",
            borderRadius: 10,
            backgroundColor: "#023B6A",
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
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
            +
          </span>
          Add Images/Videos
        </button>
      </div>

      {/* Search and Filter Toolbar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 320 }}>
          <Input.Search
            placeholder="Rechercher par titre ou projet..."
            allowClear
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <Select
          size="large"
          allowClear
          placeholder="Filtrer par projet"
          style={{ width: 250 }}
          loading={loadingProjets}
          value={selectedProjetId}
          onChange={(value) => setSelectedProjetId(value)}
          options={projets.map(p => ({ value: p.id, label: p.titre }))}
        />
      </div>

      {/* Grid Layout */}
      <Spin spinning={isLoading}>
        {filteredGalleries.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--ant-color-bg-container)",
              padding: 60,
              borderRadius: 12,
              border: "1px solid var(--ant-color-border-secondary)",
              marginTop: 20,
            }}
          >
            <Empty
              description={
                <span style={{ color: "var(--ant-color-text-description)" }}>Aucune galerie trouvée</span>
              }
            />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 24,
            }}
          >
            {filteredGalleries.map((item, index) => {
              const coverImage =
                item.images && item.images.length > 0
                  ? getImageUrl(item.images[0])
                  : "https://via.placeholder.com/500x300?text=No+Image";
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "var(--ant-color-bg-container)",
                    border: "1px solid var(--ant-color-border-secondary)",
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Image Thumbnail */}
                  <div
                    style={{
                      width: "100%",
                      height: 220,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={coverImage}
                      alt={item.titre}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {item.images?.length || 0} image(s)
                    </div>
                  </div>

                  {/* Title & Actions */}
                  <div style={{ padding: 20 }}>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#023B6A",
                        margin: "0 0 4px",
                      }}
                    >
                      {item.titre || "Galerie sans titre"}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ant-color-text-description)",
                        margin: "0 0 16px",
                      }}
                    >
                      Projet : {item.projetTitre}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          style={gridActionBtnStyle}
                          onClick={() => handleOpenPreview(index)}
                        >
                          <EyeOutlined /> Preview
                        </button>
                        <button
                          style={gridActionBtnStyle}
                          onClick={() => handleOpenModal("edit", item)}
                        >
                          <EditOutlined /> Edit
                        </button>
                      </div>
                      <Popconfirm
                        title="Supprimer cette galerie ?"
                        onConfirm={() => deleteGallery(item.id)}
                        okText="Oui"
                        cancelText="Non"
                      >
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            color: "var(--ant-color-error)"
                          }}
                        >
                          <DeleteOutlined style={{ fontSize: 16 }} />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Spin>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <div style={{ fontWeight: 800, color: "#023B6A", fontSize: 18 }}>
            {modalMode === "edit" ? "Edit Image/Video" : "Add Images/Videos"}
            <p
              style={{
                fontWeight: 400,
                color: "var(--ant-color-text-description)",
                fontSize: 13,
                margin: "4px 0 0",
              }}
            >
              Upload a photograph or video
            </p>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        closeIcon={
          <span style={{ color: "#023B6A", fontSize: 18, fontWeight: "bold" }}>
            ✕
          </span>
        }
        styles={{
          header: { padding: "24px", borderBottom: "1px solid var(--ant-color-border-secondary)" },
          body: { padding: "24px" },
          content: { borderRadius: 12, overflow: "hidden", padding: 0 },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="projetId"
            label={
              <span style={{ fontWeight: 600, color: "#023B6A" }}>
                Projet Associé *
              </span>
            }
            rules={[
              { required: true, message: "Veuillez sélectionner un projet" },
            ]}
          >
            <Select
              size="large"
              placeholder="Sélectionnez un projet"
              loading={loadingProjets}
              options={projets.map((p) => ({ value: p.id, label: p.titre }))}
              notFoundContent={
                loadingProjets ? (
                  <Spin size="small" />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Aucun projet disponible, veuillez d'abord créer un projet."
                  />
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="title"
            label={
              <span style={{ fontWeight: 600, color: "#023B6A" }}>
                Titre de la Galerie
              </span>
            }
          >
            <Input
              size="large"
              placeholder="e.g. Installation des caméras"
              style={{ borderRadius: 8, borderColor: "var(--ant-color-border)" }}
            />
          </Form.Item>

          <div style={{ marginBottom: 24 }}>
            <Upload.Dragger
              name="file"
              multiple={true}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              style={{
                backgroundColor: "var(--ant-color-bg-container)",
                borderColor: "var(--ant-color-border)",
                borderRadius: 12,
                padding: "40px 0",
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#023B6A", fontSize: 32 }} />
              </p>
              <p
                className="ant-upload-text"
                style={{ color: "#023B6A", fontWeight: 700, fontSize: 16 }}
              >
                Drag & drop images/video here
              </p>
              <p
                className="ant-upload-hint"
                style={{ color: "var(--ant-color-text-description)", fontSize: 13 }}
              >
                or browse files - JPG, PNG, WebP, MP4
              </p>
            </Upload.Dragger>
          </div>

          {uploadedFiles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    border: "1px solid var(--ant-color-border)",
                    overflow: "hidden",
                  }}
                >
                  {file.type.startsWith("video/") ? (
                    <video
                      src={file.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={file.url}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {/* Delete overlay */}
                  <div
                    onClick={() => handleRemoveFile(file.id)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Removed duplicate title field here */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 32,
            }}
          >
            <Button
              size="large"
              onClick={handleCloseModal}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                color: "#023B6A",
                borderColor: "var(--ant-color-border)",
              }}
            >
              Cancel
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={creating || updating}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                backgroundColor: "var(--ant-color-primary)",
                borderColor: "#023B6A",
              }}
            >
              {modalMode === "edit" ? "Mettre à jour" : "Add Images"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Lightbox Preview Overlay */}
      {previewGallery &&
        previewGallery.images &&
        previewGallery.images.length > 0 && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Close button */}
            <div
              onClick={handleClosePreview}
              style={{
                position: "absolute",
                top: 32,
                right: 40,
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                padding: 8,
              }}
            >
              ✕
            </div>

            {/* Counter */}
            <div
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 24,
                letterSpacing: 1,
              }}
            >
              {String(previewImageIndex + 1).padStart(2, "0")}/
              {String(previewGallery.images.length).padStart(2, "0")}
            </div>

            {/* Image */}
            <div
              style={{
                maxWidth: "80%",
                maxHeight: "65vh",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={getImageUrl(previewGallery.images[previewImageIndex])}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  border: "4px solid #fff",
                }}
              />
            </div>

            {/* Navigation Controls */}
            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              <button
                onClick={handlePrevPreview}
                disabled={previewImageIndex === 0}
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: "none",
                  cursor: previewImageIndex === 0 ? "not-allowed" : "pointer",
                  background: previewImageIndex === 0 ? "#475569" : "#2563EB",
                  color: previewImageIndex === 0 ? "#94A3B8" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={handleNextPreview}
                disabled={
                  previewImageIndex === previewGallery.images.length - 1
                }
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: "none",
                  cursor:
                    previewImageIndex === previewGallery.images.length - 1
                      ? "not-allowed"
                      : "pointer",
                  background:
                    previewImageIndex === previewGallery.images.length - 1
                      ? "#475569"
                      : "#2563EB",
                  color:
                    previewImageIndex === previewGallery.images.length - 1
                      ? "#94A3B8"
                      : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const gridActionBtnStyle = {
  backgroundColor: "var(--ant-color-bg-container)",
  border: "1px solid var(--ant-color-border)",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--ant-color-text-description)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "border-color 0.2s, color 0.2s",
};

const previewBoxStyle = {
  width: 80,
  height: 80,
  border: "1px solid var(--ant-color-border)",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--ant-color-text-description)",
  fontSize: 12,
  fontWeight: 500,
  gap: 4,
};
