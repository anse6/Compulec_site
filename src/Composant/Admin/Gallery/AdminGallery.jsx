import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
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
  Grid,
} from "antd";
import {
  InboxOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  useGetAllGalleriesQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
} from "../../../services/api/galleryApi";
import { useGetAllProjetsQuery } from "../../../services/api/projetApi";
import { BASE_IMG } from "../../../config";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img.startsWith("/") ? img : `/${img}`}`;
}

export default function AdminGallery() {
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewGallery, setPreviewGallery] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedProjetId, setSelectedProjetId] = useState(null);
  const [form] = Form.useForm();

  // Swipe (lightbox)
  const touchStartX = useRef(null);

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
      const q = searchText.toLowerCase();
      result = result.filter(
        (g) =>
          (g.titre && g.titre.toLowerCase().includes(q)) ||
          (g.projetTitre && g.projetTitre.toLowerCase().includes(q)),
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

  // Empêche le scroll de la page derrière la lightbox
  useEffect(() => {
    if (previewGallery) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [previewGallery]);

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setUploadedFiles([]);
    if (mode === "edit" && item) {
      setEditingGalleryId(item.id);
      form.setFieldsValue({
        title: item.titre,
        projetId: item.projetId,
      });

      const existingFiles = (item.images || []).map((img, index) => ({
        id: `existing-${index}`,
        name: `Image ${index + 1}`,
        url: getImageUrl(img),
        type: "image/jpeg",
        isExisting: true,
        backendPath: img,
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
        message.success(t("admin.gallery.createSuccess"));
      } else if (modalMode === "edit" && editingGalleryId) {
        await updateGallery({ id: editingGalleryId, formData }).unwrap();
        message.success(t("admin.gallery.updateSuccess"));
      }
      handleCloseModal();
    } catch (err) {
      message.error(err?.data?.message || t("admin.gallery.saveError"));
    }
  };

  const handleBeforeUpload = (file) => {
    const isImageOrVideo =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isImageOrVideo) {
      message.error(t("admin.gallery.uploadError"));
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
    return false;
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

  // ── Lightbox (on reçoit directement la galerie, pas l'index)
  const handleOpenPreview = (gallery) => {
    setPreviewGallery(gallery);
    setPreviewImageIndex(0);
  };
  const handleClosePreview = () => {
    setPreviewGallery(null);
    setPreviewImageIndex(0);
  };
  const handlePrevPreview = () => {
    if (previewImageIndex > 0) setPreviewImageIndex((i) => i - 1);
  };
  const handleNextPreview = () => {
    if (
      previewGallery &&
      previewImageIndex < previewGallery.images.length - 1
    ) {
      setPreviewImageIndex((i) => i + 1);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) handleNextPreview();
      else handlePrevPreview();
    }
    touchStartX.current = null;
  };

  const gridActionBtnStyle = {
    backgroundColor: bgCard,
    border: `1px solid ${border}`,
    borderRadius: 6,
    padding: isMobile ? "8px 10px" : "6px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: textSub,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    flex: isMobile ? 1 : undefined,
  };

  const isFirst = previewImageIndex === 0;
  const isLast =
    previewGallery && previewImageIndex === previewGallery.images.length - 1;

  const navBtnStyle = (disabled) => ({
    width: isMobile ? 52 : 44,
    height: isMobile ? 52 : 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "#475569" : "#2563EB",
    color: disabled ? "#94A3B8" : "#fff",
    transition: "all 0.2s",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 16 : 24,
        paddingBottom: 40,
        fontFamily: "'Poppins', sans-serif",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "flex-start",
          gap: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontWeight: 800,
              fontSize: isMobile ? 22 : 26,
              color: textMain,
              margin: "0 0 6px",
              letterSpacing: "-0.3px",
            }}
          >
            {t("admin.gallery.title")}
          </h1>
          <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
            {t("admin.gallery.subtitle")}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
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
            justifyContent: "center",
            gap: 6,
            boxShadow: "0 2px 10px rgba(2,59,106,0.25)",
            transition: "background 0.15s",
            width: isMobile ? "100%" : "auto",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
            +
          </span>
          {t("admin.gallery.addImages")}
        </button>
      </div>

      {/* Search and Filter Toolbar */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 16,
          alignItems: isMobile ? "stretch" : "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: isMobile ? "100%" : 320 }}>
          <Input.Search
            placeholder={t("admin.gallery.searchPlaceholder")}
            allowClear
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <Select
          size="large"
          allowClear
          placeholder={t("admin.gallery.filterProject")}
          style={{ width: isMobile ? "100%" : 250 }}
          loading={loadingProjets}
          value={selectedProjetId}
          onChange={(value) => setSelectedProjetId(value)}
          options={projets.map((p) => ({ value: p.id, label: p.titre }))}
        />
      </div>

      {/* Grid Layout */}
      <Spin spinning={isLoading}>
        {filteredGalleries.length === 0 ? (
          <div
            style={{
              backgroundColor: bgCard,
              padding: isMobile ? 32 : 60,
              borderRadius: 12,
              border: `1px solid ${border}`,
              marginTop: isMobile ? 0 : 20,
            }}
          >
            <Empty
              description={
                <span style={{ color: textSub }}>
                  {t("admin.gallery.noGalleryFound")}
                </span>
              }
            />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: isMobile ? 16 : 24,
            }}
          >
            {filteredGalleries.map((item) => {
              const coverImage =
                item.images && item.images.length > 0
                  ? getImageUrl(item.images[0])
                  : "https://via.placeholder.com/500x300?text=No+Image";
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: bgCard,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                  }}
                >
                  {/* Image Thumbnail */}
                  <div
                    style={{
                      width: "100%",
                      height: isMobile ? 180 : 220,
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
                        display: "block",
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
                      {item.images?.length || 0}{" "}
                      {t("admin.gallery.imagesCount")}
                    </div>
                  </div>

                  {/* Title & Actions */}
                  <div style={{ padding: isMobile ? 16 : 20 }}>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: primary,
                        margin: "0 0 4px",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.titre || t("admin.gallery.untitledGallery")}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: textSub,
                        margin: "0 0 16px",
                        wordBreak: "break-word",
                      }}
                    >
                      {t("admin.gallery.projectLabel")} {item.projetTitre}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: isMobile ? 8 : 12,
                          flex: 1,
                          minWidth: 0,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          style={gridActionBtnStyle}
                          onClick={() => handleOpenPreview(item)}
                        >
                          <EyeOutlined /> {t("admin.gallery.preview")}
                        </button>
                        <button
                          style={gridActionBtnStyle}
                          onClick={() => handleOpenModal("edit", item)}
                        >
                          <EditOutlined /> {t("admin.gallery.edit")}
                        </button>
                      </div>
                      <Popconfirm
                        title={t("admin.gallery.deleteConfirm")}
                        onConfirm={() => deleteGallery(item.id)}
                        okText={t("admin.common.yes")}
                        cancelText={t("admin.common.no")}
                      >
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 8,
                            color: "var(--ant-color-error)",
                            flexShrink: 0,
                          }}
                        >
                          <DeleteOutlined style={{ fontSize: 18 }} />
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
          <div
            style={{
              fontWeight: 800,
              color: primary,
              fontSize: isMobile ? 16 : 18,
            }}
          >
            {modalMode === "edit"
              ? t("admin.gallery.editModalTitle")
              : t("admin.gallery.addModalTitle")}
            <p
              style={{
                fontWeight: 400,
                color: textSub,
                fontSize: 13,
                margin: "4px 0 0",
              }}
            >
              {t("admin.gallery.uploadDesc")}
            </p>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={isMobile ? "calc(100vw - 24px)" : 600}
        centered={isMobile}
        closeIcon={
          <span style={{ color: primary, fontSize: 18, fontWeight: "bold" }}>
            ✕
          </span>
        }
        styles={{
          header: {
            padding: isMobile ? "16px" : "24px",
            borderBottom: "1px solid var(--ant-color-border-secondary)",
          },
          body: {
            padding: isMobile ? "16px" : "24px",
            maxHeight: isMobile ? "calc(100vh - 140px)" : undefined,
            overflowY: "auto",
          },
          content: { borderRadius: 12, overflow: "hidden", padding: 0 },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="projetId"
            label={
              <span style={{ fontWeight: 600, color: primary }}>
                {t("admin.gallery.associatedProject")}
              </span>
            }
            rules={[
              { required: true, message: t("admin.gallery.selectProject") },
            ]}
          >
            <Select
              size="large"
              placeholder={t("admin.gallery.selectProject")}
              loading={loadingProjets}
              options={projets.map((p) => ({ value: p.id, label: p.titre }))}
              notFoundContent={
                loadingProjets ? (
                  <Spin size="small" />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("admin.gallery.noProjectAvailable")}
                  />
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="title"
            label={
              <span style={{ fontWeight: 600, color: primary }}>
                {t("admin.gallery.galleryTitle")}
              </span>
            }
          >
            <Input
              size="large"
              placeholder={t("admin.gallery.galleryTitlePlaceholder")}
              style={{ borderRadius: 8, borderColor: border }}
            />
          </Form.Item>

          <div style={{ marginBottom: 24 }}>
            <Upload.Dragger
              name="file"
              multiple={true}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              style={{
                backgroundColor: bgCard,
                borderColor: border,
                borderRadius: 12,
                padding: isMobile ? "16px 0" : "40px 0",
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined
                  style={{ color: primary, fontSize: isMobile ? 28 : 32 }}
                />
              </p>
              <p
                className="ant-upload-text"
                style={{
                  color: primary,
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 16,
                  padding: "0 8px",
                }}
              >
                {t("admin.gallery.dragDrop")}
              </p>
              <p
                className="ant-upload-hint"
                style={{ color: textSub, fontSize: 13, padding: "0 8px" }}
              >
                {t("admin.gallery.browseFiles")}
              </p>
            </Upload.Dragger>
          </div>

          {uploadedFiles.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 72 : 80}px, 1fr))`,
                gap: 12,
                marginBottom: 24,
              }}
            >
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
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
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: isMobile ? 24 : 20,
                      height: isMobile ? 24 : 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column-reverse" : "row",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: isMobile ? 16 : 32,
            }}
          >
            <Button
              size="large"
              onClick={handleCloseModal}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                color: primary,
                borderColor: border,
                width: isMobile ? "100%" : "auto",
              }}
            >
              {t("admin.common.cancel")}
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
                width: isMobile ? "100%" : "auto",
              }}
            >
              {modalMode === "edit"
                ? t("admin.gallery.update")
                : t("admin.gallery.addImages")}
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
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "56px 12px 24px" : 0,
              boxSizing: "border-box",
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Close button */}
            <div
              onClick={handleClosePreview}
              style={{
                position: "absolute",
                top: isMobile ? 12 : 32,
                right: isMobile ? 12 : 40,
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                padding: 8,
                lineHeight: 1,
              }}
            >
              ✕
            </div>

            {/* Counter */}
            <div
              style={{
                color: "#fff",
                fontSize: isMobile ? 16 : 20,
                fontWeight: 700,
                marginBottom: isMobile ? 16 : 24,
                letterSpacing: 1,
              }}
            >
              {String(previewImageIndex + 1).padStart(2, "0")}/
              {String(previewGallery.images.length).padStart(2, "0")}
            </div>

            {/* Image */}
            <div
              style={{
                maxWidth: isMobile ? "100%" : "80%",
                maxHeight: isMobile ? "60vh" : "65vh",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={getImageUrl(previewGallery.images[previewImageIndex])}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: isMobile ? "60vh" : "65vh",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  border: isMobile ? "2px solid #fff" : "4px solid #fff",
                }}
              />
            </div>

            {/* Navigation Controls */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: isMobile ? 24 : 32,
              }}
            >
              <button
                onClick={handlePrevPreview}
                disabled={isFirst}
                style={navBtnStyle(isFirst)}
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
                disabled={isLast}
                style={navBtnStyle(isLast)}
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
