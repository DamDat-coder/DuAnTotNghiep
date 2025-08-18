"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { IProduct } from "@/types/product";
import { IUser } from "@/types/auth";
import { fetchProductReviews } from "@/services/reviewApi";
import toast from "react-hot-toast";
import ReviewForm from "./ReviewForm";
import { IReview } from "@/types/review";

interface ProductDetailsSectionProps {
  product: IProduct;
}

export default function ProductDetailsSection({
  product,
}: ProductDetailsSectionProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("");
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const suggestedReviews = [
    "Chất lượng tuyệt vời!",
    "Rất đáng tiền.",
    "Sản phẩm tốt, giao hàng nhanh.",
    "Cần cải thiện chất lượng.",
    "Hài lòng với trải nghiệm mua sắm.",
  ];

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const fetchedReviews = await fetchProductReviews(product.id);
        setReviews(fetchedReviews);
      } catch (error) {
        toast.error("Không thể tải đánh giá.");
      }
    };
    loadReviews();
  }, [product.id]);

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  const handleReviewSubmitted = (review: IReview) => {
    setReviews((prev) => [...prev, review]);
    setIsReviewFormOpen(false);
  };

  return (
    <div className="border-t-2 border-[#B0B0B0] border-solid laptop:mt-16 desktop:mt-16 desktop:w-[80%] desktop:mx-auto laptop:w-[80%] laptop:mx-auto">
      {/* Chi tiết sản phẩm */}
      <div className="border-b-2 border-[#B0B0B0] border-solid">
        <a
          href="#"
          className="w-full flex items-center justify-between no-underline hover:underline focus:no-underline py-4"
          onClick={(e) => {
            e.preventDefault();
            handleSectionClick("product_details");
          }}
        >
          <p className="text-base font-semibold">Chi tiết sản phẩm</p>
          <motion.img
            src="/nav/footer_down.svg"
            alt="Dropdown"
            className="h-4 w-auto"
            animate={{ rotate: activeSection === "product_details" ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </a>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: activeSection === "product_details" ? "auto" : 0,
            opacity: activeSection === "product_details" ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0]"
        >
          <p className="pb-4">
            {product.description || "Chưa có mô tả sản phẩm."}
          </p>
        </motion.div>
      </div>

      {/* Kích thước */}
      <div className="border-b-2 border-[#B0B0B0] border-solid">
        <a
          href="#"
          className="w-full flex items-center justify-between no-underline hover:underline focus:no-underline py-4"
          onClick={(e) => {
            e.preventDefault();
            handleSectionClick("size_chart");
          }}
        >
          <p className="text-base font-semibold">Kích thước</p>
          <motion.img
            src="/nav/footer_down.svg"
            alt="Dropdown"
            className="h-4 w-auto"
            animate={{ rotate: activeSection === "size_chart" ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </a>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: activeSection === "size_chart" ? "auto" : 0,
            opacity: activeSection === "size_chart" ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0]"
        >
          <div className="pb-4">
            <Image
              src="/product/product_size_table.png"
              alt="Bảng kích thước"
              width={300}
              height={200}
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Đánh giá */}
      <div className="border-b-2 border-[#B0B0B0] border-solid">
        <a
          href="#"
          className="w-full flex items-center justify-between no-underline hover:underline focus:no-underline py-4"
          onClick={(e) => {
            e.preventDefault();
            handleSectionClick("reviews");
          }}
        >
          <div className="flex justify-between items-center w-full text-base font-semibold">
            <span>Đánh giá</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={
                      i < Math.floor(parseFloat(averageRating))
                        ? "black"
                        : "none"
                    }
                    stroke="black"
                  />
                ))}
              </div>
              <span>
                {averageRating} ({reviews.length} đánh giá)
              </span>
              <motion.img
                src="/nav/footer_down.svg"
                alt="Dropdown"
                className="h-4 w-auto"
                animate={{ rotate: activeSection === "reviews" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </a>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: activeSection === "reviews" ? "auto" : 0,
            opacity: activeSection === "reviews" ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0]"
        >
          <div className="space-y-4 pb-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="text-sm text-[#B0B0B0]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-black">
                      {review.userId.name || "Người dùng"} -{" "}
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? "black" : "none"}
                          stroke="black"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="line-clamp-3">{review.content}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, index) => (
                        <Image
                          key={index}
                          src={img}
                          alt={`Hình ảnh đánh giá ${index + 1}`}
                          width={100}
                          height={100}
                          className="object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                  {/* Hiển thị câu trả lời của Admin nếu có nội dung */}
                  {review.adminReply && review.adminReply.content && (
                    <div className="mt-2 p-3 bg-gray-100 rounded-md">
                      <p className="text-sm font-bold text-black">
                        Admin trả lời:
                      </p>
                      <p className="text-sm text-gray-700">
                        {review.adminReply.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          review.adminReply.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Chưa có đánh giá nào.</p>
            )}
            {user && (
              <>
                <button
                  className="bg-black text-white px-4 py-2 rounded-md mt-4"
                  onClick={() => setIsReviewFormOpen(true)}
                >
                  Viết đánh giá
                </button>
                {isReviewFormOpen && (
                  <ReviewForm
                    productId={product.id}
                    user={user}
                    suggestedReviews={suggestedReviews}
                    onReviewSubmitted={handleReviewSubmitted}
                    onClose={() => setIsReviewFormOpen(false)}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}