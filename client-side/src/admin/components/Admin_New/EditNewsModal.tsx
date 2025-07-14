"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { News, NewsPayload } from "@/types/new";
import { updateNews } from "@/services/newApi";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ICategory } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";
import { ClipLoader } from "react-spinners";
import PreviewNew from "./PreviewNew";

const Editor = dynamic(() => import("../ui/Editor"), { ssr: false });

const EditNewsModal = ({
  newsData,
  onClose,
}: {
  newsData: News;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState(newsData.title);
  const [content, setContent] = useState(newsData.content);
  const [tags, setTags] = useState(newsData.tags || []);
  const [tagInput, setTagInput] = useState(""); // Thêm dòng này
  const [category, setCategory] = useState(newsData.category_id._id);
  const [thumbnail, setThumbnail] = useState<File | null>(null); // Store File for thumbnail
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    newsData.thumbnail || null
  ); // Store URL for preview
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(
    !!newsData.is_published
  );
  const [publishedAt, setPublishedAt] = useState<string>(
    newsData.published_at
      ? new Date(newsData.published_at).toISOString().slice(0, 16)
      : ""
  );
  const [action, setAction] = useState<"draft" | "publish">(
    newsData.is_published ? "publish" : "draft"
  );
  const [meta_description, setMeta_description] = useState(
    newsData.meta_description || ""
  );
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(newsData.title);
    setContent(newsData.content);
    setTags(newsData.tags || []);
    setCategory(newsData.category_id._id);
    setThumbnail(null); // Reset thumbnail file
    setThumbnailPreview(newsData.thumbnail || null); // Set initial preview
    setIsPublished(!!newsData.is_published);
    setPublishedAt(
      newsData.published_at
        ? new Date(newsData.published_at).toISOString().slice(0, 16)
        : ""
    );
    setMeta_description(newsData.meta_description || "");
    setAction(newsData.is_published ? "publish" : "draft");
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
      setThumbnailPreview(URL.createObjectURL(file)); // Update preview
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setTags(inputTags);
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

  const handleSave = async (publishStatus?: boolean) => {
    if (!title || !content || !category) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const selectedCategory = categories.find((cat) => cat._id === category);
    if (!selectedCategory) {
      setError("Danh mục không hợp lệ.");
      return;
    }

    if (action === "publish" && !publishedAt) {
      setError("Vui lòng chọn ngày đăng khi xuất bản!");
      return;
    }

    const is_published =
      typeof publishStatus === "boolean" ? publishStatus : isPublished;
    const published_at: Date | undefined = is_published
      ? publishedAt
        ? new Date(publishedAt)
        : new Date()
      : undefined;

    try {
      setLoading(true);
      await updateNews(newsData._id ?? "", {
        title,
        content,
        tags,
        category_id: {
          _id: category,
          name: categories.find((cat) => cat._id === category)?.name,
        },
        thumbnail: thumbnail ?? undefined, // Ensure type is File | undefined
        is_published,
        published_at,
        meta_description,
      });
      toast.success("Cập nhật tin tức thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError("Lỗi khi cập nhật tin tức.");
      toast.error("Cập nhật thất bại!");
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-[#F8FAFC] shadow-xl w-[1086px] max-w-full max-h-[90vh] overflow-y-auto relative">
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
              </div>
              <div className="mt-6">
                <label className="block font-bold mb-4">
                  Mô tả SEO <span>(&lt;150 ký tự)</span>
                </label>
                <textarea
                  placeholder="Nhập mô tả SEO"
                  value={meta_description}
                  onChange={(e) => setMeta_description(e.target.value)}
                  className="w-full h-24 px-4 border border-gray-200 rounded-[12px] text-[#94A3B8]"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-2 w-[370px] bg-white rounded-[12px]">
              <div className="m-4">
                <div className="space-y-6">
                  <div className="relative mb-8">
                    <label className="block font-bold mb-4">
                      Ngày đăng
                      {action === "publish" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      disabled={action !== "publish"}
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
                          setAction("draft");
                          setIsPublished(false);
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
                          setIsPublished(true);
                        }}
                        className={`flex-1 w-[91px] h-10 rounded-[4px] text-sm ${
                          action === "publish"
                            ? "bg-black text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        Xuất bản
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
                  </div>
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
                  <button
                    type="button"
                    onClick={() => handleSave()}
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
      </div>
    </div>
  );
};

export default EditNewsModal;
