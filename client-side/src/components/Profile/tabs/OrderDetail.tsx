"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderDetail } from "@/types/order";
import { fetchUser } from "@/services/userApi";
import { IProduct } from "@/types/product";
import { fetchProductById } from "@/services/productApi";
import ReviewPopup from "../modals/ReviewPopup";
import { createReview, fetchProductOrderReviews } from "@/services/reviewApi";
import toast from "react-hot-toast";
import { suggestedReviews } from "@/constants/suggestedReviews";
import type { IReview } from "@/types/review";

// Định nghĩa kiểu User để tránh dùng any
interface User {
  _id: string;
  name: string;
  [key: string]: any; // Cho phép các thuộc tính khác
}

interface OrderDetailProps {
  order: OrderDetail;
  setActiveTab?: (tab: string) => void;
}

export default function OrderDetail({ order, setActiveTab }: OrderDetailProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<
    (IProduct & {
      _id: string;
      quantity: number;
      image: string;
      price: number;
    })[]
  >([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productReviews, setProductReviews] = useState<
    Record<string, IReview[]>
  >({});
  const router = useRouter();

  // Hàm logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Lấy thông tin người dùng
  useEffect(() => {
    async function fetchUserData() {
      try {
        const fetchedUser = await fetchUser();
        if (fetchedUser) {
          setUser({
            ...fetchedUser,
            _id: fetchedUser.id, // chuyển id thành _id
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Lỗi khi fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, []);

  // Lấy thông tin sản phẩm từ đơn hàng
  useEffect(() => {
    async function fetchOrderProducts() {
      try {
        const fetchedProducts = await Promise.all(
          order.items.map(async (item) => {
            const product = await fetchProductById(item.productId);
            return product
              ? {
                  ...product,
                  _id: item.productId,
                  quantity: item.quantity,
                  image: item.image ?? product.images?.[0] ?? "",
                  price: item.price,
                }
              : null;
          })
        );
        setProducts(
          fetchedProducts.filter(
            (
              p
            ): p is IProduct & {
              _id: string;
              quantity: number;
              image: string;
              price: number;
            } => p !== null
          )
        );
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    }
    if (order.items.length > 0) {
      fetchOrderProducts();
    }
  }, [order.items]);

  // Fetch review cho từng sản phẩm khi products hoặc user thay đổi
  useEffect(() => {
    if (products.length === 0 || !user?._id) return;
    async function fetchAllProductReviews() {
      if (!user || !user._id) return;
      const reviewsObj: Record<string, IReview[]> = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const reviews = await fetchProductOrderReviews(
              product._id,
              user?._id
            );
            reviewsObj[product._id] = reviews;
          } catch (error) {
            console.error(
              `Lỗi fetch đánh giá cho sản phẩm ${product._id}:`,
              error
            );
            reviewsObj[product._id] = [];
          }
        })
      );
      setProductReviews(reviewsObj);
    }
    fetchAllProductReviews();
  }, [products, user?._id]);

  // Hàm lấy phương thức thanh toán
  const getPaymentMethod = (method: OrderDetail["paymentMethod"]) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "vnpay":
        return "VNPAY";
      case "momo":
        return "MOMO";
      case "zalopay":
        return "ZALO PAY";
      default:
        return "Phương thức thanh toán chưa cập nhật";
    }
  };

  // Hàm lấy trạng thái đơn hàng
  const getStatusLabel = (status: OrderDetail["status"]) => {
    switch (status) {
      case "pending":
        return "CHỜ XÁC NHẬN";
      case "confirmed":
        return "ĐANG XỬ LÝ";
      case "shipping":
        return "ĐANG GIAO";
      case "delivered":
        return "ĐÃ HOÀN THÀNH";
      case "cancelled":
        return "ĐÃ HỦY";
      default:
        return String(status).toUpperCase();
    }
  };

  // Tính tổng giá trị sản phẩm trong đơn hàng
  const calculateSubtotal = () => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Kiểm tra đã đánh giá
  const hasProductReviewed = (productId: string) => {
    const reviews = productReviews[productId] || [];
    return reviews.some((review) => {
      const reviewUserId =
        typeof review.userId === "string" ? review.userId : review.userId?._id;
      return (
        reviewUserId === user?._id &&
        (typeof review.orderId === "string"
          ? review.orderId === order._id
          : review.orderId?._id === order._id) // So sánh đúng kiểu dữ liệu
      );
    });
  };

  // Hàm mở popup đánh giá
  const handleOpenReview = (productId: string) => {
    setReviewProductId(productId);
    setIsPopupOpen(true);
  };

  // Hàm xử lý gửi đánh giá
  const handleSubmitReview = async (
    review: string,
    rating: number,
    images: File[]
  ) => {
    const errors: string[] = [];
    if (!review) errors.push("Vui lòng nhập nội dung đánh giá");
    if (rating === 0) errors.push("Vui lòng chọn số sao đánh giá");
    if (errors.length > 0) {
      toast.error(errors.join(" và ") + "!");
      return;
    }
    if (!reviewProductId) return;
    setIsSubmitting(true);
    try {
      const res = await createReview(
        reviewProductId,
        review,
        rating,
        order._id,
        images
      );
      if (res.success && !res.warning) {
        toast.success(res.message);
        const reviews = await fetchProductOrderReviews(
          reviewProductId,
          user!._id
        );
        console.log("Đánh giá đã gửi thành công:", reviews);
        setProductReviews((prev) => ({
          ...prev,
          [reviewProductId]: reviews,
        }));
        setIsPopupOpen(false);
        setReviewProductId(null);
      } else if (res.accountBlocked) {
        toast.error("Tài khoản của bạn đã bị khóa do vi phạm chính sách spam!");
        setIsPopupOpen(false);
        setReviewProductId(null);
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else if (res.warning) {
        toast.error(
          res.warning ||
            "Nội dung đánh giá bị đánh dấu spam, không được hiển thị!"
        );
        setIsPopupOpen(false);
        setReviewProductId(null);
      } else {
        toast.error(res.message || "Không thể gửi đánh giá.");
        setIsPopupOpen(false);
        setReviewProductId(null);
      }
    } catch (err: any) {
      if (err.accountBlocked) {
        toast.error("Tài khoản của bạn đã bị khóa do vi phạm chính sách spam!");
        setIsPopupOpen(false);
        setReviewProductId(null);
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        console.error("Lỗi khi gửi đánh giá:", err);
        toast.error(err?.message || "Không thể gửi đánh giá.");
        setIsPopupOpen(false);
        setReviewProductId(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Không thể tìm thấy thông tin người dùng!
      </div>
    );
  }

  // Lấy review của user cho sản phẩm đang mở popup
  const userReview =
    reviewProductId && productReviews[reviewProductId] && user
      ? productReviews[reviewProductId].find((r) => {
          const reviewUserId =
            typeof r.userId === "string" ? r.userId : r.userId?._id;
          // So sánh cả userId, productId và orderId
          return (
            reviewUserId === user._id &&
            (typeof r.orderId === "string"
              ? r.orderId === order._id
              : r.orderId?._id === order._id)
          );
        })
      : undefined;
  console.log("User Review:", userReview);

  return (
    <>
      <div className="w-[894px] mobile:w-full mx-auto space-y-5 mobile:space-y-3 px-0 mobile:px-2">
        <h1 className="text-xl mobile:text-lg font-bold border-b pb-2">
          ĐƠN HÀNG
        </h1>
        <div className="flex justify-between items-center text-sm mobile:flex-col mobile:items-start mobile:gap-2">
          <button
            onClick={() => setActiveTab?.("Đơn hàng")}
            className="flex items-center gap-2 text-gray-600 font-medium"
          >
            <Image src="/profile/Back.svg" alt="back" width={6} height={10} />
            TRỞ LẠI
          </button>
          <div className="flex items-center gap-2 font-medium mobile:flex-col mobile:items-start mobile:gap-0">
            <span className="mobile:text-sm">
              MÃ ĐƠN HÀNG: {order.orderCode || order._id}
            </span>
            <span className="mobile:hidden">|</span>
            <span className="mobile:text-sm">
              ĐƠN HÀNG {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-6 mobile:space-y-3">
          {products.map((product, index) => {
            const isReviewed = hasProductReviewed(product._id);
            return (
              <div
                key={index}
                className="flex items-center gap-8 w-full mobile:gap-3 mobile:flex-row"
              >
                <div className="w-[94px] h-[94px] mobile:w-[100px] mobile:h-[100px] relative">
                  <Image
                    src={product.images[0]}
                    alt={product.name || "Sản phẩm"}
                    fill
                    className="object-cover rounded"
                    sizes="64px"
                  />
                </div>
                <div className="flex w-full flex-col gap-1">
                  <p className="font-semibold mobile:text-base">
                    {product.name || "Sản phẩm không tên"}
                  </p>
                  <p className="text-sm text-gray-600">
                    SL: {product.quantity}{" "}
                    <span className="ml-4">
                      {Array.isArray(product.variants)
                        ? (product.variants[0] as { color?: string })?.color ||
                          "Chưa xác định"
                        : (product.variants as { color?: string } | undefined)
                            ?.color || "Chưa xác định"}{" "}
                      /{" "}
                      {Array.isArray(product.variants)
                        ? (product.variants[0] as { size?: string })?.size ||
                          "Chưa xác định"
                        : (product.variants as { size?: string } | undefined)
                            ?.size || "Chưa xác định"}
                    </span>
                  </p>
                  {order.status === "delivered" ? (
                    <div className="flex justify-between items-center mt-1 mobile:justify-between mobile:gap-2">
                      <div className="text-[#FF0000] font-semibold text-base">
                        {(product.price * product.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </div>
                      <button
                        onClick={() => handleOpenReview(product._id)}
                        className={`px-4 py-2 rounded-md mobile:px-3 mobile:py-1 mobile:text-sm ${
                          isReviewed
                            ? "bg-gray-400 text-white opacity-50 cursor-default"
                            : "bg-black text-white"
                        }`}
                      >
                        {isReviewed ? "Đã đánh giá" : "Đánh giá"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-[#FF0000] font-semibold text-base mt-1">
                      {(product.price * product.quantity).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Địa chỉ nhận hàng */}
        <div className="text-base mb-6 mobile:text-sm">
          <h2 className="text-[20px] mobile:text-base font-bold mb-[24px] mobile:mb-2">
            ĐỊA CHỈ NHẬN HÀNG
          </h2>
          <div className="flex justify-between items-start gap-[18px] mobile:flex-col mobile:gap-2">
            <div className="w-[679px] mobile:w-full space-y-[12px] leading-relaxed">
              <p>
                <strong>Tên người nhận:</strong> {user.name || "Chưa cập nhật"}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {order.shippingAddress?.phone || "Chưa cập nhật"}
              </p>
              <p>
                <strong>Địa chỉ nhận hàng:</strong>{" "}
                {order.shippingAddress?.street || ""},{" "}
                {order.shippingAddress?.ward || ""},{" "}
                {order.shippingAddress?.province || ""}
              </p>
              <p>
                <strong>Phương thức thanh toán:</strong>{" "}
                <span className="uppercase">
                  {getPaymentMethod(order.paymentMethod)}
                </span>
              </p>
              {order.note && (
                <p>
                  <strong>Ghi chú:</strong> {order.note}
                </p>
              )}
            </div>
            <div className="text-right whitespace-nowrap font-medium self-center mobile:text-left mobile:mt-2">
              Giao Hàng Nhanh
            </div>
          </div>
        </div>

        {/* Bảng tổng kết */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-base text-black bg-[#F8FAFC] rounded overflow-hidden mobile:text-sm">
            <thead>
              <tr className="text-gray-500 text-[16px] h-[64px] mobile:text-xs mobile:h-[40px]">
                <th className="w-[223.5px] text-center align-middle">
                  Tổng giá sản phẩm
                </th>
                <th className="w-[223.5px] text-center align-middle">
                  Tiền ship
                </th>
                <th className="w-[223.5px] text-center align-middle">
                  Giảm giá
                </th>
                <th className="w-[223.5px] text-center align-middle text-black">
                  Tổng tiền
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-[64px] text-[15px] font-medium mobile:text-xs mobile:h-[40px]">
                <td className="text-center align-middle">
                  {order.items
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                    .toLocaleString("vi-VN")}
                  ₫
                </td>
                <td className="text-center align-middle">
                  {order.shipping.toLocaleString("vi-VN")}₫
                </td>
                <td className="text-center align-middle">
                  - {order.discountAmount.toLocaleString("vi-VN")}₫
                </td>
                <td className="text-center align-middle font-semibold">
                  {order.totalPrice.toLocaleString("vi-VN")}₫
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ReviewPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setReviewProductId(null);
        }}
        onSubmit={handleSubmitReview}
        suggestedReviews={suggestedReviews}
        isSubmitting={isSubmitting}
        hasReviewed={!!userReview}
        reviewData={userReview}
        key={reviewProductId || "review-popup"}
      />
    </>
  );
}
