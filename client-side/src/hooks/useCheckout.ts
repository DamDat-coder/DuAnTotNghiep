"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { createOrder, fetchUser } from "@/services/api";
import { ICartItem, CheckoutFormData, CheckoutErrors } from "@/types";
import toast from "react-hot-toast";

export function useCheckout() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    async function checkAuth() {
      const user = await fetchUser();
      if (user) {
        setIsLoggedIn(true);
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }));
      } else {
        toast.error("Vui lòng đăng nhập để thanh toán!");
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  // Chuyển cart.items thành orderItems
  const orderItems: ICartItem[] = cart.items;

  // Log cart.items để debug
  useEffect(() => {
    console.log("Cart items:", cart.items);
  }, [cart.items]);

  // Tính tổng tiền tạm thời
  const subtotal = orderItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  // Mã giảm giá
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Phí vận chuyển
  const [shippingFee, setShippingFee] = useState(25000);
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cod");

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

  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = () => {
    if (discountCode === "SAVE10") {
      setDiscount(subtotal * 0.1);
      toast.success("Áp dụng mã giảm giá thành công!");
    } else {
      setDiscount(0);
      toast.error("Mã giảm giá không hợp lệ!");
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: CheckoutErrors = {
      fullName: formData.fullName ? "" : "Họ và tên là bắt buộc",
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
      try {
        const shippingAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`;
        const order = {
          products: orderItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress,
        };

        console.log("Order data:", order); // Log dữ liệu gửi đi
        const response = await createOrder(order);
        if (response) {
          toast.success("Đặt hàng thành công!");
          dispatch({ type: "clear" });
          router.push("/orders");
        } else {
          toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
        }
      } catch (error: any) {
        console.error("Submit error:", error);
        toast.error(error.message || "Đặt hàng thất bại!");
      }
    }
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