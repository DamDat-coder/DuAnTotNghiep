"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { News } from "@/types/new";
import { updateNews } from "@/services/newApi";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ICategory } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";
import { IUser } from "@/types/auth";

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
  const [category, setCategory] = useState(newsData.category_id._id);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState(newsData.thumbnail);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(!!newsData.is_published);
  const [publishedAt, setPublishedAt] = useState<string>(
    newsData.published_at ? new Date(newsData.published_at).toISOString().slice(0, 16) : ""
  );

  useEffect(() => {
    setTitle(newsData.title);
    setContent(newsData.content);
    setTags(newsData.tags || []);
    setCategory(newsData.category_id._id);
    setImage(newsData.thumbnail || null);
    setIsPublished(!!newsData.is_published);
    setPublishedAt(
      newsData.published_at ? new Date(newsData.published_at).toISOString().slice(0, 16) : ""
    );
  }, [newsData]); // Đảm bảo khi data thay đổi sẽ update lại các state

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

    // Nếu truyền publishStatus thì dùng, không thì lấy theo state
    const is_published = typeof publishStatus === "boolean" ? publishStatus : isPublished;
    const published_at =
      is_published
        ? (publishedAt ? new Date(publishedAt) : new Date())
        : null;

    const updatedNewsData: Partial<News> = {
      title,
      content,
      tags,
      category_id: selectedCategory,
      thumbnail: image || null,
      is_published,
      published_at,
    };

    try {
      await updateNews(newsData._id as string, updatedNewsData);
      toast.success("Cập nhật tin tức thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError("Lỗi khi cập nhật tin tức.");
      toast.error("Cập nhật thất bại!");
      console.error("Update failed:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Thực hiện upload lên Cloudinary (nếu có)
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET || ""
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setImage(data.secure_url); // Lưu lại URL hình ảnh
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      setError("Lỗi khi tải hình ảnh lên Cloudinary.");
    }
  };
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTags = e.target.value.split(/[, ]+/).filter((tag) => tag.trim());
    setTags(inputTags);
  };
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoryTree();
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
                  value={content || ""}
                  onChange={(newContent: string) => setContent(newContent)}
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
                      {false && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      disabled={!isPublished}
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
                      {/* Lưu bản nháp */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPublished(false);
                          handleSave(false);
                        }}
                        className="flex-1 w-[120px] h-10 rounded-[4px] text-sm"
                      >
                        Lưu bản nháp
                      </button>

                      {/* Xem trước */}
                      <button
                        type="button"
                        onClick={() => {
                          // Xử lý xem trước nếu cần
                        }}
                        className="flex-1 w-[94px] h-10 rounded-[4px] text-sm"
                      >
                        Xem trước
                      </button>

                      {/* Xuất bản */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPublished(true);
                          handleSave(true);
                        }}
                        className="flex-1 w-[91px] h-10 rounded-[4px] text-sm"
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
                      {image ? (
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
                    onClick={handleSave}
                    className="w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-6"
                  >
                    Lưu tin tức
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
