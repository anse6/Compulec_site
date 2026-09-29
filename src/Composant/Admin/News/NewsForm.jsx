import React, { useState, useEffect, useRef } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { Form, Input, Button, Upload, Spin, message as antMessage } from "antd";
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

const { TextArea } = Input;
const { Dragger } = Upload;

const BASE_IMG = "http://localhost:8080/api";
function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img.startsWith("/") ? img : `/${img}`}`;
}

export default function NewsForm() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const [newFile, setNewFile] = useState(null); // Just one file for News
  const [existingImg, setExistingImg] = useState(null); // Just one string
  const [publishNow, setPublishNow] = useState(false);

  const { data: articleData, isLoading: loadingDetail } =
    useGetArticleByIdQuery(id, { skip: !isEdit });
  const [createArticle, { isLoading: creating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: updating }] = useUpdateArticleMutation();

  const isSaving = creating || updating;

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
      setPublishNow(a.published);
    } else if (!isEdit) {
      form.resetFields();
      setNewFile(null);
      setExistingImg(null);
    }
  }, [isEdit, articleData, form]);

  const buildFormData = (values) => {
    const fd = new FormData();
    if (values.title) fd.append("title", values.title);
    if (values.subtitle) fd.append("subtitle", values.subtitle);
    if (values.heading) fd.append("heading", values.heading);
    if (values.overview) fd.append("overview", values.overview);
    fd.append("published", publishNow);

    if (newFile) {
      fd.append("imageFile", newFile);
    } else if (existingImg) {
      fd.append("imageUrl", existingImg);
    }

    return fd;
  };

  const handleSubmit = async (values) => {
    try {
      const fd = buildFormData(values);
      let result;

      if (isEdit) {
        result = await updateArticle({ id, formData: fd }).unwrap();
      } else {
        result = await createArticle(fd).unwrap();
      }

      antMessage.success(
        result.message || (isEdit ? "Article mis à jour !" : "Article créé !"),
      );
      setTimeout(() => navigate("/admin/news"), 800);
    } catch (err) {
      antMessage.error(err?.data?.message || "Une erreur est survenue.");
    }
  };

  if (isEdit && loadingDetail) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spin size="large" tip="Chargement de l'article..." />
      </div>
    );
  }

  return (
    <div className="font-['Poppins'] pb-[60px]">
      {/* Top Bar */}
      <div className="mb-6">
        <div
          onClick={() => navigate("/admin/news")}
          className="inline-flex items-center gap-2  font-semibold cursor-pointer mb-4 hover:underline" style={{ color: primary }}
        >
          <ArrowLeftOutlined /> Back to News
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-[800] text-[26px] m-0 mb-1.5" style={{ color: textMain }}>
              {isEdit ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-[13px] m-0" style={{ color: textSub }}>
              Prepare a new story for the COMPULEC website.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              size="large"
              className="rounded-lg font-semibold"
              style={{ borderColor: border, color: textMain, backgroundColor: bgCard }}
              onClick={() => navigate("/admin/news")}
            >
              Cancel
            </Button>
            <Button
              size="large"
              icon={<SaveOutlined />}
              loading={isSaving}
              className="rounded-lg font-semibold"
              style={{ borderColor: border, color: textMain, backgroundColor: bgCard }}
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
              className="rounded-lg font-bold border-none"
              style={{
                background: "#FDE047",
                color: "#713F12",
                boxShadow: "0 2px 8px rgba(253,224,71,0.4)",
              }}
              onClick={() => {
                setPublishNow(true);
                form.submit();
              }}
            >
              Publish Article
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Article Information */}
            <div className=" rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <div className="p-6 pb-0">
                <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 m-0 mb-1">
                  Article Information
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mb-6">
                  The primary details shown across article listings.
                </p>
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 -mx-6 mb-6" />
              </div>
              <div className="px-6 pb-6">
                <Form.Item
                  name="title"
                  label={
                    <span className="font-semibold " style={{ color: primary }}>
                      Article Title *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    className="rounded-lg"
                    placeholder="enter article name"
                  />
                </Form.Item>
                <Form.Item
                  name="subtitle"
                  label={
                    <span className="font-semibold " style={{ color: primary }}>
                      Article Subtitle *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    className="rounded-lg"
                    placeholder="enter short brief about the article ..."
                  />
                </Form.Item>
              </div>
            </div>

            {/* Article Content */}
            <div className=" rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <div className="p-6 pb-0">
                <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 m-0 mb-1">
                  Article Content
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mb-6">
                  Write and format the full article for publication.
                </p>
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 -mx-6 mb-6" />
              </div>
              <div className="px-6 pb-6">
                <Form.Item
                  name="heading"
                  label={
                    <span className="font-semibold " style={{ color: primary }}>
                      Article Heading *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    className="rounded-lg"
                    placeholder="enter article name"
                  />
                </Form.Item>
                <Form.Item
                  name="overview"
                  label={
                    <span className="font-semibold " style={{ color: primary }}>
                      Article Overview *
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <TextArea
                    rows={6}
                    className="rounded-lg"
                    placeholder="enter short brief about the article ..."
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Featured Image */}
            <div className=" rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <div className="p-6 pb-0">
                <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 m-0 mb-1">
                  Featured image
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0 mb-6">
                  Choose article cover photo
                </p>
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 -mx-6 mb-6" />
              </div>
              <div className="px-6 pb-6">
                <Dragger
                  name="file"
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    file.url = URL.createObjectURL(file);
                    setNewFile(file);
                    setExistingImg(null); // clear existing if a new one is uploaded
                    return false;
                  }}
                  className="bg-slate-50 dark:bg-slate-800/50  rounded-xl overflow-hidden" style={{ borderColor: border }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined className="text-slate-400" />
                  </p>
                  <p className="ant-upload-text font-semibold text-slate-800 dark:text-slate-100">
                    Drag & drop images here
                  </p>
                  <p className="ant-upload-hint text-[13px] text-slate-400">
                    or browse files — JPG, PNG, WebP
                  </p>
                </Dragger>

                {/* Preview */}
                {(newFile || existingImg) && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <img
                          src={newFile ? newFile.url : getImageUrl(existingImg)}
                          alt="preview"
                          className="w-16 h-12 object-cover rounded-md border " style={{ borderColor: border }}
                        />
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">
                          {newFile ? newFile.name : "Cover image"}
                        </span>
                      </div>
                      <DeleteOutlined
                        className="text-red-500 cursor-pointer p-2 hover:bg-red-50 rounded-md"
                        onClick={() => {
                          setNewFile(null);
                          setExistingImg(null);
                        }}
                      />
                    </div>
                  </div>
                )}
                {!newFile && !existingImg && (
                  <div className="mt-4 text-[12px] text-slate-400 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                    No image selected yet.
                  </div>
                )}
              </div>
            </div>

            {/* Visibility info */}
            <div className=" rounded-xl p-6 shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 m-0 mb-4">
                Visibility
              </h2>
              <div className="flex justify-between items-center border border-slate-100 dark:border-slate-800 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-slate-100 text-[14px]">
                    {publishNow ? "Published" : "Draft"}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[13px]">
                    {publishNow
                      ? "Visible on the public website"
                      : "Not visible to the public"}
                  </span>
                </div>
                <div
                  className={`w-11 h-6 rounded-full cursor-pointer relative transition-colors ${!publishNow ? "bg-slate-300" : ""}`}
                  style={{ backgroundColor: publishNow ? primary : undefined }}
                  onClick={() => setPublishNow(!publishNow)}
                >
                  <div
                    className={`absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all shadow-sm ${publishNow ? "left-[23px]" : "left-[3px]"}`}
                    style={{ backgroundColor: isDark ? "#0F172A" : "#ffffff" }}
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
