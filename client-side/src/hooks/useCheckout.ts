// src/hooks/useCheckout.ts
"use client";

import { useState } from "react";
import { CheckoutFormData, CheckoutErrors, OrderItem } from "@/types";

export function useCheckout(initialOrderItems: OrderItem[]) {
  const [orderItems] = useState<OrderItem[]>(initialOrderItems);

  // Tính tổng tiền tạm thời
  const subtotal = orderItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  // Mã giảm giá
  const [discountCode, setDiscountCode] = useState("");
  const discount = 0; // Chưa áp dụng logic giảm giá, để 0 tạm thời

  // Phí vận chuyển
  const [shippingFee, setShippingFee] = useState(25000); // Mặc định là Giao hàng tiêu chuẩn
  const [shippingMethod, setShippingMethod] = useState("standard"); // Mặc định là Giao hàng tiêu chuẩn

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Mặc định là COD

  // Tổng tiền
  const total = subtotal - discount + shippingFee;

  // Form thông tin giao hàng
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });

  const [errors, setErrors] = useState<CheckoutErrors>({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý thay đổi select
  const handleSelectChange = (name: string, option: any) => {
    const value = option ? option.value : "";
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "province" && { district: "", ward: "" }),
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
    const newErrors: CheckoutErrors = {
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

    if (Object.values(newErrors).every((error) => error === "")) {
      console.log("Form submitted:", {
        ...formData,
        shippingMethod,
        shippingFee,
        paymentMethod,
        total,
      });
    }
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = () => {
    console.log("Mã giảm giá:", discountCode);
  };

  return {
    orderItems,
    subtotal,
    discountCode,
    setDiscountCode,
    discount,
    shippingFee,
    shippingMethod,
    paymentMethod,
    total,
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleShippingChange,
    handlePaymentChange,
    handleSubmit,
    handleApplyDiscount,
  };
}