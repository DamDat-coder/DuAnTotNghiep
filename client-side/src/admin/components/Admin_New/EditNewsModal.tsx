"use client";

import { useState, useEffect, JSX } from "react";
import { toast } from "react-hot-toast";
import { News, NewsPayload } from "@/types/new";
import { updateNews } from "@/services/newApi";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ICategory } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";
import { ClipLoader } from "react-spinners";
import PreviewNew from "./PreviewNew";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const Editor = dynamic(() => import("../ui/Editor"), { ssr: false });

interface EditNewsModalProps {
  newsData: News;
  onClose: () => void;
}

export default function EditNewsModal({
  newsData,
  onClose,
  onEditSuccess, // thêm prop này
}: EditNewsModalProps & { onEditSuccess?: (news: News) => void }): JSX.Element {
  const [title, setTitle] = useState(newsData.title);
  const [content, setContent] = useState(newsData.content);
  const [tags, setTags] = useState(newsData.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState(newsData.category_id._id);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    newsData.thumbnail || null
  );
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [action, setAction] = useState<"draft" | "publish" | "upcoming">(
    newsData.is_published
      ? "publish"
      : newsData.published_at && new Date(newsData.published_at) > new Date()
      ? "upcoming"
      : "draft"
  );
  const [publishedAt, setPublishedAt] = useState<string>(
    newsData.published_at
      ? new Date(
          new Date(newsData.published_at).getTime() -
            new Date(newsData.published_at).getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16)
      : ""
  );
  const [meta_description, setMeta_description] = useState(
    newsData.meta_description || ""
  );
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"draft" | null>(null);

  useEffect(() => {
    setTitle(newsData.title);
    setContent(newsData.content);
    setTags(newsData.tags || []);
    setCategory(newsData.category_id._id);
    setThumbnail(null);
    setThumbnailPreview(newsData.thumbnail || null);
    setMeta_description(newsData.meta_description || "");
    setAction(
      newsData.is_published
        ? "publish"
        : newsData.published_at && new Date(newsData.published_at) > new Date()
        ? "upcoming"
        : "draft"
    );
    setPublishedAt(
      newsData.published_at
        ? new Date(
            new Date(newsData.published_at).getTime() -
              new Date(newsData.published_at).getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16)
        : ""
    );
  }, [newsData]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoryTree();
        const parent = data.find(
          (cat) => cat.name === "Bài viết" || cat.slug === "bai-viet"
        );
        const newsCategories = parent?.children || [];
        setCategories(newsCategories);
      } catch (err) {
        setError("Lỗi khi tải danh mục.");
      }
    };
    loadCategories();
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Hình đại diện không được vượt quá 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn một tệp hình ảnh.");
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    setIsPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewVisible(false);
  };

  const handleSave = async () => {
    if (!title) {
      toast.error("Vui lòng nhập tên bài viết!");
      return;
    }
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết!");
      return;
    }
    if (!category) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }
    if (!meta_description) {
      toast.error("Vui lòng nhập mô tả SEO!");
      return;
    }
    if (!tags || tags.length === 0) {
      toast.error("Vui lòng nhập ít nhất một tag!");
      return;
    }
    if ((action === "publish" || action === "upcoming") && !publishedAt) {
      toast.error("Vui lòng chọn ngày đăng!");
      return;
    }

    const selectedCategory = categories.find((cat) => cat._id === category);
    if (!selectedCategory) {
      setError("Danh mục không hợp lệ.");
      toast.error("Danh mục không hợp lệ!");
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-");
    let published_at: Date | undefined = undefined;
    if ((action === "publish" || action === "upcoming") && publishedAt) {
      const dateObj = new Date(publishedAt);
      if (isNaN(dateObj.getTime())) {
        setError("Ngày đăng không hợp lệ!");
        toast.error("Ngày đăng không hợp lệ!");
        return;
      }
      published_at = dateObj;
    }

    const payload: Partial<NewsPayload> = {
      title,
      content,
      slug,
      category_id: { _id: category, name: selectedCategory.name },
      tags,
      thumbnail: thumbnail ?? undefined,
      is_published: action === "publish",
      published_at,
      meta_description,
      status: action === "publish" ? "published" : action,
    };

    console.log("Payload to send:", {
      ...payload,
      thumbnail: payload.thumbnail?.name,
      published_at: payload.published_at?.toISOString(),
    });

    try {
      setLoading(true);
      const updated = await updateNews(newsData._id ?? "", payload);
      toast.success("Cập nhật tin tức thành công!");
      if (onEditSuccess) onEditSuccess(updated);
      else setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setError(`Lỗi khi cập nhật tin tức: ${err.message}`);
      toast.error(`Cập nhật thất bại: ${err.message}`, {
        style: { background: "#FDECEA", color: "#D93025" },
      });
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-[#F8FAFC] rounded-[16px] shadow-xl w-[1086px] max-w-full max-h-[90vh] overflow-y-auto relative scroll-hidden">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px]">
            <h2 className="text-lg font-bold">Sửa Tin Tức</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#F8FAFC] rounded-[8px] flex items-center justify-center"
            >
              <Image
                src="/admin_user/group.svg"
                width={10}
                height={10}
                alt="close"
              />
            </button>
          </div>
        </div>
        <div className="w-full h-px bg-[#E7E7E7]" />
        <div className="pl-6 pr-6">
          <div className="flex justify-between mt-3 mb-3">
            {/* Left side */}
            <div className="md:col-span-2 w-[668px] bg-white rounded-[12px]">
              <div className="m-4">
                <div className="mb-6">
                  <label className="block font-bold mb-4">
                    Tên bài viết<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên bài viết"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-14 px-4 border border-gray-200 rounded-[12px] text-[#94A3B8]"
                  />
                </div>
                <Editor
                  value={content || ""}
                  onChange={(newContent: string) => setContent(newContent)}
                />
                <div className="mt-6">
                  <label className="block font-bold mb-4">
                    Mô tả SEO <span>(&lt;150 ký tự)</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    placeholder="Nhập mô tả SEO"
                    value={meta_description}
                    onChange={(e) => setMeta_description(e.target.value)}
                    className="w-full h-24 px-4 border border-gray-200 rounded-[12px] text-[#94A3B8]"
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-2 w-[370px] bg-white rounded-[12px]">
              <div className="m-4">
                <div className="space-y-6">
                  <div className="relative mb-8">
                    <label className="block font-bold mb-4">
                      Ngày đăng
                      {(action === "publish" || action === "upcoming") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      disabled={action === "draft"}
                      className="w-full h-[46px] border border-[#D1D1D1] rounded-[12px] appearance-none"
                    />
                    <Image
                      src="/admin_sale/date.svg"
                      width={18}
                      height={18}
                      alt="calendar"
                      className="absolute right-3 top-[calc(50%-40px)] transform -translate-y-1/2 pointer-events-none"
                    />
                    <div className="flex gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          if (action === "publish") {
                            setPendingAction("draft");
                            setShowConfirm(true);
                          } else {
                            setAction("draft");
                            setPublishedAt(""); // Xóa ngày đăng khi chuyển sang bản nháp
                          }
                        }}
                        className={`flex-1 w-[120px] h-10 rounded-[4px] text-sm ${
                          action === "draft"
                            ? "bg-black text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        Bản nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAction("publish");
                          // Khi chuyển sang publish, set ngày đăng là thời điểm hiện tại
                          setPublishedAt(
                            new Date(
                              Date.now() -
                                new Date().getTimezoneOffset() * 60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          );
                        }}
                        className={`flex-1 w-[91px] h-10 rounded-[4px] text-sm ${
                          action === "publish"
                            ? "bg-black text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        Xuất bản
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction("upcoming")}
                        className={`flex-1 w-[120px] h-10 rounded-[4px] text-sm ${
                          action === "upcoming"
                            ? "bg-black text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        Hẹn ngày đăng
                      </button>
                    </div>

                    {/* Preview button */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handlePreview}
                        className="flex-1 w-[120px] h-10 rounded-[4px] text-sm bg-blue-500 text-white"
                      >
                        Xem trước
                      </button>
                    </div>
                    {isPreviewVisible && (
                      <PreviewNew
                        title={title}
                        content={content}
                        category={
                          categories.find((cat) => cat._id === category)
                            ?.name || ""
                        }
                        tags={tags}
                        onClose={handleClosePreview}
                      />
                    )}
                  </div>

                  <div className="mb-8">
                    <label className="block font-bold mb-4">
                      Hình đại diện<span className="text-red-500 ml-1">*</span>
                    </label>
                    <label className="w-[338px] h-[212px] border border-dashed border-gray-300 rounded-[12px] flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                      {loading ? (
                        <ClipLoader
                          color="#3B82F6"
                          loading={loading}
                          size={40}
                          aria-label="Đang xử lý"
                        />
                      ) : thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <>
                          <Image
                            src="/admin_new/cloud-upload.svg"
                            alt="upload"
                            width={32}
                            height={32}
                          />
                          <span className="mt-2 text-sm text-gray-500">
                            Hình đại diện
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="mb-6 relative">
                    <label className="block font-bold mb-4">
                      Danh mục<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-[12px] text-sm text-gray-700 appearance-none"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có danh mục
                        </option>
                      )}
                    </select>
                    <Image
                      src="/admin_user/chevron-down.svg"
                      width={20}
                      height={20}
                      alt="arrow down"
                      className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-4">
                      Tag<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Nhập tag, nhấn Enter hoặc dấu phẩy để thêm"
                      className="w-full h-12 px-4 border border-gray-300 rounded-[12px] text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="ml-2 text-red-500"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <ClipLoader
                        color="#ffffff"
                        loading={loading}
                        size={20}
                        aria-label="Đang xử lý"
                      />
                    ) : (
                      "Lưu tin tức"
                    )}
                  </button>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={showConfirm}
          title="Chuyển sang bản nháp?"
          description="Bạn có chắc chắn muốn chuyển bài viết đã xuất bản về trạng thái bản nháp? Bài viết sẽ không còn hiển thị công khai."
          onConfirm={() => {
            setAction("draft");
            setPublishedAt(""); // Xóa ngày đăng khi chuyển sang bản nháp
            setShowConfirm(false);
            setPendingAction(null);
            toast.success("Đã chuyển sang bản nháp!");
          }}
          onCancel={() => {
            setShowConfirm(false);
            setPendingAction(null);
          }}
        />
      </div>
    </div>
  );
}
