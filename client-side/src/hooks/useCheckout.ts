import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { createOrder, initiatePayment } from "@/services/orderApi";
import {
  fetchAllCoupons,
  fetchTopDiscountCoupons,
  validateCoupon,
} from "@/services/couponApi";
import {
  addAddressWhenCheckout,
  setDefaultAddress as setDefaultAddressApi,
} from "@/services/userApi";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { ICartItem } from "@/types/cart";
import { Address, IUser } from "@/types/auth";
import { fetchProductById, fetchProductCategory } from "@/services/productApi";
import { useSearchParams } from "next/navigation";
import { Coupon, HighlightedCoupon } from "@/types/coupon";

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
  const [isLoading, setIsLoading] = useState(true);
  const orderItems: ICartItem[] = state.items.filter((item) => item.selected);

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applicableItemIds, setApplicableItemIds] = useState<string[]>([]);
  const [discountPerItem, setDiscountPerItem] = useState<{
    [itemKey: string]: number;
  }>({});
  const [shippingFee, setShippingFee] = useState(25000);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [total, setTotal] = useState(subtotal - discount + shippingFee);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [hasShownFreeShippingToast, setHasShownFreeShippingToast] =
    useState(false);
  const [hasAppliedPendingCoupon, setHasAppliedPendingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<HighlightedCoupon[]>(
    []
  );
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const [allCouponsRes, topCoupons] = await Promise.all([
          fetchAllCoupons(true, undefined, 1, 100),
          fetchTopDiscountCoupons(),
        ]);

        const allCoupons = allCouponsRes.data || [];

        // Gắn cờ isTop cho topCoupons
        const topCouponsWithFlag: HighlightedCoupon[] = topCoupons.map((c) => ({
          ...c,
          isTop: true,
        }));

        // Lọc trùng
        const filteredAll: HighlightedCoupon[] = allCoupons.filter(
          (c) => !topCoupons.some((t) => t._id === c._id)
        );

        setAvailableCoupons([...topCouponsWithFlag, ...filteredAll]);
      } catch (error) {
        console.error("Lỗi khi lấy coupons:", error);
        setAvailableCoupons([]);
      }
    };

    fetchCoupons();
  }, []);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    ward: "",
    address: "",
  });

  const [errors, setErrors] = useState<CheckoutErrors>({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    ward: "",
    address: "",
  });
  const searchParams = useSearchParams();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Fetch mã giảm giá từ API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetchAllCoupons(true, undefined, 1, 100);
        setAvailableCoupons(response.data || []);
      } catch (error) {
        toast.error("Không thể tải mã giảm giá.", { id: "coupon-fetch-error" });
        setAvailableCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // Khôi phục trạng thái từ pendingBuyNow và recentBuyNow
  useEffect(() => {
    const recentBuyNow = localStorage.getItem("recentBuyNow");
    const pendingBuyNow = localStorage.getItem("pendingBuyNow");

    if (!recentBuyNow && !pendingBuyNow) return;

    const processBuyNow = async (buyNowData: any, isPending: boolean) => {
      try {
        const { id, size, color, quantity, product } = buyNowData;
        const existingItem = state.items.find(
          (item) => item.id === id && item.size === size && item.color === color
        );

        if (existingItem) {
          if (!existingItem.selected) {
            dispatch({
              type: "updateSelected",
              id,
              size,
              color,
              selected: true,
            });
          }
          dispatch({
            type: "updateQuantity",
            id,
            size,
            color,
            quantity,
          });
        } else {
          const productData = product || (await fetchProductById(id));
          if (!productData) {
            console.error("DEBUG: Failed to fetch product data for id:", id);
            return;
          }
          const selectedVariant = productData.variants.find(
            (v: any) => v.size === size && v.color === color
          );
          if (!selectedVariant) {
            console.error("DEBUG: Invalid variant in buyNowData:", buyNowData);
            return;
          }
          const discountedPrice = Math.round(
            (selectedVariant.price ?? 0) *
              (1 - (selectedVariant.discountPercent ?? 0) / 100)
          );
          const cartItem = {
            id: productData.id,
            name: productData.name,
            originPrice: selectedVariant.price,
            price: discountedPrice,
            discountPercent: selectedVariant.discountPercent,
            image: productData.images[0] || "",
            quantity,
            size,
            color,
            liked: false,
            selected: true,
            categoryId: productData.categoryId ?? "",
            stock: selectedVariant.stock,
            fromBuyNow: true,
          };
          dispatch({ type: "add", item: cartItem });
        }
      } catch (error) {
        console.error("DEBUG: Error processing buyNow:", error);
        toast.error("Không thể thêm sản phẩm vào giỏ hàng!", {
          id: "buy-now-error",
        });
      }
    };

    if (recentBuyNow) {
      try {
        const buyNowData = JSON.parse(recentBuyNow);
        processBuyNow(buyNowData, false);
        localStorage.removeItem("recentBuyNow");
      } catch (error) {
        console.error("DEBUG: Error parsing recentBuyNow:", error);
        localStorage.removeItem("recentBuyNow");
      }
    }

    if (pendingBuyNow) {
      try {
        const buyNowData = JSON.parse(pendingBuyNow);
        processBuyNow(buyNowData, true);
        localStorage.removeItem("pendingBuyNow");
      } catch (error) {
        console.error("DEBUG: Error parsing pendingBuyNow:", error);
        localStorage.removeItem("pendingBuyNow");
      }
    }
  }, [dispatch]);

  // Đồng bộ discountCode từ searchParams
  useEffect(() => {
    const couponFromUrl = searchParams.get("coupon");
    if (
      couponFromUrl &&
      availableCoupons.some((c) => c.code === couponFromUrl)
    ) {
      setDiscountCode(couponFromUrl);
    }
  }, [searchParams, availableCoupons]);

  // Đồng bộ formData với user và chọn địa chỉ hiển thị
  useEffect(() => {
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
      if (!selectedAddress) {
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
            ward: addressToSelect.ward,
            address: addressToSelect.street,
          }));
        }
      }
    } else {
      setAddresses([]);
      setDefaultAddress(null);
      setSelectedAddress(null);
    }
    setIsLoading(false);
  }, [user, selectedAddress]);

  // Áp dụng mã giảm giá từ localStorage
  useEffect(() => {
    const savedCouponCode = localStorage.getItem("pendingCouponCode");
    if (!savedCouponCode || hasAppliedPendingCoupon) return;

    if (orderItems.length === 0 || subtotal <= 0) {
      localStorage.removeItem("pendingCouponCode");
      setHasAppliedPendingCoupon(true);
      return;
    }

    const applyCoupon = async () => {
      try {
        const itemsToValidate = await Promise.all(
          orderItems.map(async (item) => ({
            id: item.id,
            categoryId:
              item.categoryId || (await fetchProductCategory(item.id)),
            price: item.originPrice || item.price,
            discountPercent: item.discountPercent || 0,
            quantity: item.quantity,
          }))
        );

        if (
          itemsToValidate.some(
            (item) => !item.categoryId || item.categoryId.trim() === ""
          )
        ) {
          toast.error(
            "Thiếu thông tin danh mục cho một số sản phẩm trong đơn hàng!",
            { id: "coupon-error" }
          );
          localStorage.removeItem("pendingCouponCode");
          setHasAppliedPendingCoupon(true);
          return;
        }

        const response = await validateCoupon(
          savedCouponCode,
          subtotal,
          itemsToValidate
        );
        if (response.success && response.data) {
          const {
            discount: couponDiscount,
            applicableItemIds,
            items,
          } = response.data;
          setDiscount(couponDiscount);
          setDiscountCode(response.data.code);
          setApplicableItemIds(applicableItemIds);
          setDiscountPerItem(
            calculateDiscountPerItem(orderItems, response.data)
          );
          toast.success(
            `Áp dụng mã giảm giá ${response.data.code} thành công cho ${applicableItemIds.length} sản phẩm!`,
            { id: "coupon-applied" }
          );
        } else {
          toast.error(response.message || "Mã giảm giá không hợp lệ!", {
            id: "coupon-error",
          });
        }
      } catch (error) {
        console.error("DEBUG: Error applying coupon:", { error });
        toast.error("Có lỗi khi áp dụng mã giảm giá!", { id: "coupon-error" });
      } finally {
        setHasAppliedPendingCoupon(true);
        localStorage.removeItem("pendingCouponCode");
      }
    };

    applyCoupon();
  }, [orderItems, subtotal]);

  // Hàm phân bổ giảm giá cho từng sản phẩm
  const calculateDiscountPerItem = (
    items: ICartItem[],
    couponData: {
      items: {
        productId: string;
        isDiscounted: boolean;
        itemDiscount: number;
      }[];
    }
  ) => {
    const result: { [itemKey: string]: number } = {};
    couponData.items.forEach((item) => {
      if (item.isDiscounted) {
        const cartItem = items.find((cart) => cart.id === item.productId);
        if (cartItem) {
          const itemKey = `${cartItem.id}-${cartItem.size}-${cartItem.color}`;
          result[itemKey] = item.itemDiscount || 0;
        }
      }
    });
    return result;
  };

  // Xử lý phí vận chuyển và tổng tiền
  useEffect(() => {
    let newShippingFee = shippingMethod === "standard" ? 25000 : 35000;

    if (subtotal >= 1000000) {
      if (shippingMethod === "standard") {
        newShippingFee = 0;
        if (!isFreeShipping && !hasShownFreeShippingToast) {
          toast.success(
            "Đơn hàng của bạn được miễn phí vận chuyển theo phương thức tiêu chuẩn!",
            { id: "free-shipping" }
          );
          setHasShownFreeShippingToast(true);
          setIsFreeShipping(true);
        }
      } else if (shippingMethod === "express") {
        newShippingFee = 15000;
        if (!isFreeShipping && !hasShownFreeShippingToast) {
          toast.success("Phí giao hàng nhanh được giảm còn 15.000 VNĐ!", {
            id: "express-shipping",
          });
          setHasShownFreeShippingToast(true);
          setIsFreeShipping(true);
        }
      }
    } else {
      setIsFreeShipping(false);
      setHasShownFreeShippingToast(false);
    }

    setShippingFee(newShippingFee);
    setTotal(subtotal - discount + newShippingFee);
  }, [subtotal, discount, shippingMethod]);

  // Reset selected chỉ khi component unmount
  useEffect(() => {
    return () => {
      state.items.forEach((item) => {
        if (item.selected) {
          dispatch({
            type: "updateSelected",
            id: item.id,
            size: item.size,
            color: item.color,
            selected: false,
          });
        }
      });
      localStorage.removeItem("recentBuyNow");
      localStorage.removeItem("pendingBuyNow");
      localStorage.removeItem("pendingCouponCode");
    };
  }, [dispatch]); // Chỉ phụ thuộc vào dispatch

  // Xử lý thay đổi phương thức vận chuyển
  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    let newShippingFee = method === "standard" ? 25000 : 35000;

    if (subtotal >= 1000000) {
      newShippingFee = method === "standard" ? 0 : 15000;
      if (!hasShownFreeShippingToast) {
        toast.success(
          method === "standard"
            ? "Đơn hàng của bạn được miễn phí vận chuyển!"
            : "Phí giao hàng nhanh được giảm còn 15.000 VNĐ!",
          { id: `shipping-${method}` }
        );
        setHasShownFreeShippingToast(true);
      }
      setIsFreeShipping(true);
    } else {
      setIsFreeShipping(false);
      setHasShownFreeShippingToast(false);
    }

    setShippingFee(newShippingFee);
    setTotal(subtotal - discount + newShippingFee);
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
      toast.success("Đã xóa mã giảm giá.", { id: "coupon-removed" });
      return null;
    }

    try {
      const itemsToValidate = await Promise.all(
        orderItems.map(async (item) => ({
          id: item.id,
          categoryId: item.categoryId || (await fetchProductCategory(item.id)),
          price: item.originPrice || item.price,
          discountPercent: item.discountPercent || 0,
          quantity: item.quantity,
        }))
      );

      if (
        itemsToValidate.some(
          (item) => !item.categoryId || item.categoryId.trim() === ""
        )
      ) {
        toast.error(
          "Thiếu thông tin danh mục cho một số sản phẩm trong đơn hàng!",
          { id: "coupon-error" }
        );
        return null;
      }

      const response = await validateCoupon(
        discountCode,
        subtotal,
        itemsToValidate
      );
      if (response.success && response.data) {
        const {
          discount: couponDiscount,
          applicableItemIds,
          items,
        } = response.data;
        setDiscount(couponDiscount);
        setApplicableItemIds(applicableItemIds);
        setDiscountPerItem(calculateDiscountPerItem(orderItems, response.data));
        toast.success(
          `Áp dụng mã giảm giá ${response.data.code} thành công cho ${applicableItemIds.length} sản phẩm!`,
          { id: "coupon-applied" }
        );
        return response.data.id;
      } else {
        setDiscount(0);
        setApplicableItemIds([]);
        setDiscountPerItem({});
        toast.error(response.message || "Mã giảm giá không hợp lệ!", {
          id: "coupon-error",
        });
        return null;
      }
    } catch (error: any) {
      console.error("DEBUG: Error applying coupon:", { error });
      toast.error("Có lỗi khi áp dụng mã giảm giá!", { id: "coupon-error" });
      return null;
    }
  };

  // Xử lý chọn địa chỉ
  const handleSelectAddress = async (address: Address) => {
    setSelectedAddress(address);
    setIsAddressPopupOpen(false);

    setFormData((prev) => ({
      ...prev,
      province: address.province,
      ward: address.ward,
      address: address.street,
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !user || !user.id) {
      toast.error("Vui lòng đăng nhập trước khi đặt hàng!", {
        id: "auth-error",
      });
      window.location.href = "/login";
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm!", { id: "cart-error" });
      window.location.href = "/cart";
      return;
    }

    // Kiểm tra formData
    const newErrors: CheckoutErrors = {
      fullName: "",
      email: "",
      phone: "",
      province: "",
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
    if (!formData.ward) newErrors.ward = "Vui lòng chọn phường xã";
    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!", {
        id: "form-error",
      });
      return;
    }

    try {
      let addressId: string;
      if (
        selectedAddress &&
        formData.address === selectedAddress.street &&
        formData.ward === selectedAddress.ward &&
        formData.province === selectedAddress.province
      ) {
        addressId = selectedAddress._id;
      } else {
        const newAddress = await addAddressWhenCheckout(user.id, {
          street: formData.address,
          ward: formData.ward,
          province: formData.province,
          is_default: addresses.length === 0,
        });
        addressId = newAddress._id;
        setAddresses((prev) => [...prev, newAddress]);
        await refreshUser();
      }

      const couponId = await handleApplyDiscount();
      const orderInfo = {
        totalPrice: total,
        shippingAddress: {
          street: formData.address,
          ward: formData.ward,
          province: formData.province,
          phone: formData.phone,
        },
        code: discountCode || null,
        discountAmount: discount,
        items: orderItems.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          originPrice: item.originPrice,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        })),
        paymentMethod,
        shipping: shippingFee,
        email: formData.email,
      };

      console.log(
        "DEBUG: orderInfo before createOrder:",
        JSON.stringify(orderInfo, null, 2)
      );

      if (paymentMethod === "cod") {
        const orderResponse = await createOrder(
          user.id,
          orderInfo.items,
          orderInfo.shippingAddress,
          total,
          discount,
          paymentMethod,
          shippingFee,
          formData.email,
          discountCode || null
        );
        localStorage.setItem("paymentMethod", "cod");
        window.location.href = "/payment/success";
      } else {
        const paymentInfo = {
          orderId: generateOrderId(),
          totalPrice: total,
          userId: user.id,
          email: formData.email,
          orderInfo,
        };
        const paymentResponse = await initiatePayment(paymentInfo);
        localStorage.setItem("pendingPaymentId", paymentResponse.paymentId);
        localStorage.setItem("pendingUserId", user.id);
        localStorage.setItem("paymentMethod", paymentMethod);
        localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
        if (paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
        } else {
          toast.error("Không tìm thấy đường dẫn thanh toán!", {
            id: "payment-error",
          });
        }
      }
    } catch (error: any) {
      console.error(
        "DEBUG: Error in handleSubmit:",
        JSON.stringify(error, null, 2)
      );
      toast.error(error.message || "Không thể tạo đơn hàng!", {
        id: "submit-error",
      });
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
    availableCoupons,
  };
};