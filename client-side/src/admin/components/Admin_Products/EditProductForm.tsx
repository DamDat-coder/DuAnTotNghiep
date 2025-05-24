"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types/product";
import { ICategory } from "@/types/category";
import { editProduct } from "@/services/productApi";
import { fetchCategories } from "@/services/categoryApi";

interface EditProductFormProps {
  product: IProduct;
  productId: string;
}

const sizeOptions = [
  "Size S",
  "Size M",
  "Size L",
  "Size XL",
  "Size XXL",
  "Size 3XL",
];
const colorOptions = [
  { value: "black", label: "Đen", color: "#000000" },
  { value: "cyan", label: "Xanh da trời", color: "#87CEEB" },
  { value: "red", label: "Đỏ", color: "#FF0000" },
  { value: "white", label: "Trắng", color: "#FFFFFF" },
  { value: "pink", label: "Hồng", color: "#FFC0CB" },
  { value: "color", label: "Màu da", color: "#FAD2B6" },
  { value: "brown", label: "Nâu", color: "#8B4513" },
];
const brandOptions = [
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
  { value: "puma", label: "Puma" },
  { value: "gucci", label: "Gucci" },
];

const mapSizes = (sizes: string[] | undefined): string[] => {
  if (!sizes) return [];
  return sizes.map((size) => {
    if (size === "S") return "Size S";
    if (size === "M") return "Size M";
    if (size === "L") return "Size L";
    if (size === "XL") return "Size XL";
    if (size === "XXL") return "Size XXL";
    if (size === "3XL") return "Size 3XL";
    return size;
  });
};

export default function EditProductForm({
  product,
  productId,
}: EditProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<IProduct>({
    ...product,
    discountPercent: product.discountPercent ?? undefined,
    sizes: mapSizes(product.sizes),
    images: [],
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        setCategories(result);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Không thể tải danh mục.");
      }
    };
    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && name === "image") {
      const fileList = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: fileList, // Lưu File[] trực tiếp
      }));
    } else if (name === "price" || name === "discountPercent") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSizeChange = (size: string) => {
    setFormData((prev) => {
      const currentSizes = prev.sizes ?? [];
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter((s) => s !== size)
        : [...currentSizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name) {
      setError("Tên sản phẩm không được để trống.");
      return;
    }
    if (formData.price === undefined || formData.price < 0) {
      setError("Giá sản phẩm không được nhỏ hơn 0.");
      return;
    }
    if (
      formData.discountPercent !== undefined &&
      (formData.discountPercent < 0 || formData.discountPercent > 100)
    ) {
      setError("Phần trăm giảm giá phải từ 0 đến 100.");
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      setError("Vui lòng chọn ít nhất một file ảnh.");
      return;
    }
    // Kiểm tra định dạng file
    const validFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalidFiles = (formData.images as File[]).filter(
      (file) => !validFormats.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setError("Chỉ hỗ trợ file ảnh (jpg, jpeg, png, gif, webp).");
      return;
    }
    // Kiểm tra kích thước file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = (formData.images as File[]).filter(
      (file) => file.size > maxSize
    );
    if (oversizedFiles.length > 0) {
      setError("File ảnh không được lớn hơn 5MB.");
      return;
    }

    try {
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.category
      );
      if (!selectedCategory) {
        setError("Danh mục không hợp lệ.");
        return;
      }

      const productData = {
        name: formData.name,
        categoryId: selectedCategory.id,
        price: formData.price,
        discountPercent: formData.discountPercent,
        images: formData.images as File[],
      };

      console.log("Submitting product data:", productData);

      const updatedProduct = await editProduct(productId, productData);
      if (!updatedProduct) {
        throw new Error("Không thể cập nhật sản phẩm.");
      }

      alert("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật sản phẩm.");
    }
  };

  return (
    <>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-[60%] mx-auto flex flex-col gap-4"
      >
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Tên sản phẩm
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Giá sản phẩm (VNĐ)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price ?? ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            placeholder="0"
          />
          <p className="mt-1 text-sm text-gray-500">
            Để trống để đặt giá trị mặc định là 0.
          </p>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Phần trăm giảm giá (%)
          </label>
          <input
            type="number"
            name="discountPercent"
            value={formData.discountPercent ?? ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            placeholder="0"
          />
          <p className="mt-1 text-sm text-gray-500">
            Để trống để đặt giá trị mặc định là 0.
          </p>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Ảnh (chọn file ảnh)
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          {formData.images && formData.images.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              File đã chọn:{" "}
              {(formData.images as File[]).map((file) => file.name).join(", ")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Kích thước
          </label>
          <div className="grid grid-cols-4 gap-2 mt-2 justify-items-stretch min-w-0">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`w-full flex items-center justify-center text-base font-medium rounded border p-2 whitespace-nowrap ${
                  formData.sizes?.includes(size)
                    ? "border-black border-2"
                    : "border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2 w-full bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 w-full bg-black text-white font-semibold rounded-md hover:opacity-80 transition-opacity"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </>
  );
}
