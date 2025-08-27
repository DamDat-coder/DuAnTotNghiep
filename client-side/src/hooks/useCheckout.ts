import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { createOrder, initiatePayment } from "@/services/orderApi";
import { validateCoupon, suggestCoupons } from "@/services/couponApi";
import { addAddressWhenCheckout } from "@/services/userApi";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { ICartItem } from "@/types/cart";
import { Address } from "@/types/auth";
import { fetchProductById, fetchProductCategory } from "@/services/productApi";
import { useSearchParams } from "next/navigation";
import { HighlightedCoupon } from "@/types/coupon";
import { debounce } from "lodash";

const generateOrderId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const mapToHighlightedCoupon = (
  coupon: any,
  index: number
): HighlightedCoupon => ({
  _id: coupon.code,
  code: coupon.code,
  description: coupon.description || "",
  discountType: coupon.discountType as "percent" | "fixed",
  discountValue: coupon.discountValue,
  discountAmount: coupon.discountAmount,
  isTop: index < 3,
  is_active: true,
  minOrderAmount: undefined,
  maxDiscountAmount: undefined,
  startDate: undefined,
  endDate: undefined,
  usageLimit: undefined,
  usedCount: undefined,
  applicableProducts: undefined,
  applicableCategories: undefined,
});

export const useCheckout = () => {
  const { user, refreshUser } = useAuth();
  const { items } = useCart();
  const dispatch = useCartDispatch();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applicableItemIds, setApplicableItemIds] = useState<string[]>([]);
  const [discountPerItem, setDiscountPerItem] = useState<{
    [itemKey: string]: number;
  }>({});
  const [shippingFee, setShippingFee] = useState(25000);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [hasShownFreeShippingToast, setHasShownFreeShippingToast] = useState(false);
  const [hasAppliedPendingCoupon, setHasAppliedPendingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<HighlightedCoupon[]>([]);
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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  const orderItems: ICartItem[] = useMemo(
    () => items.filter((item) => item.selected),
    [items]
  );

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );

  const total = useMemo(
    () => subtotal - discount + shippingFee,
    [subtotal, discount, shippingFee]
  );

  const couponItems = useMemo(
    () => orderItems.map((item) => ({
      productId: item.id,
      price: item.price,
      quantity: item.quantity,
    })),
    [orderItems]
  );

  const fetchSuggestedCoupons = useCallback(
    debounce(
      async (items: { productId: string; price: number; quantity: number }[]) => {
        if (!items.length) {
          setAvailableCoupons([]);
          setIsLoading(false);
          return;
        }
        try {
          const response = await suggestCoupons(items);
          if (response.success && response.coupons) {
            const formattedCoupons = response.coupons.map(mapToHighlightedCoupon);
            setAvailableCoupons(formattedCoupons);
          } else {
            toast.error(response.message || "Không thể gợi ý mã giảm giá", {
              id: "coupon-fetch-error",
            });
            setAvailableCoupons([]);
          }
        } catch (error) {
          toast.error("Không thể tải mã giảm giá.", { id: "coupon-fetch-error" });
          setAvailableCoupons([]);
        } finally {
          setIsLoading(false);
        }
      },
      300
    ),
    []
  );

  // Nhóm 1: Xử lý dữ liệu ban đầu (buy now, coupon từ URL, user và addresses)
  useEffect(() => {
    // Xử lý recentBuyNow và pendingBuyNow
    const recentBuyNow = localStorage.getItem("recentBuyNow");
    const pendingBuyNow = localStorage.getItem("pendingBuyNow");

    const processBuyNow = async (buyNowData: any) => {
      try {
        const { id, size, color, quantity, product } = buyNowData;
        const existingItem = items.find(
          (item) => item.id === id && item.size === size && item.color === color
        );

        if (existingItem) {
          if (!existingItem.selected) {
            dispatch({ type: "updateSelected", id, size, color, selected: true });
          }
          dispatch({ type: "updateQuantity", id, size, color, quantity });
        } else {
          const productData = product || (await fetchProductById(id));
          if (!productData) return;
          const selectedVariant = productData.variants.find(
            (v: any) => v.size === size && v.color === color
          );
          if (!selectedVariant) return;
          const discountedPrice = Math.round(
            (selectedVariant.price ?? 0) * (1 - (selectedVariant.discountPercent ?? 0) / 100)
          );
          const cartItem: ICartItem = {
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
        toast.error("Không thể thêm sản phẩm vào giỏ hàng!", { id: "buy-now-error" });
      }
    };

    if (recentBuyNow) {
      try {
        const buyNowData = JSON.parse(recentBuyNow);
        processBuyNow(buyNowData);
        localStorage.removeItem("recentBuyNow");
      } catch (error) {
        localStorage.removeItem("recentBuyNow");
      }
    }

    if (pendingBuyNow) {
      try {
        const buyNowData = JSON.parse(pendingBuyNow);
        processBuyNow(buyNowData);
        localStorage.removeItem("pendingBuyNow");
      } catch (error) {
        localStorage.removeItem("pendingBuyNow");
      }
    }

    // Xử lý coupon từ URL
    const couponFromUrl = searchParams.get("coupon");
    if (couponFromUrl && availableCoupons.some((c) => c.code === couponFromUrl)) {
      setDiscountCode(couponFromUrl);
    }

    // Xử lý thông tin user và addresses
    if (user && user.addresses) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
      setAddresses(user.addresses);
      const defaultAddr = user.addresses.find((addr) => addr.is_default) || null;
      setDefaultAddress(defaultAddr);
      if (!selectedAddress) {
        const addressToSelect =
          user.addresses.length === 1
            ? user.addresses[0]
            : defaultAddr || (user.addresses.length > 1 ? user.addresses[0] : null);
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

    // Xử lý suggested coupons
    if (couponItems.length) {
      fetchSuggestedCoupons(couponItems);
    } else {
      setAvailableCoupons([]);
      setIsLoading(false);
    }

    return () => fetchSuggestedCoupons.cancel();
  }, [user, items, dispatch, searchParams, couponItems, fetchSuggestedCoupons, selectedAddress]);

  // Nhóm 2: Xử lý pendingCouponCode
  useEffect(() => {
    const savedCouponCode = localStorage.getItem("pendingCouponCode");
    if (!savedCouponCode || hasAppliedPendingCoupon) return;

    if (!orderItems.length || subtotal <= 0) {
      localStorage.removeItem("pendingCouponCode");
      setHasAppliedPendingCoupon(true);
      return;
    }

    const applyCoupon = async () => {
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

        if (itemsToValidate.some((item) => !item.categoryId || item.categoryId.trim() === "")) {
          toast.error("Thiếu thông tin danh mục cho một số sản phẩm!", { id: "coupon-error" });
          localStorage.removeItem("pendingCouponCode");
          setHasAppliedPendingCoupon(true);
          return;
        }

        const response = await validateCoupon(savedCouponCode, subtotal, itemsToValidate);
        if (response.success && response.data) {
          const { discount: couponDiscount, applicableItemIds, items } = response.data;
          setDiscount(couponDiscount);
          setDiscountCode(response.data.code);
          setApplicableItemIds(applicableItemIds);
          setDiscountPerItem(calculateDiscountPerItem(orderItems, response.data));
          toast.success(`Áp dụng mã ${response.data.code} thành công!`, { id: "coupon-applied" });
        } else {
          toast.error(response.message || "Mã giảm giá không hợp lệ!", { id: "coupon-error" });
        }
      } catch (error) {
        toast.error("Có lỗi khi áp dụng mã giảm giá!", { id: "coupon-error" });
      } finally {
        setHasAppliedPendingCoupon(true);
        localStorage.removeItem("pendingCouponCode");
      }
    };

    applyCoupon();
  }, [orderItems, subtotal, hasAppliedPendingCoupon]);

  // Nhóm 3: Xử lý phí vận chuyển
  useEffect(() => {
    const newShippingFee = shippingMethod === "standard" ? 25000 : 35000;
    let updatedShippingFee = newShippingFee;

    if (subtotal >= 1000000) {
      updatedShippingFee = shippingMethod === "standard" ? 0 : 15000;
      if (!isFreeShipping && !hasShownFreeShippingToast) {
        toast.success(
          shippingMethod === "standard"
            ? "Miễn phí vận chuyển tiêu chuẩn!"
            : "Phí giao hàng nhanh giảm còn 15.000 VNĐ!",
          { id: `shipping-${shippingMethod}` }
        );
        setHasShownFreeShippingToast(true);
        setIsFreeShipping(true);
      }
    } else {
      setIsFreeShipping(false);
      setHasShownFreeShippingToast(false);
    }

    setShippingFee(updatedShippingFee);
  }, [subtotal, shippingMethod, isFreeShipping, hasShownFreeShippingToast]);

  // Nhóm 4: Cleanup khi unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
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
  }, [dispatch, items]);

  const calculateDiscountPerItem = (
    items: ICartItem[],
    couponData: { items: { productId: string; isDiscounted: boolean; itemDiscount: number }[] }
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

  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    let newShippingFee = method === "standard" ? 25000 : 35000;

    if (subtotal >= 1000000) {
      newShippingFee = method === "standard" ? 0 : 15000;
      if (!hasShownFreeShippingToast) {
        toast.success(
          method === "standard"
            ? "Miễn phí vận chuyển!"
            : "Phí giao hàng nhanh giảm còn 15.000 VNĐ!",
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, option: any) => {
    setFormData((prev) => ({ ...prev, [name]: option ? option.value : "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "province") {
      setFormData((prev) => ({ ...prev, ward: "" }));
    }
    setSelectedAddress(null);
  };

  const handlePaymentChange = (method: string) => setPaymentMethod(method);

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

      if (itemsToValidate.some((item) => !item.categoryId || item.categoryId.trim() === "")) {
        toast.error("Thiếu thông tin danh mục sản phẩm!", { id: "coupon-error" });
        return null;
      }

      const response = await validateCoupon(discountCode, subtotal, itemsToValidate);
      if (response.success && response.data) {
        const { discount: couponDiscount, applicableItemIds, items } = response.data;
        setDiscount(couponDiscount);
        setApplicableItemIds(applicableItemIds);
        setDiscountPerItem(calculateDiscountPerItem(orderItems, response.data));
        toast.success(`Áp dụng mã ${response.data.code} thành công!`, { id: "coupon-applied" });
        return response.data.id;
      } else {
        setDiscount(0);
        setApplicableItemIds([]);
        setDiscountPerItem({});
        toast.error(response.message || "Mã giảm giá không hợp lệ!", { id: "coupon-error" });
        return null;
      }
    } catch (error) {
      toast.error("Có lỗi khi áp dụng mã giảm giá!", { id: "coupon-error" });
      return null;
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsAddressPopupOpen(false);
    setFormData((prev) => ({
      ...prev,
      province: address.province,
      ward: address.ward,
      address: address.street,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập!", { id: "auth-error" });
      window.location.href = "/login";
      return;
    }

    if (!orderItems.length) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm!", { id: "cart-error" });
      window.location.href = "/cart";
      return;
    }

    const newErrors: CheckoutErrors = {
      fullName: !formData.fullName ? "Vui lòng nhập họ và tên" : "",
      email: !formData.email
        ? "Vui lòng nhập email"
        : !/\S+@\S+\.\S+/.test(formData.email)
        ? "Email không hợp lệ"
        : "",
      phone: !formData.phone
        ? "Vui lòng nhập số điện thoại"
        : !/^\d{10,11}$/.test(formData.phone)
        ? "Số điện thoại không hợp lệ"
        : "",
      province: !formData.province ? "Vui lòng chọn tỉnh thành" : "",
      ward: !formData.ward ? "Vui lòng chọn phường xã" : "",
      address: !formData.address ? "Vui lòng nhập địa chỉ" : "",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!", { id: "form-error" });
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

      if (paymentMethod === "cod") {
        await createOrder(
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
          toast.error("Không tìm thấy đường dẫn thanh toán!", { id: "payment-error" });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo đơn hàng!", { id: "submit-error" });
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