import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { initiatePayment, createOrder } from "@/services/orderApi";
import { validateCoupon } from "@/services/couponApi";
import {
  addAddressWhenCheckout,
  setDefaultAddress as setDefaultAddressApi,
} from "@/services/userApi";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { ICartItem } from "@/types/cart";
import { Address, IUser } from "@/types/auth";

// Hàm sinh orderId 7 ký tự
const generateOrderId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const useCheckout = () => {
  const { user } = useAuth() as { user: IUser | null };
  const { items } = useCart();
  const dispatch = useCartDispatch();
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

  // State cho danh sách địa chỉ, địa chỉ mặc định, và địa chỉ đang chọn
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Đồng bộ formData với user và chọn địa chỉ hiển thị
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));

      // Lấy danh sách địa chỉ từ user.addresses
      if (user.addresses) {
        setAddresses(user.addresses);
        const defaultAddr =
          user.addresses.find((addr) => addr.is_default) || null;
        setDefaultAddress(defaultAddr);

        // Logic chọn địa chỉ hiển thị
        let addressToSelect: Address | null = null;
        if (user.addresses.length === 1) {
          // Nếu chỉ có 1 địa chỉ, chọn địa chỉ đó
          addressToSelect = user.addresses[0];
        } else if (defaultAddr) {
          // Nếu có địa chỉ mặc định, chọn địa chỉ mặc định
          addressToSelect = defaultAddr;
        } else if (user.addresses.length > 1) {
          // Nếu không có địa chỉ mặc định nhưng có nhiều địa chỉ, chọn địa chỉ đầu tiên
          addressToSelect = user.addresses[0];
        }

        setSelectedAddress(addressToSelect);
        if (addressToSelect) {
          setFormData((prev) => ({
            ...prev,
            province: addressToSelect.province,
            district: addressToSelect.district,
            ward: addressToSelect.ward,
            address: addressToSelect.street,
          }));
        }
      }
    }
  }, [user]);

  // Cập nhật total khi subtotal, discount, hoặc shippingFee thay đổi
  useEffect(() => {
    setTotal(subtotal - discount + shippingFee);
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
    // Reset selectedAddress khi người dùng thay đổi form thủ công
    setSelectedAddress(null);
  };

  // Xử lý thay đổi phương thức vận chuyển
  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    const newFee = method === "standard" ? 25000 : 35000;
    setShippingFee(newFee);
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = async () => {
    if (!discountCode) {
      setDiscount(0);
      return null; // Không có mã giảm giá
    }

    try {
      const response = await validateCoupon(discountCode, subtotal);
      if (response.success && response.data) {
        const { discountValue, discountType } = response.data;
        const discountAmount =
          discountType === "percent"
            ? subtotal * (discountValue / 100)
            : discountValue;
        setDiscount(discountAmount);
        toast.success("Áp dụng mã giảm giá thành công!");
        return response.data.id; // Trả về couponId
      } else {
        setDiscount(0);
        toast.error(response.message || "Mã giảm giá không hợp lệ!");
        return null;
      }
    } catch (error: any) {
      setDiscount(0);
      toast.error(error.message || "Mã giảm giá không hợp lệ!");
      return null;
    }
  };

  // Xử lý chọn địa chỉ từ popup
  const handleSelectAddress = async (address: Address) => {
    setSelectedAddress(address);
    setFormData((prev) => ({
      ...prev,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address: address.street,
    }));
    setIsAddressPopupOpen(false);
    toast.success("Đã chọn địa chỉ giao hàng!");
  };

  // Xử lý submit form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Kiểm tra đăng nhập
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !user || !user.id) {
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
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      // Đảm bảo có addressId
      let addressId: string;
      if (
        selectedAddress &&
        formData.address === selectedAddress.street &&
        formData.ward === selectedAddress.ward &&
        formData.district === selectedAddress.district &&
        formData.province === selectedAddress.province
      ) {
        addressId = selectedAddress._id;
      } else {
        const newAddress = await addAddressWhenCheckout(user.id, {
          street: formData.address,
          ward: formData.ward,
          district: formData.district,
          province: formData.province,
          is_default: false,
        });
        addressId = newAddress._id;
        setAddresses((prev) => [...prev, newAddress]);
      }

      // Kiểm tra và lấy couponId
      const couponId = await handleApplyDiscount();

      // Chuẩn bị dữ liệu thanh toán
      const paymentInfo = {
        orderId: generateOrderId(),
        totalPrice: total,
        userId: user.id,
        orderInfo: {
          address_id: addressId,
          shippingAddress: {
            street: formData.address,
            ward: formData.ward,
            district: formData.district,
            province: formData.province,
          },
          couponId: couponId || undefined,
          items: orderItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })),
          paymentMethod,
        },
      };

      // Gọi API thanh toán
      const paymentResponse = await initiatePayment(paymentInfo);

      if (!paymentResponse.paymentUrl) {
        // Với COD (hoặc bất kỳ phương thức nào không cần redirect)
        const orderResponse = await createOrder(
          paymentResponse.paymentId,
          user.id
        );
        dispatch({ type: "clear" });
        toast.success("Đơn hàng đã được xác nhận!");
        router.push("/profile?tab=orders");
      } else {
        // Với các cổng thanh toán online (vnpay, momo, zalopay)
        localStorage.setItem("pendingPaymentId", paymentResponse.paymentId);
        localStorage.setItem("pendingUserId", user.id);
        window.location.href = paymentResponse.paymentUrl;
      }
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
    addresses,
    defaultAddress,
    selectedAddress,
    isAddressPopupOpen,
    setIsAddressPopupOpen,
    handleSelectAddress,
  };
};
