"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { updateCoupon } from "@/services/couponApi";
import { Coupon } from "@/types/coupon";
import { ICategory } from "@/types/category";
import { fetchCategoryTree } from "@/services/categoryApi";
import { fetchProducts } from "@/services/productApi";
import toast from "react-hot-toast";
import { IProduct } from "@/types/product";

interface EditCouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onSave: (updatedCoupon: Coupon) => void;
}

function formatNumber(value: string | number) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function handleNumberInput(
  e: React.ChangeEvent<HTMLInputElement>,
  setForm: React.Dispatch<React.SetStateAction<any>>
) {
  const { name, value } = e.target;
  const numericValue = value.replace(/\D/g, "");
  setForm((prev: any) => ({
    ...prev,
    [name]: numericValue,
  }));
}

export default function EditCouponModal({
  coupon,
  onClose,
  onSave,
}: EditCouponModalProps) {
  const [mounted, setMounted] = useState(false);
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    (coupon.applicableProducts || []).map((p: any) =>
      typeof p === "object" ? p._id : p
    )
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Memoize filteredCategories to ensure stability
  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.name !== "Bài viết"),
    [categories]
  );
  const parentCategories = useMemo(
    () => filteredCategories.filter((cat) => !cat.parentId),
    [filteredCategories]
  );

  // Initialize form with coupon data
  const [form, setForm] = useState({
    code: coupon.code,
    category:
      coupon.applicableCategories && coupon.applicableCategories.length > 0
        ? typeof coupon.applicableCategories[0] === "object"
          ? (coupon.applicableCategories[0] as { _id: string })._id
          : coupon.applicableCategories[0]
        : "",
    type: coupon.discountType === "percentage" ? "%" : "vnd",
    value: coupon.discountValue?.toString() || "",
    minOrder: coupon.minOrderAmount?.toString() || "",
    maxDiscount: coupon.maxDiscountAmount?.toString() || "",
    startDate: "",
    endDate: "",
    usage: coupon.usageLimit?.toString() || "",
    description: coupon.description || "",
    is_active: coupon.is_active,
  });

  // Handle hydration - format date after component mounts
  useEffect(() => {
    setMounted(true);
    setForm((prev) => ({
      ...prev,
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().split("T")[0]
        : "",
      endDate: coupon.endDate
        ? new Date(coupon.endDate).toISOString().split("T")[0]
        : "",
    }));
  }, [coupon.startDate, coupon.endDate]);

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
        setAllProducts(res.data || []);
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

  // Filter products in modal based on search term
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
      // Nếu đổi category mà đã có sản phẩm được chọn thì cảnh báo và không cho đổi
      if (name === "category" && selectedProducts.length > 0) {
        toast.error(
          "Vui lòng xóa hết sản phẩm đã chọn trước khi đổi danh mục!"
        );
        return;
      }
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Reset selected products khi đổi category (nếu không cảnh báo)
      if (name === "category") {
        setSelectedProducts([]);
      }
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Get child category IDs for the selected parent category
    const childCategoryIds = filteredCategories
      .filter((cat) => cat.parentId === form.category)
      .map((cat) => cat._id);

    const payload: Partial<Coupon> = {
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
      const result = await updateCoupon(coupon._id, payload);
      toast.success("Cập nhật mã giảm giá thành công!");
      onSave(result);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.message || "Đã xảy ra lỗi khi cập nhật mã giảm giá.";
      console.error("Lỗi khi cập nhật mã giảm giá:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    form.code &&
    form.value &&
    form.startDate &&
    form.endDate &&
    form.usage &&
    form.description;

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
              {/* Luôn hiển thị tag sản phẩm đã chọn */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[...new Set(selectedProducts)].map((id) => {
                  const prod = allProducts.find((p) => p.id === id);
                  if (!prod) return null;
                  return (
                    <span
                      key={id}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {prod.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(id)}
                        className="ml-2 text-red-500 font-bold"
                        title="Xóa sản phẩm"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
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
                  onChange={(e) => handleNumberInput(e, setForm)}
                  placeholder="Vd: 20 hoặc 50.000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                  required
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
                  value={formatNumber(form.minOrder)}
                  onChange={(e) => handleNumberInput(e, setForm)}
                  placeholder="Vd: 50.000"
                  className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-4">Giảm tối đa (đ)</label>
                <input
                  name="maxDiscount"
                  value={formatNumber(form.maxDiscount)}
                  onChange={(e) => handleNumberInput(e, setForm)}
                  placeholder="Vd: 50.000"
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
                  required
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
                  required
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
                  required
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
                required
              />
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
                                setSelectedProducts((prev) =>
                                  prev.includes(prod.id) ? prev : [...prev, prod.id]
                                );
                              } else {
                                setSelectedProducts((prev) => prev.filter((id) => id !== prod.id));
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
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
