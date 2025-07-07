"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { updateCoupon } from "@/services/couponApi";
import { Coupon } from "@/types/coupon";
import { ICategoryNews } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";

interface EditCouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onSave: (updatedCoupon: Coupon) => void;
}

export default function EditCouponModal({
  coupon,
  onClose,
  onSave,
}: EditCouponModalProps) {
  const [mounted, setMounted] = useState(false);
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<ICategoryNews[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Chỉ format date khi component đã mount để tránh hydration mismatch
  const [form, setForm] = useState({
    code: coupon.code,
    category: coupon.applicableCategories?.[0]?._id || "",
    type: coupon.discountType === "percentage" ? "%" : "vnd",
    value: coupon.discountValue.toString(),
    minOrder: coupon.minOrderAmount?.toString() || "",
    maxDiscount: coupon.maxDiscountAmount?.toString() || "",
    startDate: "",
    endDate: "",
    usage: coupon.usageLimit?.toString() || "",
    description: coupon.description || "",
    is_active: coupon.is_active,
  });

  // Xử lý hydration - chỉ format date sau khi component mount
  useEffect(() => {
    setMounted(true);
    setForm((prev) => ({
      ...prev,
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: new Date(coupon.endDate).toISOString().split("T")[0],
    }));
  }, [coupon.startDate, coupon.endDate]);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "is_active") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCategory = categories.find(
      (cat) => cat._id === form.category
    );

    if (form.category && !selectedCategory) {
      setError("Danh mục không hợp lệ.");
      return;
    }

    const payload: Partial<Coupon> = {
      code: form.code,
      description: form.description,
      discountType: form.type === "%" ? "percentage" : "fixed",
      discountValue: Number(form.value),
      minOrderAmount: form.minOrder ? Number(form.minOrder) : null,
      maxDiscountAmount: form.maxDiscount ? Number(form.maxDiscount) : null,
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: form.usage ? Number(form.usage) : null,
      is_active: form.is_active,
      applicableCategories: selectedCategory ? [selectedCategory] : [],
      applicableProducts: [],
    };

    try {
      const result = await updateCoupon(coupon._id, payload);
      console.log("Kết quả cập nhật mã giảm giá:", result);
      alert("Cập nhật mã giảm giá thành công!");
      onSave(result);
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật mã giảm giá:", err);
      alert("Đã xảy ra lỗi khi cập nhật mã giảm giá.");
    }
  };

  const isFormValid =
    form.code && form.value && form.startDate && form.endDate && form.usage;

  // Không render modal cho đến khi component đã mount
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-br-[16px] rounded-bl-[16px] shadow-xl w-[613px] max-w-full max-h-[90vh] overflow-y-auto pb-10 relative">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px] mb-3">
            <h2 className="text-lg font-bold">Sửa Mã Giảm Giá</h2>
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

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="pl-6 pr-6">
          <form className="text-sm" onSubmit={handleSubmit}>
            <div className="mt-3 mb-8">
              <label className="block font-bold mb-4">
                Mã khuyến mãi<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Nhập tên mã km"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
              />
            </div>

            {/* Danh mục không bắt buộc */}
            <div className="mb-8 relative">
              <label className="block font-bold mb-4">Danh mục áp dụng</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
              >
                <option value="">Chọn danh mục (Nếu có)</option>
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

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative">
                <label className="block font-bold mb-4">Loại giảm giá</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
                >
                  <option value="%">Phần trăm (%)</option>
                  <option value="vnd">Tiền (đ)</option>
                </select>
                <Image
                  src="/admin_user/Vector.svg"
                  width={14}
                  height={14}
                  alt="arrow down"
                  className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-4">
                  Giá trị giảm<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  placeholder="Vd: 20 hoặc 50000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block font-bold mb-4">
                  Đơn tối thiểu (đ)
                </label>
                <input
                  name="minOrder"
                  value={form.minOrder}
                  onChange={handleChange}
                  placeholder="Vd: 50000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-4">Giảm tối đa (đ)</label>
                <input
                  name="maxDiscount"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="Vd: 50000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative">
                <label className="block font-bold mb-4">
                  Ngày bắt đầu<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  ref={startDateRef}
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full h-[46px] px-4 pr-10 border border-[#D1D1D1] rounded-[12px]"
                />
                <button
                  type="button"
                  onClick={() => startDateRef.current?.showPicker?.()}
                  className="absolute right-3 top-[calc(50%+18px)] transform -translate-y-1/2"
                >
                  <Image
                    src="/admin_sale/date.svg"
                    width={18}
                    height={18}
                    alt="calendar"
                  />
                </button>
              </div>

              <div className="relative">
                <label className="block font-bold mb-4">
                  Ngày kết thúc<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  ref={endDateRef}
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full h-[46px] px-4 pr-10 border border-[#D1D1D1] rounded-[12px]"
                />
                <button
                  type="button"
                  onClick={() => endDateRef.current?.showPicker?.()}
                  className="absolute right-3 top-[calc(50%+18px)] transform -translate-y-1/2"
                >
                  <Image
                    src="/admin_sale/date.svg"
                    width={18}
                    height={18}
                    alt="calendar"
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block font-bold mb-4">
                  Lượt dùng<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  name="usage"
                  value={form.usage}
                  onChange={handleChange}
                  placeholder="Vd: 200"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
              <div className="relative">
                <label className="block font-bold mb-4">
                  Trạng thái<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="is_active"
                  value={form.is_active.toString()}
                  onChange={handleChange}
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
                >
                  <option value="true">Kích hoạt</option>
                  <option value="false">Tạm ngừng</option>
                </select>
                <Image
                  src="/admin_user/Vector.svg"
                  width={14}
                  height={14}
                  alt="arrow down"
                  className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block font-bold mb-4">
                Mô tả chương trình<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập nội dung chương trình, điều kiện áp dụng..."
                className="w-full min-h-[200px] px-4 py-3 border border-[#E2E8F0] rounded-[12px]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full bg-black text-white h-[56px] rounded-lg font-semibold mt-4 ${
                !isFormValid
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
