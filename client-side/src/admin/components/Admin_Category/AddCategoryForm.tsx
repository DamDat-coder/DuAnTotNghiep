"use client";
import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { fetchCategoryTree, addCategory } from "@/services/categoryApi";
import { toast } from "react-hot-toast";
import * as React from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string | null;
  children?: Category[];
}

interface AddCategoryFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

function filterOutBaiViet(nodes: Category[]): Category[] {
  return nodes
    .filter((cat) => cat.name?.trim().toLowerCase() !== "bài viết")
    .map((cat) => ({
      ...cat,
      children: cat.children ? filterOutBaiViet(cat.children) : [],
    }));
}

export default function AddCategoryForm({ onClose, onSuccess }: AddCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategoryTree();
        function normalizeCats(arr: any[]): Category[] {
          return arr
            .filter(cat => !!(cat.id || cat._id))
            .map(cat => ({
              id: String(cat.id || cat._id),
              name: cat.name,
              description: cat.description || "",
              parentId: cat.parentId ? String(cat.parentId) : "",
              children: Array.isArray(cat.children) ? normalizeCats(cat.children) : [],
            }));
        }
        setAllCategories(filterOutBaiViet(normalizeCats(cats)));
      } catch (err) {
        setError("Không thể tải danh mục cha.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả danh mục.");
      return;
    }
    setLoading(true);
    try {
      await addCategory(
        {
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId === "" ? null : formData.parentId,
        },
        imageFile || undefined
      );
      toast.success("Thêm danh mục thành công!");
      onSuccess?.();
      if (onClose) onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi thêm danh mục.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (
    nodes: Category[],
    depth = 0,
    path = ""
  ): React.ReactElement[] => {
    return nodes.flatMap((cat) => {
      if (!cat.id) return [];
      const optionKey = `${path}-${cat.id}`;
      return [
        <option key={optionKey} value={cat.id}>
          {"—".repeat(depth)} {cat.name}
        </option>,
        ...(cat.children && cat.children.length > 0
          ? renderOptions(cat.children, depth + 1, optionKey)
          : []),
      ];
    });
  };

  if (fetching) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold py-8">{error}</div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-8 mx-auto shadow-md max-h-[90vh] overflow-y-auto">
      <h2 className="text-[20px] font-bold mb-6">Thêm danh mục</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Tên danh mục */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên danh mục"
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {/* Mô tả danh mục */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Mô tả danh mục <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Nhập nội dung mô tả..."
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {/* Danh mục cha */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Danh mục cha
          </label>
          <select
            name="parentId"
            value={formData.parentId ?? ""}
            onChange={handleChange}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Không có danh mục cha --</option>
            {renderOptions(allCategories)}
          </select>
        </div>
        {/* Ảnh danh mục */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Ảnh danh mục
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="p-2 border border-gray-300 rounded"
          />
          {/* Preview ảnh (Next/Image) */}
          {imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview}
                alt="Category Preview"
                width={100}
                height={100}
                className="rounded-lg border object-cover"
                style={{ maxHeight: 100, maxWidth: 100 }}
                unoptimized
                priority
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-4 bg-black text-white text-base font-semibold py-3 rounded-full hover:opacity-90 transition-all flex items-center justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Đang thêm...
            </span>
          ) : (
            "Thêm danh mục"
          )}
        </button>
      </form>
    </div>
  );
}
