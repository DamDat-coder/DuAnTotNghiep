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
import { useMemo } from "react";

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
  const { user, refreshUser } = useAuth();
  const { items } = useCart();
  const dispatch = useCartDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // Lấy các sản phẩm được chọn từ giỏ hàng
  const orderItems: ICartItem[] = items.filter((item) => item.selected);

  // Tính toán giá

  const subtotal = useMemo(
    () =>
      orderItems.reduce(
        (sum, item) =>
          sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
        0
      ),
    [orderItems]
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
    console.log("DEBUG useCheckout useEffect - Start", {
      userExists: !!user,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            addresses: user.addresses,
          }
        : null,
    });

    if (user && user.addresses) {
      console.log("DEBUG useCheckout - User and addresses exist", {
        addresses: user.addresses,
        addressesCount: user.addresses.length,
      });

      // 1. Điền thông tin cá nhân vào form
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          fullName: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        };
        console.log("DEBUG useCheckout - Updated formData", newFormData);
        return newFormData;
      });
      console.log(user);

      // 2. Xử lý danh sách địa chỉ
      setAddresses(user.addresses);
      console.log("DEBUG useCheckout - Set addresses", user.addresses);

      const defaultAddr =
        user.addresses.find((addr) => addr.is_default) || null;
      console.log("DEBUG useCheckout - Default address", defaultAddr);
      setDefaultAddress(defaultAddr);

      // 3. Xác định địa chỉ được chọn ban đầu
      let addressToSelect: Address | null = null;
      if (user.addresses.length === 1) {
        addressToSelect = user.addresses[0];
      } else if (defaultAddr) {
        addressToSelect = defaultAddr;
      } else if (user.addresses.length > 1) {
        addressToSelect = user.addresses[0];
      }
      console.log("DEBUG useCheckout - Selected address", addressToSelect);
      setSelectedAddress(addressToSelect);

      // 4. Cập nhật địa chỉ được chọn + đồng bộ lại form
      if (addressToSelect) {
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            province: addressToSelect.province,
            district: addressToSelect.district,
            ward: addressToSelect.ward,
            address: addressToSelect.street,
          };
          console.log(
            "DEBUG useCheckout - Updated formData with address",
            updatedFormData
          );
          return updatedFormData;
        });
      }

      // 5. Chỉ đặt isLoading = false khi tất cả dữ liệu đã sẵn sàng
      console.log(
        "DEBUG useCheckout - Setting isLoading to false (with addresses)"
      );
      setIsLoading(false);
    } else if (user && !user.addresses) {
      console.log("DEBUG useCheckout - User exists but no addresses", { user });
      // Nếu user tồn tại nhưng không có địa chỉ
      setAddresses([]);
      setDefaultAddress(null);
      setSelectedAddress(null);
      console.log(
        "DEBUG useCheckout - Setting isLoading to false (no addresses)"
      );
      setIsLoading(false);
    } else {
      console.log("DEBUG useCheckout - No user, setting isLoading to false");
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const savedCouponCode = localStorage.getItem("pendingCouponCode");
    if (!savedCouponCode) return;

    // ✅ Đợi `items` có dữ liệu
    if (items.length === 0 || subtotal <= 0) {
      console.log("⛔ Chưa đủ điều kiện áp dụng coupon", { items, subtotal });
      return;
    }

    const applyCoupon = async () => {
      try {
        const response = await validateCoupon(savedCouponCode, subtotal);
        if (response.success && response.data) {
          const { discountValue, discountType } = response.data;
          const discountAmount =
            discountType === "percent"
              ? subtotal * (discountValue / 100)
              : discountValue;

          setDiscount(discountAmount);
          setDiscountCode(response.data.code);
          toast.success("Đã áp dụng mã giảm giá!");
        } else {
          toast.error(response.message || "Mã giảm giá không hợp lệ!");
        }
      } catch (error) {
        console.error("Không thể áp dụng mã giảm giá:", error);
        toast.error("Có lỗi khi áp dụng mã giảm giá!");
      } finally {
        localStorage.removeItem("pendingCouponCode");
      }
    };

    applyCoupon();
  }, [subtotal, items.length]);

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

  const handleSelectAddress = async (address: Address) => {
    setSelectedAddress(address);
    setIsAddressPopupOpen(false);

    setFormData((prev) => ({
      ...prev,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address: address.street,
    }));

    // Cập nhật lại user.addresses
    if (user && user.id) {
      await refreshUser();
      console.log("DEBUG useCheckout - Refreshed user after selecting address");
    }
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
          is_default: addresses.length === 0,
        });
        addressId = newAddress._id;
        setAddresses((prev) => [...prev, newAddress]);
        await refreshUser(); // Cập nhật user sau khi thêm địa chỉ
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

      const paymentResponse = await initiatePayment(paymentInfo);
      if (paymentInfo.orderInfo.paymentMethod === "cod") {
        // 🧠 Flow COD: có paymentId ngay, nên gọi tiếp createOrder
        const orderResponse = await createOrder(
          paymentResponse.paymentId,
          user.id
        );
        dispatch({ type: "clear" });
        toast.success("Đơn hàng đã được xác nhận!");
        router.push("/profile?tab=orders");
      } else {
        localStorage.setItem("pendingPaymentId", paymentResponse.paymentId);
        localStorage.setItem("pendingUserId", user.id);
        if (paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
        } else {
          toast.error("Không tìm thấy đường dẫn thanh toán!");
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error(error.message || "Không thể tạo đơn hàng!");
    }
  };

  return {
    isLoading,
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
