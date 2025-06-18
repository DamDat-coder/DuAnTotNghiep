import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { ICartItem } from "@/types/cart";

export const useCheckout = () => {
  const { user } = useAuth();
  const { items } = useCart();
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
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const total = subtotal - discount + shippingFee;

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
    address: ""
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

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
  };

  // Xử lý thay đổi phương thức vận chuyển
  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    setShippingFee(method === "standard" ? 30000 : 50000); // Ví dụ
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
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
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Kiểm tra đăng nhập
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập trước khi thanh toán!");
      router.push("/login");
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
      address: ""
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

    if (Object.keys(newErrors).length === 0) {
      console.log("Submitting order:", {
        orderItems,
        formData,
        discountCode,
        discount,
        shippingFee,
        shippingMethod,
        paymentMethod,
        total,
      });
      // Gọi API để tạo đơn hàng
      // Ví dụ: createOrder({ ... });
      toast.success("Đơn hàng đã được xác nhận!");
      router.push("/order-confirmation");
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