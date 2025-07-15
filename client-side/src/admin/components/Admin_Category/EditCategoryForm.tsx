"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { fetchCategoryTree, updateCategory } from "@/services/categoryApi";

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string | null;
  children?: Category[];
}

interface EditCategoryFormProps {
  category: Category;
  onClose?: () => void;
}

// Hàm lấy tất cả id con/cháu (dùng để loại khỏi dropdown)
function getAllChildIds(node: Category): string[] {
  if (!node.children || node.children.length === 0) return [];
  let ids: string[] = [];
  node.children.forEach(child => {
    ids.push(child.id);
    ids = ids.concat(getAllChildIds(child));
  });
  return ids;
}

// Hàm tìm node theo id trong cây
function findNodeById(nodes: Category[], id: string): Category | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Hàm lọc loại bỏ các node có tên "Bài Viết" (và children của nó)
function filterOutBaiViet(nodes: Category[]): Category[] {
  return nodes
    .filter(cat => cat.name?.trim().toLowerCase() !== "bài viết")
    .map(cat => ({
      ...cat,
      children: cat.children ? filterOutBaiViet(cat.children) : [],
    }));
}

export default function EditCategoryForm({
  category: initialCategory,
  onClose,
}: EditCategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    id: String(initialCategory.id),
    name: initialCategory.name,
    description: initialCategory.description,
    parentId: initialCategory.parentId ? String(initialCategory.parentId) : "",
  });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lưu danh sách tất cả các id con/cháu của chính nó để exclude khỏi dropdown
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategoryTree();

        // Chuẩn hóa id và parentId thành string, children đệ quy
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
        // Normalize + lọc "Bài Viết"
        const normalized = filterOutBaiViet(normalizeCats(cats));
        setAllCategories(normalized);

        // Tìm node hiện tại và lấy all id con/cháu
        const currentNode = findNodeById(normalized, String(initialCategory.id));
        if (currentNode) {
          setExcludedIds([currentNode.id, ...getAllChildIds(currentNode)]);
        } else {
          setExcludedIds([String(initialCategory.id)]);
        }
      } catch (err) {
        setError("Không thể tải danh mục cha.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialCategory.id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory(formData.id, {
        ...formData,
        parentId: formData.parentId === "" ? null : formData.parentId,
      });
      alert("Cập nhật danh mục thành công!");
      if (onClose) onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi khi cập nhật.");
    }
  };

  // renderOptions mới, exclude các id bị cấm (chính nó & all con/cháu & các node đã là "Bài Viết")
  const renderOptions = (
    nodes: Category[],
    depth = 0,
    path = ""
  ): JSX.Element[] => {
    return nodes.flatMap((cat) => {
      if (!cat.id || excludedIds.includes(cat.id)) return [];
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

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold py-8">{error}</div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-8 mx-auto shadow-md">
      <h2 className="text-[20px] font-bold mb-6">Sửa danh mục</h2>
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
        <button
          type="submit"
          className="w-full mt-4 bg-black text-white text-base font-semibold py-3 rounded-full hover:opacity-90 transition-all"
        >
          Cập nhật danh mục
        </button>
      </form>
    </div>
  );
}
