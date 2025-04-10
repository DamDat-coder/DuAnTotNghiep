// src/admin/components/EditProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types/index";

interface EditProductFormProps {
  product: IProduct;
  productId: string;
}

// Danh sách options (tái sử dụng từ AddProductForm)
const sizeOptions = ["Size S", "Size M", "Size L", "Size XL", "Size XXL", "Size 3XL"];

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

// Ánh xạ giá trị cũ sang giá trị mới
const mapColor = (color: string | undefined): string => {
  if (!color) return "";
  if (color === "Trắng") return "white";
  return color; // Giữ nguyên nếu đã đúng định dạng (ví dụ: "cyan")
};

const mapSizes = (sizes: string[] | undefined): string[] => {
  if (!sizes) return [];
  return sizes.map((size) => {
    if (size === "S") return "Size S";
    if (size === "M") return "Size M";
    if (size === "L") return "Size L";
    if (size === "XL") return "Size XL";
    if (size === "XXL") return "Size XXL";
    if (size === "3XL") return "Size 3XL";
    return size; // Giữ nguyên nếu đã đúng định dạng (ví dụ: "Size S")
  });
};

export default function EditProductForm({ product, productId }: EditProductFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<IProduct>({
    ...product,
    discountPercent: product.discountPercent ?? undefined,
    color: mapColor(product.color), // Ánh xạ color
    sizes: mapSizes(product.sizes), // Ánh xạ sizes
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement; // Ép kiểu để hỗ trợ files
    if (files && (name === "image" || name === "banner")) {
      // Xử lý file cho image và banner
      const file = files[0];
      if (file) {
        if (name === "image") {
          setFormData((prev) => ({
            ...prev,
            image: [file.name], // Lưu tên file vào mảng
          }));
        } else if (name === "banner") {
          setFormData((prev) => ({
            ...prev,
            banner: file.name,
          }));
        }
      }
    } else if (name === "price" || name === "discountPercent") {
      // Xử lý price và discountPercent: Cho phép để trống
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      // Xử lý các field khác
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Xử lý chọn kích thước (sizes)
  const handleSizeChange = (size: string) => {
    setFormData((prev) => {
      // Đảm bảo prev.sizes luôn là mảng, nếu undefined thì dùng []
      const currentSizes = prev.sizes ?? [];
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter((s) => s !== size) // Bỏ chọn
        : [...currentSizes, size]; // Thêm vào
      return { ...prev, sizes: newSizes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.name === "") {
      setError("Tên sản phẩm không được để trống.");
      return;
    }

    if (formData.price === undefined || formData.price < 0) {
      setError("Giá sản phẩm không được nhỏ hơn 0.");
      return;
    }

    if (formData.image.length === 0) {
      setError("Vui lòng chọn ít nhất một ảnh cho sản phẩm.");
      return;
    }

    if (formData.banner === "") {
      setError("Banner không được để trống.");
      return;
    }

    if (
      formData.discountPercent !== undefined &&
      (formData.discountPercent < 0 || formData.discountPercent > 100)
    ) {
      setError("Phần trăm giảm giá phải từ 0 đến 100.");
      return;
    }

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await fetch(
          `https://67e3b0622ae442db76d1204c.mockapi.io/products/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
              price: formData.price ?? 0, // Đặt mặc định là 0 nếu undefined
              discountPercent: formData.discountPercent ?? 0, // Đặt mặc định là 0 nếu undefined
            }),
          }
        );

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "5";
          await new Promise((resolve) =>
            setTimeout(resolve, parseInt(retryAfter) * 1000)
          );
          retries++;
          continue;
        }

        if (!response.ok) throw new Error("Không thể cập nhật sản phẩm.");
        alert("Cập nhật sản phẩm thành công!");
        router.push("/admin/products");
        return;
      } catch (err) {
        setError("Có lỗi xảy ra khi cập nhật sản phẩm.");
        return;
      }
    }
    setError("Max retries reached due to 429 errors");
  };

  return (
    <>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 w-[60%] mx-auto flex flex-col gap-4">
        {/* Tên sản phẩm */}
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

        {/* Danh mục */}
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
            <option value="Áo">Áo</option>
            <option value="Áo khoác">Áo khoác</option>
            <option value="Quần">Quần</option>
            <option value="Giày">Giày</option>
            <option value="Phụ kiện">Phụ kiện</option>
          </select>
        </div>

        {/* Giá sản phẩm */}
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

        {/* Phần trăm giảm giá */}
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

        {/* Ảnh */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Ảnh (chọn file ảnh)
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
          />
          {formData.image && formData.image.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              File hiện tại: {formData.image[0]}
            </p>
          )}
        </div>

        {/* Banner */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Banner (chọn file ảnh)
          </label>
          <input
            type="file"
            name="banner"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
          />
          {formData.banner && (
            <p className="mt-2 text-sm text-gray-500">
              File hiện tại: {formData.banner}
            </p>
          )}
        </div>

        {/* Giới tính */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Giới tính
          </label>
          <select
            name="gender"
            value={formData.gender || "Unisex"}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Unisex">Unisex</option>
            <option value="Nam">Nam</option>
          </select>
        </div>

        {/* Kích thước */}
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

        {/* Màu sắc */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Màu sắc
          </label>
          <select
            name="color"
            value={formData.color || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn màu</option>
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Thương hiệu */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Thương hiệu
          </label>
          <select
            name="brand"
            value={formData.brand || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn thương hiệu</option>
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nút hành động */}
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