"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createCoupon } from "@/services/couponApi";
import { Coupon } from "@/types/coupon";
import { ICategory } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";
import { fetchProducts } from "@/services/productApi";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";

interface AddCouponModalProps {
  onClose: () => void;
}

export default function AddCouponModal({ onClose }: AddCouponModalProps) {
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [form, setForm] = useState({
    code: "",
    category: "",
    type: "%",
    value: "",
    minOrder: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usage: "",
    description: "",
    is_active: true,
  });

  // Memoize filteredCategories to ensure stability
  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.name !== "Bài viết"),
    [categories]
  );
  const parentCategories = useMemo(
    () => filteredCategories.filter((cat) => !cat.parentId),
    [filteredCategories]
  );

  useEffect(() => {
    if (categories.length) {
      console.log("Sample category:", categories[0]);
    }
  }, [categories]);

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
      // Reset selected products when category changes
      if (name === "category") {
        setSelectedProducts([]);
      }
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  // Hàm format số có dấu chấm
  function formatNumber(value: string | number) {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Hàm chỉ cho nhập số
  function handleNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    // Loại bỏ ký tự không phải số
    const numericValue = value.replace(/\D/g, "");
    setForm((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Get child category IDs for the selected parent category
    const childCategoryIds = filteredCategories
      .filter((cat) => cat.parentId === form.category)
      .map((cat) => cat._id);

    // Transform form data to match Coupon schema
    const couponData: Partial<Coupon> = {
      code: form.code,
      description: form.description,
      discountType: form.type === "%" ? "percentage" : "fixed",
      discountValue: form.value
        ? parseInt(form.value.replace(/\./g, ""), 10)
        : 0,
      minOrderAmount: form.minOrder
        ? parseInt(form.minOrder.replace(/\./g, ""), 10)
        : undefined,
      maxDiscountAmount: form.maxDiscount
        ? parseInt(form.maxDiscount.replace(/\./g, ""), 10)
        : undefined,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      usageLimit: form.usage ? parseInt(form.usage, 10) : undefined,
      is_active: form.is_active,
      applicableCategories: form.category
        ? [form.category, ...childCategoryIds]
        : [],
      applicableProducts:
        selectedProducts.length > 0 ? selectedProducts : undefined,
    };

    try {
      console.log("Coupon data being sent:", couponData);
      const createdCoupon = await createCoupon(couponData);
      toast.success("Mã giảm giá được tạo thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error.message ||
        "Không thể tạo mã giảm giá. Vui lòng kiểm tra dữ liệu.";
      console.error("Lỗi khi tạo mã giảm giá:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch categories
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

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        setAllProducts(res.data);
      } catch (err) {
        setError("Lỗi khi tải sản phẩm.");
        console.error("Error loading products:", err);
      }
    };
    loadProducts();
  }, []);

  // Filter products based on selected category
  useEffect(() => {
    let childCategoryIds: string[] = [];
    if (form.category) {
      const selectedParent = filteredCategories.find(
        (cat) => cat._id === form.category
      );
      if (selectedParent && selectedParent.children) {
        childCategoryIds = selectedParent.children.map((cat) => cat._id);
      }
    }

    const allCateIds = form.category
      ? [form.category, ...childCategoryIds]
      : [];

    if (form.category) {
      setFilteredProducts(
        allProducts.filter((p) =>
          typeof p.category === "object"
            ? allCateIds.includes(p.category?._id ?? "")
            : allCateIds.includes(p.category)
        )
      );
    } else {
      setFilteredProducts(allProducts);
    }
  }, [form.category, allProducts, filteredCategories]);

  // Filter products in the modal based on search term
  const searchedProducts = useMemo(
    () =>
      filteredProducts.filter((prod) =>
        prod.name.toLowerCase().includes(productSearch.toLowerCase())
      ),
    [filteredProducts, productSearch]
  );

  // Map selected product IDs to their names for display
  const selectedProductNames = useMemo(
    () =>
      selectedProducts
        .map((id) => allProducts.find((p) => p.id === id)?.name)
        .filter((name): name is string => !!name),
    [selectedProducts, allProducts]
  );

  const isPercent = form.type === "%";
  const isVnd = form.type === "vnd";

  // Validate giá trị giảm giá
  const isValueValid =
    (isPercent && /^\d{1,2}$/.test(form.value) && +form.value > 0 && +form.value < 100) ||
    (isVnd && /^\d+$/.test(form.value) && +form.value >= 1000);

  // Validate ngày
  const isDateValid =
    // Không nhập ngày bắt đầu, chỉ nhập ngày kết thúc
    (!form.startDate && !!form.endDate) ||
    // Nhập ngày bắt đầu, không nhập ngày kết thúc
    (!!form.startDate && !form.endDate) ||
    // Nhập cả hai
    (!!form.startDate && !!form.endDate);

  // Validate lượt dùng: có thể bỏ trống hoặc là số > 0
  const isUsageValid = !form.usage || (/^\d+$/.test(form.usage) && +form.usage > 0);

  // Validate tổng thể
  const isFormValid =
    form.code &&
    isValueValid &&
    isDateValid &&
    isUsageValid &&
    form.description;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-[16px] shadow-xl w-[613px] max-w-full max-h-[90vh] overflow-y-auto pb-10 relative scroll-hidden">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px] mb-3">
            <h2 className="text-lg font-bold">Thêm Mã Giảm Giá Mới</h2>
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
                required
              />
            </div>

            {/* Category selection */}
            <div className="mb-8 relative">
              <label className="block font-bold mb-4">
                Danh mục áp dụng (không bắt buộc)
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
              >
                <option value="">
                  Không chọn danh mục (áp dụng cho tất cả)
                </option>
                {parentCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Image
                src="/admin_user/chevron-down.svg"
                width={20}
                height={20}
                alt="arrow down"
                className="absolute right-3 top-[calc(50%+19px)] transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            {/* Product selection */}
            <div className="mb-8">
              <label className="block font-bold mb-4">
                Sản phẩm áp dụng (không bắt buộc)
              </label>
              <button
                type="button"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] text-left bg-white"
                onClick={() => setShowProductModal(true)}
              >
                {selectedProducts.length === 0
                  ? "Chọn sản phẩm (hoặc để trống để áp dụng tất cả)"
                  : `${selectedProducts.length} sản phẩm đã chọn`}
              </button>
              {/* Display selected products as tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProductNames.map((name, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveProduct(selectedProducts[index])
                      }
                      className="ml-2 text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
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
                  value={formatNumber(form.value)}
                  onChange={handleNumberInput}
                  placeholder={isPercent ? "Vd: 10, 20, 99" : "Vd: 50.000"}
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                  required
                />
                {!isValueValid && (
                  <div className="text-red-500 text-xs mt-1">
                    {isPercent
                      ? "Chỉ nhập số từ 1 đến 99 (%)"
                      : "Giá trị phải lớn hơn hoặc bằng 1.000đ"}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block font-bold mb-4">
                  Đơn tối thiểu (đ)
                </label>
                <input
                  name="minOrder"
                  value={formatNumber(form.minOrder)}
                  onChange={handleNumberInput}
                  placeholder="Vd: 50.000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-4">Giảm tối đa (đ)</label>
                <input
                  name="maxDiscount"
                  value={formatNumber(form.maxDiscount)}
                  onChange={handleNumberInput}
                  placeholder="Vd: 50.000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative">
                <label className="block font-bold mb-4">
                  Ngày bắt đầu
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
                  Ngày kết thúc
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
                  Lượt dùng
                </label>
                <input
                  name="usage"
                  value={form.usage}
                  onChange={handleChange}
                  placeholder="Để trống nếu không giới hạn"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
                {!isUsageValid && (
                  <div className="text-red-500 text-xs mt-1">
                    "Chỉ nhập số dương hoặc để trống"
                  </div>
                )}
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
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-6 ${
                isSubmitting || !isFormValid
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo mã giảm giá"}
            </button>
          </form>
        </div>

        {/* Product selection modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto relative">
              <h3 className="font-bold mb-4">Chọn sản phẩm áp dụng</h3>
              <button
                className="absolute top-2 right-2 text-gray-500"
                onClick={() => setShowProductModal(false)}
              >
                Đóng
              </button>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {searchedProducts.length > 0 ? (
                  searchedProducts.map((prod) => (
                    <label key={prod.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts((prev) => [...prev, prod.id]);
                          } else {
                            setSelectedProducts((prev) =>
                              prev.filter((id) => id !== prod.id)
                            );
                          }
                        }}
                      />
                      <span className="ml-2">{prod.name}</span>
                    </label>
                  ))
                ) : (
                  <p>Không có sản phẩm nào phù hợp.</p>
                )}
              </div>
              <button
                className="mt-4 w-full bg-black text-white py-2 rounded"
                onClick={() => setShowProductModal(false)}
              >
                Xong
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
