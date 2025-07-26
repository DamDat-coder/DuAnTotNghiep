"use client";
import { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import { fetchCategoryTree, updateCategory } from "@/services/categoryApi";
import { toast } from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string | null;
  parentId?: string | null;
  children?: Category[];
}

interface EditCategoryFormProps {
  category: Category;
  onClose?: () => void;
  onSuccess?: () => void;
}

function getAllChildIds(node: Category): string[] {
  if (!node.children || node.children.length === 0) return [];
  let ids: string[] = [];
  node.children.forEach(child => {
    ids.push(child._id);
    ids = ids.concat(getAllChildIds(child));
  });
  return ids;
}

function findNodeById(nodes: Category[], id: string): Category | null {
  for (const node of nodes) {
    if (node._id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function filterOutBaiViet(nodes: Category[]): Category[] {
  return nodes
    .filter(cat => cat.name?.trim().toLowerCase() !== "bài viết")
    .map(cat => ({
      ...cat,
      children: cat.children ? filterOutBaiViet(cat.children) : [],
    }));
}

function normalizeCats(arr: any[]): Category[] {
  return arr
    .filter(cat => !!cat._id)
    .map(cat => ({
      _id: String(cat._id),
      name: cat.name,
      description: cat.description || "",
      image: cat.image ?? null,
      parentId: cat.parentId ? String(cat.parentId) : "",
      children: Array.isArray(cat.children) ? normalizeCats(cat.children) : [],
    }));
}

export default function EditCategoryForm({
  category: initialCategory,
  onClose,
  onSuccess,
}: EditCategoryFormProps) {
  const [formData, setFormData] = useState({
    _id: String(initialCategory._id),
    name: initialCategory.name,
    description: initialCategory.description,
    parentId: initialCategory.parentId ? String(initialCategory.parentId) : "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialCategory.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategoryTree();
        const normalized = filterOutBaiViet(normalizeCats(cats));
        setAllCategories(normalized);

        const currentNode = findNodeById(normalized, String(initialCategory._id));
        if (currentNode) {
          setExcludedIds([currentNode._id, ...getAllChildIds(currentNode)]);
        } else {
          setExcludedIds([String(initialCategory._id)]);
        }
      } catch (err) {
        setError("Không thể tải danh mục cha.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [initialCategory._id]);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCategory(
        formData._id,
        {
          ...formData,
          parentId: formData.parentId === "" ? null : formData.parentId,
        },
        imageFile || undefined
      );
      toast.success("Cập nhật danh mục thành công!");
      onSuccess?.();
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi cập nhật."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (
    nodes: Category[],
    depth = 0,
    path = ""
  ): JSX.Element[] => {
    return nodes.flatMap((cat) => {
      if (!cat._id || excludedIds.includes(cat._id)) return [];
      const optionKey = `${path}-${cat._id}`;
      return [
        <option key={optionKey} value={cat._id}>
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
      <h2 className="text-[20px] font-bold mb-6">Sửa danh mục</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Ảnh danh mục */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Ảnh danh mục
          </label>
          {imagePreview && (
            <div className="mb-2">
              {imagePreview.startsWith("blob:") ? (
                <img
                  src={imagePreview}
                  alt="Category preview"
                  width={90}
                  height={90}
                  className="rounded-lg object-cover border"
                  style={{ maxHeight: 90, maxWidth: 90 }}
                />
              ) : (
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  width={90}
                  height={90}
                  className="rounded-lg object-cover border"
                />
              )}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
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
              Đang cập nhật...
            </span>
          ) : (
            "Cập nhật danh mục"
          )}
        </button>
      </form>
    </div>
  );
}
