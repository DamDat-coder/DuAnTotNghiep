"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ICategory } from "@/types/category";
import { News, NewsPayload } from "@/types/new";
import { IUser } from "@/types/auth";
import { createNews, updateNews } from "@/services/newApi";
import { fetchCategoryTree } from "@/services/categoryApi";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import PreviewNew from "./PreviewNew";

const Editor = dynamic(() => import("../ui/Editor"), { ssr: false });

export default function AddNewModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState(""); // Thêm state này
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"draft" | "publish" | "upcoming">(
    "draft"
  );
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [newsImages, setNewsImages] = useState<File[]>([]);
  const [meta_description, setMeta_description] = useState("");
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const handlePreview = () => {
    setIsPreviewVisible(true); // Show the preview modal
  };

  const handleClosePreview = () => {
    setIsPreviewVisible(false); // Close the preview modal
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow both commas and spaces as valid tag separators
    const inputTags = e.target.value
      .split(/[,; \t]+/) // Split by comma, space, semicolon or tabs
      .map((tag) => tag.trim()) // Trim spaces from each tag
      .filter((tag) => tag); // Filter out empty strings

    setTags(inputTags); // Update the tags state
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

  const handleSubmit = async () => {
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
    if (!thumbnail) {
      toast.error("Vui lòng chọn hình đại diện!");
      return;
    }
    if (!meta_description) {
      toast.error("Vui lòng nhập mô tả SEO!");
      return;
    }
    if (action === "publish" && !date) {
      toast.error("Vui lòng chọn ngày đăng khi xuất bản!");
      return;
    }

    setError(null);

    const selectedCategory = categories.find((cat) => cat._id === category);
    if (!selectedCategory && category) {
      setError("Danh mục không hợp lệ.");
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-");
    const category_id = selectedCategory || { _id: category, name: "" };

    console.log("scheduleDate:", scheduleDate);
    console.log("new Date(scheduleDate):", new Date(scheduleDate));

    let publishedAtValue: Date | undefined = undefined;
    if (action === "upcoming" && scheduleDate) {
      const dateObj = new Date(scheduleDate);
      if (!isNaN(dateObj.getTime())) {
        publishedAtValue = dateObj;
      } else {
        setError("Ngày đăng không hợp lệ!");
        return;
      }
    }

    const payload: NewsPayload = {
      title,
      content,
      slug,
      category_id,
      tags,
      is_published: action === "publish",
      published_at:
        action === "upcoming"
          ? publishedAtValue
          : action === "publish"
          ? new Date()
          : undefined,
      meta_description,
    };

    console.log("Payload to send:", {
      ...payload,
      thumbnail: payload.thumbnail?.name,
    });

    try {
      setLoading(true);
      // Gọi API tạo/sửa tin tức
      const createdNews = await createNews(payload);
      toast.success("Tạo tin tức thành công!");

      if (action === "publish") {
        if (!createdNews.id) {
          throw new Error("ID tin tức không hợp lệ sau khi tạo");
        }
        await updateNews(createdNews.id, {
          is_published: true,
          published_at: new Date(date),
        });
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Lỗi khi tạo hoặc cập nhật tin tức:", err);
      setError(err.message);
      toast.error("Đã xảy ra lỗi khi tạo tin tức.");
    } finally {
      setLoading(false);
    }
  };
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

  // Hàm hiển thị trạng thái tin tức
  const getStatusLabel = (news: News) => {
    if (news.is_published) return "Xuất bản";
    if (
      news.published_at &&
      new Date(news.published_at) > new Date() &&
      !news.is_published
    )
      return "Sắp xuất bản";
    return "Bản nháp";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-[#F8FAFC] shadow-xl w-[1086px] max-w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px]">
            <h2 className="text-lg font-bold">Thêm Tin Tức Mới</h2>
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
              <div className="m-4 ">
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
                  value={content}
                  onChange={(newContent) => setContent(newContent)}
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
              <div className="m-4 ">
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
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={action !== "publish" && action !== "upcoming"}
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
                        onClick={() => setAction("draft")}
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
                        onClick={() => setAction("publish")}
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

                    {/* Add Preview button to show content preview before publish */}
                    <div className="mt-4">
                      {action === "draft" ||
                      action === "publish" ||
                      action === "upcoming" ? (
                        <button
                          type="button"
                          onClick={handlePreview}
                          className="flex-1 w-[120px] h-10 rounded-[4px] text-sm bg-blue-500 text-white"
                        >
                          Xem trước
                        </button>
                      ) : null}
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
                      ) : thumbnail ? (
                        <img
                          src={URL.createObjectURL(thumbnail)}
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
                  {/* Display the tags as individual tag elements */}
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
                    onClick={handleSubmit}
                    className="w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-6"
                  >
                    Tạo tin tức
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
}
