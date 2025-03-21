"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Select from "react-select";

export default function Checkout() {
  // Dữ liệu giả lập từ giỏ hàng
  const [orderItems] = useState([
    {
      id: 1,
      name: "MLB - Áo khoác phối mũ unisex Gopcore Basic",
      price: 5589000,
      discountPercent: 68,
      image: "/featured/featured_1.jpg",
      size: "XL",
      color: "Đen",
      quantity: 1,
    },
    {
      id: 2,
      name: "Áo thun unisex phong cách đường phố",
      price: 500000,
      discountPercent: 20,
      image: "/featured/featured_1.jpg",
      size: "M",
      color: "Trắng",
      quantity: 2,
    },
  ]);

  // Tính tổng tiền tạm thời (chưa có giảm giá hay phí vận chuyển)
  const subtotal = orderItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  // Giả lập mã giảm giá
  const [discountCode, setDiscountCode] = useState("");
  const discount = 0; // Chưa áp dụng logic giảm giá, để 0 tạm thời

  // State cho phí vận chuyển (dựa trên phương thức vận chuyển)
  const [shippingFee, setShippingFee] = useState(25000); // Mặc định là Giao hàng tiêu chuẩn
  const [shippingMethod, setShippingMethod] = useState("standard"); // Mặc định là Giao hàng tiêu chuẩn

  // State cho phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Mặc định là COD

  // Tính tổng tiền
  const total = subtotal - discount + shippingFee;

  // State cho form thông tin giao hàng
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });

  // Dữ liệu giả lập tỉnh thành, quận huyện, phường xã (chỉ có TP HCM)
  const provinces = ["TP HCM", "Hà Nội", "Đà Nẵng"];
  const districtsByProvince: { [key: string]: string[] } = {
    "TP HCM": ["Quận 1", "Quận 3", "Quận 7", "Quận Bình Thạnh", "Quận Gò Vấp"],
    "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy"],
    "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà"],
  };
  const wardsByDistrict: { [key: string]: string[] } = {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao"],
    "Quận 3": ["Phường 1", "Phường 2", "Phường Võ Thị Sáu"],
    "Quận 7": ["Phường Tân Phú", "Phường Tân Thuận Đông", "Phường Tân Quy"],
    "Quận Bình Thạnh": ["Phường 1", "Phường 13", "Phường 25"],
    "Quận Gò Vấp": ["Phường 1", "Phường 3", "Phường 5"],
    "Ba Đình": ["Phường Trúc Bạch", "Phường Vĩnh Phúc"],
    "Hoàn Kiếm": ["Phường Hàng Bông", "Phường Hàng Gai"],
    "Cầu Giấy": ["Phường Dịch Vọng", "Phường Mai Dịch"],
    "Hải Châu": ["Phường Hòa Cường Bắc", "Phường Hòa Thuận Đông"],
    "Thanh Khê": ["Phường Thanh Khê Đông", "Phường Thanh Khê Tây"],
    "Sơn Trà": ["Phường An Hải Bắc", "Phường An Hải Đông"],
  };

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng nhập
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý thay đổi select (react-select)
  const handleSelectChange = (name: string, option: any) => {
    const value = option ? option.value : "";
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset quận huyện và phường xã khi thay đổi tỉnh thành
      ...(name === "province" && { district: "", ward: "" }),
      // Reset phường xã khi thay đổi quận huyện
      ...(name === "district" && { ward: "" }),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý thay đổi phương thức vận chuyển
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setShippingMethod(value);
    setShippingFee(value === "standard" ? 25000 : 35000);
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      fullName: "", // Bỏ validation cho fullName
      email: formData.email
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
          ? ""
          : "Email không hợp lệ"
        : "Email là bắt buộc",
      phone: formData.phone
        ? /^[0-9]{10}$/.test(formData.phone)
          ? ""
          : "Số điện thoại phải có 10 chữ số"
        : "Số điện thoại là bắt buộc",
      province: formData.province ? "" : "Vui lòng chọn tỉnh thành",
      district: formData.district ? "" : "Vui lòng chọn quận huyện",
      ward: formData.ward ? "" : "Vui lòng chọn phường xã",
      address: formData.address ? "" : "Địa chỉ là bắt buộc",
    };

    setErrors(newErrors);

    // Kiểm tra nếu không có lỗi thì submit
    if (Object.values(newErrors).every((error) => error === "")) {
      console.log("Form submitted:", {
        ...formData,
        shippingMethod,
        shippingFee,
        paymentMethod,
        total,
      });
      // Thêm logic submit tại đây (gửi API, v.v.)
    }
  };

  const handleApplyDiscount = () => {
    // Logic áp dụng mã giảm giá (chưa triển khai)
    console.log("Mã giảm giá:", discountCode);
  };

  const renderOrderItem = (item: (typeof orderItems)[0]) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);

    return (
      <div key={item.id} className="flex items-center gap-4 p-4">
        {/* Hình ảnh */}
        <Image
          src={item.image}
          alt={item.name}
          width={76}
          height={76}
          className="w-[4.75 rem] h-[4.75 rem] object-cover rounded"
        />
        {/* Thông tin sản phẩm */}
        <div className="flex-1 flex items-center justify-between gap-4">
          {/* Tên, kích thước/màu sắc, số lượng */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-[#374151] line-clamp-2">{item.name}</h3>
            {/* Size, color, quantity */}
            <div className="text-sm text-[#374151] flex gap-4">
              <div>
                {item.size}/{item.color}
              </div>
              <div>SL: {item.quantity}</div>
            </div>
          </div>
          {/* Giá */}
          <div className="text-sm font-medium">
            {discountPrice.toLocaleString("vi-VN")}₫
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto">
        {/* Tiêu đề */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-lg font-bold">
            ĐƠN HÀNG ({orderItems.length} SẢN PHẨM)
          </h1>
          <span className="text-[1rem] font-bold">
            {subtotal.toLocaleString("vi-VN")}₫
          </span>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 gap-3">
          {orderItems.map((item) => renderOrderItem(item))}
        </div>

        {/* Mã giảm giá */}
        <div className="mt-8">
          <label className="text-[1rem] font-medium">Mã giảm giá</label>
          <div className="flex mt-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Nhập mã giảm giá"
              className="w-full py-[0.875rem] pl-3 border border-gray-300 rounded-l-md focus:outline-none"
            />
            <button
              onClick={handleApplyDiscount}
              className="w-6/12 bg-black text-white font-medium rounded-r-md hover:bg-gray-800 text-[0.875rem]"
            >
              Áp Dụng
            </button>
          </div>
        </div>

        {/* Giá */}
        <div className="mt-8">
          <div className="border-b-2 border-[#E7E7E7] pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[1rem]">Tạm tính</span>
              <span className="text-[1rem]">
                {subtotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[1rem]">Giảm giá</span>
              <span className="text-[1rem]">
                {discount.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[1rem]">Phí vận chuyển</span>
              <span className="text-[1rem]">
                {shippingFee.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-[1rem] font-bold">THÀNH TIỀN:</span>
            <span className="text-[1rem] font-bold text-[#FF0000]">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        {/* Section: Thông tin giao hàng */}
        <div className="mt-8">
          <h2 className="text-[18px] font-medium mb-4">THÔNG TIN GIAO HÀNG</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {/* Họ và tên */}
            <div>
              <label className="text-[1rem] font-medium uppercase">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-[1rem] font-medium uppercase">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
                className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="text-[1rem] font-medium uppercase">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Tỉnh thành */}
            <div>
              <label className="text-[1rem] font-medium uppercase">
                Tỉnh thành
              </label>
              <Select
                name="province"
                value={
                  formData.province
                    ? { value: formData.province, label: formData.province }
                    : null
                }
                onChange={(option) => handleSelectChange("province", option)}
                options={provinces.map((province) => ({
                  value: province,
                  label: province,
                }))}
                placeholder="Chọn tỉnh thành"
                className="mt-2"
                classNamePrefix="react-select"
                isClearable
              />
              {errors.province && (
                <p className="text-red-500 text-sm mt-1">{errors.province}</p>
              )}
            </div>

            {/* Quận huyện */}
            <div>
              <label className="text-[1rem] font-medium uppercase">
                Quận huyện
              </label>
              <Select
                name="district"
                value={
                  formData.district
                    ? { value: formData.district, label: formData.district }
                    : null
                }
                onChange={(option) => handleSelectChange("district", option)}
                options={
                  formData.province
                    ? districtsByProvince[formData.province]?.map(
                        (district) => ({
                          value: district,
                          label: district,
                        })
                      )
                    : []
                }
                placeholder="Chọn quận huyện"
                className="mt-2"
                classNamePrefix="react-select"
                isDisabled={!formData.province}
                isClearable
              />
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district}</p>
              )}
            </div>

            {/* Phường xã */}
            <div>
              <label className="text-[1rem] font-medium uppercase">
                Phường xã
              </label>
              <Select
                name="ward"
                value={
                  formData.ward
                    ? { value: formData.ward, label: formData.ward }
                    : null
                }
                onChange={(option) => handleSelectChange("ward", option)}
                options={
                  formData.district
                    ? wardsByDistrict[formData.district]?.map((ward) => ({
                        value: ward,
                        label: ward,
                      }))
                    : []
                }
                placeholder="Chọn phường xã"
                className="mt-2"
                classNamePrefix="react-select"
                isDisabled={!formData.district}
                isClearable
              />
              {errors.ward && (
                <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="text-[1rem] font-medium uppercase">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                className="w-full mt-2 py-[0.875rem] pl-3 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Section: Phương thức vận chuyển */}
            <div className="mt-8">
              <h2 className="text-[2.5 rem] font-bold text-left uppercase mb-4">
                PHƯƠNG THỨC VẬN CHUYỂN
              </h2>
              <div className="space-y-4">
                {/* Giao hàng tiêu chuẩn */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={handleShippingChange}
                      className="h-5 w-5 accent-black focus:ring-black"
                    />
                    <span className="text-[1rem]">
                      Giao hàng tiêu chuẩn (3-5 ngày)
                    </span>
                  </div>
                  <span className="text-[1rem] font-medium">25,000₫</span>
                </label>

                {/* Giao hàng nhanh */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={handleShippingChange}
                      className="h-5 w-5 accent-black focus:ring-black"
                    />
                    <span className="text-[1rem]">
                      Giao hàng nhanh (1-2 ngày)
                    </span>
                  </div>
                  <span className="text-[1rem] font-medium">35,000₫</span>
                </label>
              </div>
            </div>

            {/* Section: Phương thức thanh toán */}
            <div className="mt-8">
              <h2 className="text-[2.5 rem] font-bold text-left uppercase mb-4">
                PHƯƠNG THỨC THANH TOÁN
              </h2>
              <div className="space-y-4">
                {/* Thanh toán qua VNPay */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={handlePaymentChange}
                    className="h-5 w-5 accent-black focus:ring-black"
                  />
                  <div className="flex items-center gap-2">
                    <Image
                      src={"/checkout/checkout_vnpay.svg"}
                      alt={"logo"}
                      width={40}
                      height={40}
                      className="w-[2.5 rem] h-[2.5 rem] object-cover rounded"
                    />
                    <span className="text-[1rem]">
                      Thanh toán qua cổng VNPay
                    </span>
                  </div>
                </label>

                {/* Thanh toán qua MoMo */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={handlePaymentChange}
                    className="h-5 w-5 accent-black focus:ring-black"
                  />
                  <div className="flex items-center gap-2">
                    <Image
                      src={"/checkout/checkout_momo.svg"}
                      alt={"logo"}
                      width={40}
                      height={40}
                      className="w-[2.5 rem] h-[2.5 rem] object-cover rounded"
                    />
                    <span className="text-[1rem]">Thanh toán qua ví MoMo</span>
                  </div>
                </label>

                {/* Thanh toán qua ZaloPay */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="zalopay"
                    checked={paymentMethod === "zalopay"}
                    onChange={handlePaymentChange}
                    className="h-5 w-5 accent-black focus:ring-black"
                  />
                  <div className="flex items-center gap-2">
                    <Image
                      src={"/checkout/checkout_zalopay.svg"}
                      alt={"logo"}
                      width={40}
                      height={40}
                      className="w-[2.5 rem] h-[2.5 rem] object-cover rounded"
                    />
                    <span className="text-[1rem]">
                      Thanh toán qua ví ZaloPay
                    </span>
                  </div>
                </label>

                {/* Thanh toán khi giao hàng (COD) */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={handlePaymentChange}
                    className="h-5 w-5 accent-black focus:ring-black"
                  />
                  <div className="flex items-center gap-2">
                    <Image
                      src={"/checkout/checkout_cod.svg"}
                      alt={"logo"}
                      width={40}
                      height={40}
                      className="w-[2.5 rem] h-[2.5 rem] object-cover rounded"
                    />
                    <span className="text-[1rem]">
                      Thanh toán khi giao hàng (COD)
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Nút submit */}
            <button
              type="submit"
              className="mt-8 w-full bg-black text-white font-medium py-[0.875rem] rounded-md hover:bg-gray-800"
            >
              Xác Nhận Đơn Hàng
            </button>
          </form>
        </div>
      </div>

      {/* CSS tùy chỉnh cho react-select */}
      <style jsx global>{`
        .react-select__control {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0;
          min-height: 3rem;
        }
        .react-select__control--is-focused {
          border-color: #d1d5db;
          box-shadow: none;
        }
        .react-select__menu {
          width: 100%;
          z-index: 10;
        }
        .react-select__option {
          padding: 0.75rem 1rem;
        }
        .react-select__option--is-focused {
          background-color: #f3f4f6;
        }
        .react-select__option--is-selected {
          background-color: #000;
          color: #fff;
        }
        .react-select__placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
