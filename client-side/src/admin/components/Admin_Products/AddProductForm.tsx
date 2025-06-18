"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { addProduct } from "@/services/productApi";
import { fetchCategories } from "@/services/categoryApi";
import { ICategory } from "@/types/category";

const sizeOptions = ["S", "M", "L", "XL", "2XL"];
const colorOptions = [
  { value: "Đen", label: "Đen" },
  { value: "Trắng", label: "Trắng" },
  { value: "Xám", label: "Xám" },
  { value: "Đỏ", label: "Đỏ" },
  { value: "Hồng", label: "Hồng" },
];

export default function AddProductForm({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    variants: [],
    images: [],
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tạm cho biến thể mới (UI control, không ảnh hưởng variants cũ)
  const [newVariant, setNewVariant] = useState<any>({
    size: "",
    color: "",
    price: "",
    discountPercent: "",
    stock: "",
  });

  // Lấy danh mục
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        setCategories(result);
      } catch (err) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Xử lý upload hình ảnh
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Thay đổi input chính (trừ biến thể)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: Array.from(files),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Thay đổi biến thể cũ
  const handleVariantChange = (idx: number, field: string, value: any) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[idx][field] = value;
      return { ...prev, variants };
    });
  };

  // Xóa biến thể cũ
  const handleRemoveVariant = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  // Thay đổi biến thể mới
  const handleNewVariantChange = (field: string, value: any) => {
    setNewVariant((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Thêm biến thể mới vào danh sách
  const handleAddVariant = () => {
    if (
      !newVariant.size ||
      !newVariant.color ||
      !newVariant.price ||
      !newVariant.stock
    ) {
      setError("Vui lòng nhập đầy đủ biến thể mới trước khi thêm!");
      return;
    }
    setError(null);
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: newVariant.size,
          color: newVariant.color,
          price: newVariant.price,
          discountPercent: newVariant.discountPercent,
          stock: newVariant.stock,
        },
      ],
    }));
    setNewVariant({
      size: "",
      color: "",
      price: "",
      discountPercent: "",
      stock: "",
    });
  };

  // Hiển thị preview + upload (y chang Edit)
  const renderImagesBlock = () => {
    const previews =
      formData.images && formData.images.length > 0
        ? (formData.images as File[]).map((file: File, i: number) => (
            <div
              key={i}
              className="w-[130px] h-[130px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative border"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={130}
                height={131}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          ))
        : [];

    // Nếu số ảnh > 3 thì show 3 ảnh + 1 box "+N"
    const previewsToShow =
      previews.length > 3
        ? [
            ...previews.slice(0, 3),
            <div
              key="more"
              className="w-[130px] h-[131px] rounded-xl flex items-center justify-center bg-gray-100 text-xl font-semibold border"
            >
              +{previews.length - 3}
            </div>,
          ]
        : previews;

    // Nút upload ảnh card style
    return (
      <div className="flex gap-4 mt-2 flex-wrap">
        {previewsToShow}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            name="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="w-[130px] h-[131px] flex flex-col items-center justify-center rounded-xl bg-[#F8F9FB] border border-dashed border-gray-200 hover:bg-[#f3f4f6] transition cursor-pointer"
            onClick={handleImageUploadClick}
          >
            <Image src="/admin/upload.png" width={60} height={60} alt="Upload" />
            <span className="font-medium text-black text-sm mt-2">New Image</span>
          </button>
        </div>
      </div>
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name.trim()) return setError("Tên sản phẩm không được để trống.");
    if (!formData.categoryId) return setError("Vui lòng chọn danh mục.");
    if (!formData.description.trim()) return setError("Vui lòng nhập mô tả sản phẩm.");
    if (!formData.variants.length) return setError("Phải có ít nhất một biến thể.");
    for (let v of formData.variants) {
      if (!v.size || !v.color || !v.price || !v.stock)
        return setError("Các trường size, màu, giá, tồn kho là bắt buộc cho từng biến thể.");
      if (Number(v.price) < 0) return setError("Giá không được nhỏ hơn 0.");
      if (Number(v.stock) < 0) return setError("Tồn kho không được nhỏ hơn 0.");
      if (v.discountPercent && (v.discountPercent < 0 || v.discountPercent > 100))
        return setError("Phần trăm giảm giá phải từ 0 đến 100.");
    }
    if (formData.images && formData.images.length > 0) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      for (let img of formData.images) {
        if (!validTypes.includes(img.type)) return setError("Chỉ hỗ trợ ảnh jpg, png, webp.");
        if (img.size > 5 * 1024 * 1024) return setError("File ảnh không quá 5MB.");
      }
    } else {
      return setError("Vui lòng chọn ít nhất một ảnh.");
    }

    setIsSubmitting(true);
    try {
      // Slug từ tên
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const res = await addProduct({
        name: formData.name,
        slug,
        description: formData.description,
        categoryId: formData.categoryId,
        variants: formData.variants.map((v: any) => ({
          price: Number(v.price),
          color: v.color,
          size: v.size,
          stock: Number(v.stock),
          discountPercent: Number(v.discountPercent) || 0,
        })),
        images: formData.images,
      });
      if (!res) throw new Error("Không thể thêm sản phẩm.");
      if (onAdded) onAdded();
      onClose?.();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi thêm sản phẩm.");
    }
    setIsSubmitting(false);
  };

  // UI
  return (
    <div className="relative w-full h-full max-h-[95vh] flex flex-col overflow-y-auto p-0 rounded-xl max-w-2xl w-[600px] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b rounded-t-xl">
        <h2 className="text-xl font-bold">Thêm sản phẩm</h2>
        <button
          onClick={onClose}
          className="p-2 ml-auto rounded-full hover:bg-gray-200 text-2xl font-bold flex items-center justify-center"
          style={{ width: 36, height: 36, lineHeight: 1 }}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
      <form
        className="p-6 pt-4 space-y-6 overflow-y-auto"
        onSubmit={handleSubmit}
        style={{ maxWidth: 640 }}
      >
        {/* Hình ảnh sản phẩm */}
        <div>
          <label className="block font-semibold mb-2">
            Hình ảnh sản phẩm <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-sm text-gray-500 w-[274px]">
            Image format .jpg .jpeg .png and minimum size 300 × 300px
          </p>
          {renderImagesBlock()}
          {formData.images && formData.images.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Đã chọn: {(formData.images as File[]).map((f) => f.name).join(", ")}
            </p>
          )}
        </div>
        {/* Tên sản phẩm */}
        <div>
          <label className="block font-semibold mb-2">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-3"
            placeholder="Nhập tên sản phẩm"
          />
        </div>
        {/* Mô tả */}
        <div className="w-[564px] max-w-full">
          <label className="block font-semibold mb-2">
            Mô tả sản phẩm <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-sm text-gray-500">
            Bao gồm tối thiểu 260 ký tự để giúp người mua dễ hiểu và tìm thấy sản phẩm của bạn hơn
          </p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-3 min-h-[120px]"
            placeholder="Nhập mô tả..."
          />
        </div>
        {/* Danh mục */}
        <div>
          <label className="block font-semibold mb-2">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full border rounded p-3"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Biến thể */}
        <div>
          <label className="block font-semibold mb-2">Biến thể</label>
          {/* List các variant đã thêm */}
          <div className="flex flex-col gap-2 max-w-[564px] w-full">
            {formData.variants.map((variant: any, idx: number) => (
              <div
                key={idx}
                className="flex flex-row flex-wrap gap-2 items-center rounded-lg border border-gray-100 bg-[#FAFAFB] px-2 py-2"
                style={{ width: "100%", maxWidth: 564 }}
              >
                <select
                  className="border rounded-lg p-2 w-[85px] text-sm"
                  value={variant.size}
                  onChange={e => handleVariantChange(idx, "size", e.target.value)}
                >
                  <option value="">Size</option>
                  {sizeOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="border rounded-lg p-2 w-[100px] text-sm"
                  value={variant.color}
                  onChange={e => handleVariantChange(idx, "color", e.target.value)}
                >
                  <option value="">Màu sắc</option>
                  {colorOptions.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  className="border rounded-lg p-2 w-[90px] text-sm"
                  value={variant.price}
                  onChange={e => handleVariantChange(idx, "price", e.target.value)}
                  placeholder="Giá"
                />
                <input
                  type="number"
                  min={0}
                  className="border rounded-lg p-2 w-[65px] text-sm"
                  value={variant.discountPercent || ""}
                  onChange={e => handleVariantChange(idx, "discountPercent", e.target.value)}
                  placeholder="Giảm"
                />
                <input
                  type="number"
                  min={0}
                  className="border rounded-lg p-2 w-[90px] text-sm"
                  value={variant.stock}
                  onChange={e => handleVariantChange(idx, "stock", e.target.value)}
                  placeholder="Kho"
                />
                <button
                  type="button"
                  className="text-red-500 font-semibold hover:underline ml-1"
                  onClick={() => handleRemoveVariant(idx)}
                  disabled={formData.variants.length <= 1}
                  title="Xóa biến thể"
                  style={{ fontSize: 13 }}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
          {/* Biến thể mới */}
          <div className="rounded-lg border border-gray-200 p-4 bg-white w-full max-w-[564px] mt-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <label className="font-semibold block mb-1 text-sm">Sizes</label>
                <div className="flex gap-2">
                  {sizeOptions.map(size => (
                    <button
                      key={size}
                      type="button"
                      className={
                        "w-10 h-10 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-100 " +
                        (newVariant.size === size
                          ? "bg-black text-white border-black shadow"
                          : "bg-white border-gray-200 text-black hover:bg-gray-100")
                      }
                      onClick={() => handleNewVariantChange("size", size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1 text-sm">Màu sắc</label>
                <select
                  className="border rounded-lg p-2 w-full text-sm"
                  value={newVariant.color}
                  onChange={e => handleNewVariantChange("color", e.target.value)}
                >
                  <option value="">Chọn màu sắc</option>
                  {colorOptions.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1 text-sm">Giá</label>
                <input
                  type="number"
                  min={0}
                  className="border rounded-lg p-2 w-full text-sm"
                  value={newVariant.price}
                  onChange={e => handleNewVariantChange("price", e.target.value)}
                  placeholder="Giá (đ)"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-sm">Giảm giá (%)</label>
                <input
                  type="number"
                  min={0}
                  className="border rounded-lg p-2 w-full text-sm"
                  value={newVariant.discountPercent || ""}
                  onChange={e => handleNewVariantChange("discountPercent", e.target.value)}
                  placeholder="Giảm (%)"
                />
              </div>
              <div className="col-span-2">
                <label className="font-semibold block mb-1 text-sm">Tồn kho</label>
                <input
                  type="number"
                  min={0}
                  className="border rounded-lg p-2 w-full text-sm"
                  value={newVariant.stock}
                  onChange={e => handleNewVariantChange("stock", e.target.value)}
                  placeholder="Số lượng sản phẩm"
                />
              </div>
            </div>
          </div>
          {/* Nút thêm biến thể */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 font-semibold text-base text-black mt-3 mx-auto hover:opacity-70"
            onClick={handleAddVariant}
          >
            <span className="text-2xl font-bold">+</span>
            Thêm biến thể
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && <div className="text-red-500 text-center">{error}</div>}

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            className="w-1/2 bg-gray-200 text-black py-3 rounded font-semibold hover:bg-gray-300"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="w-1/2 bg-black text-white py-3 rounded font-semibold hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
