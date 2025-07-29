import { useState, useEffect, useMemo } from "react";
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
import { fetchProductCategory } from "@/services/productApi";

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
  const state = useCart();
  const dispatch = useCartDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const orderItems: ICartItem[] = state.items.filter((item) => item.selected);

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
  const [applicableItemIds, setApplicableItemIds] = useState<string[]>([]);
  const [discountPerItem, setDiscountPerItem] = useState<{
    [itemKey: string]: number;
  }>({});
  const [shippingFee, setShippingFee] = useState(25000); // Mặc định standard
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [total, setTotal] = useState(subtotal - discount + shippingFee);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Tính toán phân bổ discount cho từng sản phẩm
  const calculateDiscountPerItem = (
    items: ICartItem[],
    discount: number,
    applicableItemIds: string[]
  ) => {
    const result: { [itemKey: string]: number } = {};
    const applicableItems = items.filter((item) =>
      applicableItemIds.includes(item.id)
    );
    if (applicableItems.length === 0) return result;

    // Tính tổng giá áp dụng được mã
    const totalApplicablePrice = applicableItems.reduce(
      (sum, item) =>
        sum + item.price * (1 - item.discountPercent / 100) * item.quantity,
      0
    );

    // Phân bổ discount theo tỷ lệ giá
    applicableItems.forEach((item) => {
      const itemKey = `${item.id}-${item.size}-${item.color}`;
      const itemPrice =
        item.price * (1 - item.discountPercent / 100) * item.quantity;
      result[itemKey] = (itemPrice / totalApplicablePrice) * discount;
    });

    console.log("DEBUG calculateDiscountPerItem", {
      discount,
      applicableItemIds,
      applicableItems,
      totalApplicablePrice,
      result,
    });

    return result;
  };

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
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
      setAddresses(user.addresses);
      const defaultAddr =
        user.addresses.find((addr) => addr.is_default) || null;
      setDefaultAddress(defaultAddr);
      let addressToSelect: Address | null = null;
      if (user.addresses.length === 1) {
        addressToSelect = user.addresses[0];
      } else if (defaultAddr) {
        addressToSelect = defaultAddr;
      } else if (user.addresses.length > 1) {
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
      setIsLoading(false);
    } else if (user && !user.addresses) {
      setAddresses([]);
      setDefaultAddress(null);
      setSelectedAddress(null);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Xử lý phí vận chuyển và tổng tiền
  useEffect(() => {
    let newShippingFee = shippingMethod === "standard" ? 25000 : 35000;

    if (subtotal >= 1000000) {
      if (shippingMethod === "standard") {
        newShippingFee = 0;
        if (!isFreeShipping) {
          toast.success("Đơn hàng của bạn được miễn phí vận chuyển!");
          setIsFreeShipping(true);
        }
      } else if (shippingMethod === "express") {
        newShippingFee = 15000;
        if (!isFreeShipping) {
          toast.success("Phí giao hàng nhanh được giảm còn 15.000 VNĐ!");
          setIsFreeShipping(true);
        }
      }
    } else {
      setIsFreeShipping(false);
    }

    setShippingFee(newShippingFee);
    setTotal(subtotal - discount + newShippingFee);
  }, [subtotal, discount, shippingMethod, isFreeShipping]);

  // Áp dụng mã giảm giá từ localStorage
  useEffect(() => {
    const savedCouponCode = localStorage.getItem("pendingCouponCode");
    if (!savedCouponCode) return;

    if (orderItems.length === 0 || subtotal <= 0) {
      console.log("⛔ Chưa đủ điều kiện áp dụng coupon", {
        orderItems,
        subtotal,
      });
      return;
    }

    const applyCoupon = async () => {
      try {
        // Lấy categoryId nếu thiếu
        const itemsToValidate = await Promise.all(
          orderItems.map(async (item) => ({
            id: item.id,
            categoryId:
              item.categoryId || (await fetchProductCategory(item.id)),
            price: item.price,
            discountPercent: item.discountPercent,
            quantity: item.quantity,
          }))
        );

        // Kiểm tra nếu vẫn thiếu categoryId
        if (
          itemsToValidate.some(
            (item) => !item.categoryId || item.categoryId.trim() === ""
          )
        ) {
          console.log("DEBUG useCheckout - Missing categoryId after fetch", {
            itemsToValidate,
          });
          toast.error(
            "Thiếu thông tin danh mục cho một số sản phẩm trong đơn hàng!"
          );
          return;
        }

        console.log("DEBUG useCheckout - Applying coupon", {
          savedCouponCode,
          itemsToValidate,
        });
        const response = await validateCoupon(
          savedCouponCode,
          subtotal,
          itemsToValidate
        );
        console.log("DEBUG useCheckout - Coupon validation response", {
          response,
        });
        if (response.success && response.data) {
          const {
            discountValue,
            discountType,
            applicableTotal,
            applicableItemIds,
          } = response.data;
          let discountAmount =
            discountType === "percent"
              ? applicableTotal * (discountValue / 100)
              : discountValue;

          if (response.data.maxDiscountAmount) {
            discountAmount = Math.min(
              discountAmount,
              response.data.maxDiscountAmount
            );
          }

          setDiscount(discountAmount);
          setDiscountCode(response.data.code);
          setApplicableItemIds(applicableItemIds);
          setDiscountPerItem(
            calculateDiscountPerItem(
              orderItems,
              discountAmount,
              applicableItemIds
            )
          );
          toast.success(
            `Áp dụng mã giảm giá ${response.data.code} thành công cho ${applicableItemIds.length} sản phẩm!`
          );
        } else {
          toast.error(response.message || "Mã giảm giá không hợp lệ!");
        }
      } catch (error) {
        console.error("DEBUG useCheckout - Error applying coupon", { error });
        toast.error("Có lỗi khi áp dụng mã giảm giá!");
      } finally {
        localStorage.removeItem("pendingCouponCode");
      }
    };

    applyCoupon();
  }, [subtotal, orderItems]);

  // Xử lý thay đổi phương thức vận chuyển
  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    let newShippingFee = method === "standard" ? 25000 : 35000;

    if (subtotal >= 1000000) {
      newShippingFee = method === "standard" ? 0 : 15000;
      toast.success(
        method === "standard"
          ? "Đơn hàng của bạn được miễn phí vận chuyển!"
          : "Phí giao hàng nhanh được giảm còn 15.000 VNĐ!"
      );
      setIsFreeShipping(true);
    } else {
      setIsFreeShipping(false);
    }

    setShippingFee(newShippingFee);
  };

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
    setSelectedAddress(null);
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentChange = (method: string) => {
    setPaymentMethod(method);
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = async () => {
    if (!discountCode) {
      setDiscount(0);
      setApplicableItemIds([]);
      setDiscountPerItem({});
      return null;
    }

    try {
      // Lấy categoryId nếu thiếu
      const itemsToValidate = await Promise.all(
        orderItems.map(async (item) => ({
          id: item.id,
          categoryId: item.categoryId || (await fetchProductCategory(item.id)),
          price: item.price,
          discountPercent: item.discountPercent,
          quantity: item.quantity,
        }))
      );

      // Kiểm tra nếu vẫn thiếu categoryId
      if (
        itemsToValidate.some(
          (item) => !item.categoryId || item.categoryId.trim() === ""
        )
      ) {
        console.log("DEBUG useCheckout - Missing categoryId after fetch", {
          itemsToValidate,
        });
        toast.error(
          "Thiếu thông tin danh mục cho một số sản phẩm trong đơn hàng!"
        );
        return null;
      }

      console.log("DEBUG useCheckout - Applying coupon", {
        discountCode,
        itemsToValidate,
      });
      const response = await validateCoupon(
        discountCode,
        subtotal,
        itemsToValidate
      );
      console.log("DEBUG useCheckout - Coupon validation response", {
        response,
      });
      if (response.success && response.data) {
        const {
          discountValue,
          discountType,
          applicableTotal,
          applicableItemIds,
        } = response.data;
        let discountAmount =
          discountType === "percent"
            ? applicableTotal * (discountValue / 100)
            : discountValue;

        if (response.data.maxDiscountAmount) {
          discountAmount = Math.min(
            discountAmount,
            response.data.maxDiscountAmount
          );
        }

        setDiscount(discountAmount);
        setApplicableItemIds(applicableItemIds);
        setDiscountPerItem(
          calculateDiscountPerItem(
            orderItems,
            discountAmount,
            applicableItemIds
          )
        );
        toast.success(
          `Áp dụng mã giảm giá ${response.data.code} thành công cho ${applicableItemIds.length} sản phẩm!`
        );
        return response.data.id;
      } else {
        setDiscount(0);
        setApplicableItemIds([]);
        setDiscountPerItem({});
        toast.error(response.message || "Mã giảm giá không hợp lệ!");
        return null;
      }
    } catch (error: any) {
      console.error("DEBUG useCheckout - Error applying coupon", { error });
      setDiscount(0);
      setApplicableItemIds([]);
      setDiscountPerItem({});
      toast.error("Có lỗi khi áp dụng mã giảm giá!");
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

    if (user && user.id) {
      await refreshUser();
      console.log("DEBUG useCheckout - Refreshed user after selecting address");
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !user || !user.id) {
      toast.error("Vui lòng đăng nhập trước khi thanh toán!");
      router.push("/login");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm!");
      router.push("/cart");
      return;
    }

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
          is_default: addresses.length === 0,
        });
        addressId = newAddress._id;
        setAddresses((prev) => [...prev, newAddress]);
        await refreshUser();
      }

      const couponId = await handleApplyDiscount();
      const paymentInfo = {
        orderId: generateOrderId(),
        totalPrice: total,
        userId: user.id,
        orderInfo: {
          shippingAddress: {
            street: formData.address,
            ward: formData.ward,
            district: formData.district,
            province: formData.province,
            phone: formData.phone,
          },
          couponId: couponId || undefined,
          items: orderItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })),
          paymentMethod,
          shipping: shippingFee,
        },
      };

      const paymentResponse = await initiatePayment(paymentInfo);
      if (paymentInfo.orderInfo.paymentMethod === "cod") {
        localStorage.setItem("pendingPaymentId", paymentResponse.paymentId);
        localStorage.setItem("pendingUserId", user.id);
        router.push("/payment/success");
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
    applicableItemIds,
    discountPerItem,
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
    isFreeShipping,
  };
};
