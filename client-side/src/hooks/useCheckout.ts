import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCartDispatch } from "@/contexts/CartContext"; // Thêm useCartDispatch
import { createOrder } from "@/services/orderApi";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { ICartItem } from "@/types/cart";

export const useCheckout = () => {
  const { user } = useAuth();
  const { items } = useCart(); // Xóa clearCart
  const dispatch = useCartDispatch(); // Thêm dispatch
  const router = useRouter();

  // Lấy các sản phẩm được chọn từ giỏ hàng
  const orderItems: ICartItem[] = items.filter((item) => item.selected);

  // Tính toán giá
  const subtotal = orderItems.reduce(
    (sum, item) =>
      sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
    0
  );
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(25000); // Mặc định standard
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [total, setTotal] = useState(subtotal - discount + shippingFee);

  // Khởi tạo formData
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

  // Đồng bộ formData với user
  useEffect(() => {
    console.log("User in useCheckout:", user); // Debug
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
    console.log("FormData after sync:", formData); // Debug
  }, [user]);

  // Cập nhật total khi subtotal, discount, hoặc shippingFee thay đổi
  useEffect(() => {
    setTotal(subtotal - discount + shippingFee);
    console.log("Updated total:", { subtotal, discount, shippingFee, total }); // Debug
  }, [subtotal, discount, shippingFee]);

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý thay đổi select
  const handleSelectChange = (name: string, option: any) => {
    setFormData((prev) => ({ ...prev, [name]: option ? option.value : "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "province") {
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
    } else if (name === "district") {
      setFormData((prev) => ({ ...prev, ward: "" }));
    }
    console.log("Select changed:", { name, value: option ? option.value : "" }); // Debug
  };

  // Xử lý thay đổi phương thức vận chuyển
  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    const newFee = method === "standard" ? 25000 : 35000;
    setShippingFee(newFee);
    console.log("Shipping changed:", { method, shippingFee: newFee }); // Debug
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
    console.log("Payment method changed:", method); // Debug
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
    console.log("Discount applied:", { discountCode, discount }); // Debug
  };

  // Xử lý submit form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Kiểm tra đăng nhập
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập trước khi thanh toán!");
      return;
    }

    // Kiểm tra sản phẩm
    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm!");
      router.push("/cart");
      return;
    }

    // Validate form
    const newErrors: CheckoutErrors = {
      fullName: "",
      email: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      address: "",
    };
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^\d{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (!formData.province) newErrors.province = "Vui lòng chọn tỉnh thành";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận huyện";
    if (!formData.ward) newErrors.ward = "Vui lòng chọn phường xã";
    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    try {
      // Chuẩn bị dữ liệu cho createOrder
      const orderData = {
        products: orderItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
      };

      // Gọi API createOrder
      const response = await createOrder(orderData);

      // Xóa giỏ hàng
      dispatch({ type: "clear" });

      console.log("Order created:", response);
      toast.success("Đơn hàng đã được xác nhận!");
      router.push("/profile?tab=orders"); // Chuyển hướng đến trang đơn hàng
    } catch (error: any) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error(error.message || "Không thể tạo đơn hàng!");
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
};