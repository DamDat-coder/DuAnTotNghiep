import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCartDispatch } from "@/contexts/CartContext";
import { initiatePayment, createOrder } from "@/services/orderApi";
import { fetchAllCoupons, validateCoupon } from "@/services/couponApi";
import {
  addAddressWhenCheckout,
  setDefaultAddress as setDefaultAddressApi,
} from "@/services/userApi";
import { CheckoutFormData, CheckoutErrors } from "@/types/checkout";
import { ICartItem } from "@/types/cart";
import { Address, IUser } from "@/types/auth";
import { fetchProductById, fetchProductCategory } from "@/services/productApi";
import { useSearchParams } from "next/navigation";
import { Coupon } from "@/types/coupon";

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
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Fetch mã giảm giá từ API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetchAllCoupons(true, undefined, 1, 100);
        setAvailableCoupons(response.data || []);
      } catch (error) {
        toast.error("Không thể tải mã giảm giá.");
        setAvailableCoupons([]);
      }
    };
    fetchCoupons();
  }, []);

  // Khôi phục trạng thái từ pendingBuyNow và recentBuyNow
  useEffect(() => {
    const recentBuyNow = localStorage.getItem("recentBuyNow");
    if (recentBuyNow) {
      try {
        const buyNowData = JSON.parse(recentBuyNow);
        const { id, size, color, quantity } = buyNowData;
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
          const fetchProduct = async () => {
            const product = await fetchProductById(id);
            if (!product) {
              console.error("DEBUG: Failed to fetch product data for id:", id);
              return;
            }
            const selectedVariant = product.variants.find(
              (v: any) => v.size === size && v.color === color
            );
            if (!selectedVariant) {
              console.error(
                "DEBUG: Invalid variant in recentBuyNow:",
                buyNowData
              );
              return;
            }
            const discountedPrice = Math.round(
              (selectedVariant.price ?? 0) *
                (1 - (selectedVariant.discountPercent ?? 0) / 100)
            );
            dispatch({
              type: "add",
              item: {
                id,
                name: product.name,
                originPrice: selectedVariant.price,
                price: discountedPrice,
                discountPercent: selectedVariant.discountPercent,
                image: product.images[0] || "",
                quantity,
                size,
                color,
                liked: false,
                selected: true,
                categoryId: product.categoryId ?? "",
                stock: selectedVariant.stock,
                fromBuyNow: true,
              },
            });
          };
          fetchProduct();
        }
        localStorage.removeItem("recentBuyNow");
      } catch (error) {
        console.error("DEBUG: Error parsing recentBuyNow:", error);
        localStorage.removeItem("recentBuyNow");
      }
    }

    const pendingBuyNow = localStorage.getItem("pendingBuyNow");
    if (pendingBuyNow) {
      try {
        const buyNowData = JSON.parse(pendingBuyNow);
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
        } else if (product) {
          const selectedVariant = product.variants.find(
            (v: any) => v.size === size && v.color === color
          );
          if (!selectedVariant) {
            console.error(
              "DEBUG: Invalid variant in pendingBuyNow:",
              buyNowData
            );
            return;
          }
          const discountedPrice = Math.round(
            (selectedVariant.price ?? 0) *
              (1 - (selectedVariant.discountPercent ?? 0) / 100)
          );
          const cartItem = {
            id: product.id,
            name: product.name,
            originPrice: selectedVariant.price,
            price: discountedPrice,
            discountPercent: selectedVariant.discountPercent,
            image: product.images[0] || "",
            quantity,
            size,
            color,
            liked: false,
            selected: true,
            categoryId: product.categoryId,
            stock: selectedVariant.stock,
            fromBuyNow: true,
          };
          dispatch({ type: "add", item: cartItem });
        }
        localStorage.removeItem("pendingBuyNow");
      } catch (error) {
        console.error("DEBUG: Error parsing pendingBuyNow:", error);
        localStorage.removeItem("pendingBuyNow");
      }
    }
  }, [state.items, dispatch]);

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
      setIsLoading(false);
    } else if (user && !user.addresses) {
      setAddresses([]);
      setDefaultAddress(null);
      setSelectedAddress(null);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user, selectedAddress]);

  // Xử lý phí vận chuyển và tổng tiền
  useEffect(() => {
    let newShippingFee = shippingMethod === "standard" ? 25000 : 35000;

    if (subtotal >= 1000000) {
      if (shippingMethod === "standard") {
        newShippingFee = 0;
        if (!isFreeShipping) {
          toast.success(
            "Đơn hàng của bạn được miễn phí vận chuyển theo phương thức tiêu chuẩn!"
          );
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
            "Thiếu thông tin danh mục cho một số sản phẩm trong đơn hàng!"
          );
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
            `Áp dụng mã giảm giá ${response.data.code} thành công cho ${applicableItemIds.length} sản phẩm!`
          );
        } else {
          toast.error(response.message || "Mã giảm giá không hợp lệ!");
        }
      } catch (error) {
        console.error("DEBUG: Error applying coupon:", { error });
        toast.error("Có lỗi khi áp dụng mã giảm giá!");
      } finally {
        localStorage.removeItem("pendingCouponCode");
      }
    };

    applyCoupon();
  }, [subtotal, orderItems]);

  // Reset selected khi rời khỏi /checkout
  useEffect(() => {
    return () => {
      // Cleanup khi component unmount (rời khỏi /checkout)
      console.log("đã rời");
      orderItems.forEach((item) => {
        dispatch({
          type: "updateSelected",
          id: item.id,
          size: item.size,
          color: item.color,
          selected: false,
        });
      });
      localStorage.removeItem("recentBuyNow");
      localStorage.removeItem("pendingBuyNow");
    };
  }, []); // Không có dependency để chỉ chạy cleanup khi component unmount

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
      toast.success("Đã xóa mã giảm giá.");
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
          "Thiếu thông tin danh mục cho một số sản phẩm trong đơn hàng!"
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
      console.error("DEBUG: Error applying coupon:", { error });
      toast.error("Có lỗi khi áp dụng mã giảm giá!");
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
      toast.error("Vui lòng đăng nhập trước khi đặt hàng!");
      window.location.href = "/login";
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm!");
      window.location.href = "/cart";
      return;
    }

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
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
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
      const paymentInfo = {
        orderId: generateOrderId(),
        totalPrice: total,
        userId: user.id,
        email: formData.email,
        orderInfo: {
          shippingAddress: {
            street: formData.address,
            ward: formData.ward,
            province: formData.province,
            phone: formData.phone,
          },
          code: discountCode || null,
          items: orderItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            price: item.originPrice || item.price,
          })),
          paymentMethod,
          shipping: shippingFee,
        },
      };

      const paymentResponse = await initiatePayment(paymentInfo);
      if (paymentInfo.orderInfo.paymentMethod === "cod") {
        localStorage.setItem("pendingPaymentId", paymentResponse.paymentId);
        localStorage.setItem("pendingUserId", user.id);
        window.location.href = "/payment/success";
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
    availableCoupons,
  };
};
