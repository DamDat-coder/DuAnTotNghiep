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

const Editor = dynamic(() => import("../ui/Editor"), { ssr: false });

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_NEW_PRESET;

export default function AddNewModal({ onClose }: { onClose: () => void }) {
  const [image, setImage] = useState<string | null>(null); // Chỉ dùng URL từ Cloudinary
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"draft" | "preview" | "publish">(
    "draft"
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.debug("Debug: Bắt đầu tải ảnh lên Cloudinary");
    console.debug("Debug: CLOUDINARY_CLOUD_NAME", CLOUDINARY_CLOUD_NAME);

    if (!file) {
      console.debug("Debug: Không có file được chọn");
      setError("Không có tệp hình ảnh được chọn.");
      return;
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.debug("Debug: Thiếu thông tin cấu hình Cloudinary", {
        CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_UPLOAD_PRESET,
      });
      setError("Thiếu thông tin Cloudinary.");
      return;
    }

    console.debug("Debug: Thông tin file", {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type,
    });

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "news");

    console.debug("Debug: Gửi yêu cầu tải ảnh tới Cloudinary", {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: "news",
    });

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.debug("Debug: Phản hồi từ Cloudinary", {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.debug("Debug: Lỗi từ Cloudinary", errorData);
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.debug("Debug: Tải ảnh thành công", {
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
      });
      setImage(data.secure_url); // Lưu URL sau khi upload
    } catch (err) {
      console.error("Debug: Lỗi khi tải ảnh lên Cloudinary", err);
      setError("Lỗi khi tải hình ảnh lên Cloudinary.");
    } finally {
      setLoading(false);
      console.debug("Debug: Kết thúc quá trình tải ảnh");
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTags = e.target.value.split(/[, ]+/).filter((tag) => tag.trim());
    setTags(inputTags);
  };

  const handleSubmit = async () => {
    if (action === "publish" && !date) {
      setError("Vui lòng chọn ngày đăng khi xuất bản!");
      return;
    }

    setError(null);

    const selectedCategory = categories.find((cat) => cat._id === category);
    if (!selectedCategory && category) {
      setError("Danh mục không hợp lệ.");
      return;
    }

    const payload: NewsPayload = {
      title,
      content,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      category_id: selectedCategory || { _id: category, name: "" },
      tags,
      is_published: action === "publish",
      thumbnail: image || null,
      news_image: image ? [image] : [],
      published_at: action === "publish" ? new Date(date) : undefined,
    };

    console.log("Payload to send:", payload);

    try {
      const createdNews = await createNews(payload);
      toast.success("Tạo tin tức thành công!");

      // Nếu hành động là "publish", cập nhật tin tức để đặt is_published và published_at
      if (action === "publish") {
        if (!createdNews.id) {
          throw new Error("ID tin tức không hợp lệ sau khi tạo");
        }
        await updateNews(createdNews.id, {
          is_published: true,
          published_at: new Date(date),
        });
        toast.success("Cập nhật trạng thái xuất bản thành công!");
      }

      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
    } catch (err: any) {
      console.error("Lỗi khi tạo hoặc cập nhật tin tức:", err);
      setError(err.message);
      toast.error("Đã xảy ra lỗi khi tạo tin tức.");
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoryTree();
        console.log("Loaded categories:", data);
        setCategories(data);
      } catch (err) {
        setError("Lỗi khi tải danh mục.");
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

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
              </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-2 w-[370px] bg-white rounded-[12px]">
              <div className="m-4 ">
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
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={action !== "publish"}
                      className="w-full h-[46px] border border-[#D1D1D1] rounded-[12px] appearance-none"
                    />
                    <Image
                      src="/admin_sale/date.svg"
                      width={18}
                      height={18}
                      alt="calendar"
                      className="absolute right-3 top-[calc(50%-10px)] transform -translate-y-1/2 pointer-events-none"
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
                        Lưu bản nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction("preview")}
                        className={`flex-1 w-[94px] h-10 rounded-[4px] text-sm ${
                          action === "preview"
                            ? "bg-black text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        Xem trước
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
                    </div>
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
                          aria-label="Đang tải ảnh"
                        />
                      ) : image ? (
                        <img
                          src={image}
                          alt="Preview"
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
                            New Image
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
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
                      value={tags.join(", ")}
                      onChange={handleTagsChange}
                      placeholder="Nhập tag (tách bằng dấu phẩy hoặc khoảng trắng)"
                      className="w-full h-12 px-4 border border-gray-300 rounded-[12px] text-sm"
                    />
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
