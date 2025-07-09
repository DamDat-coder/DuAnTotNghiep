"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { IProduct } from "@/types/product";
import { fetchProductReviews, createReview } from "@/services/reviewApi";
import toast from "react-hot-toast";

interface ProductDetailsSectionProps {
  product: IProduct;
}

interface Review {
  _id: string;
  userId: { _id: string; name: string };
  content: string;
  rating: number;
  images?: string[];
  createdAt: string;
}

export default function ProductDetailsSection({
  product,
}: ProductDetailsSectionProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ content: "", rating: 0 });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tính điểm đánh giá trung bình
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  // Lấy danh sách đánh giá khi component mount
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
    setActiveSection(activeSection === section ? null : section);
  };

  // Xử lý thay đổi rating
  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  // Xử lý upload ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // Giới hạn 3 ảnh
      setReviewImages(files);
    }
  };

  // Xử lý gửi đánh giá
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    if (!newReview.content || newReview.rating === 0) {
      toast.error("Vui lòng nhập nội dung và chọn đánh giá!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createReview(
        product.id,
        newReview.content,
        newReview.rating,
        reviewImages
      );

      if (response.success) {
        setReviews((prev) => [...prev, response.data!]);
        setNewReview({ content: "", rating: 0 });
        setReviewImages([]);
        toast.success(response.message);
        if (response.warning) {
          toast(response.warning, { icon: "⚠️" });
        }
      } else {
        toast.error(response.message || "Không thể gửi đánh giá.");
      }
    } catch (error: any) {
      const message =
        error?.message ||
        (typeof error === "string" ? error : null) ||
        "Không thể gửi đánh giá.";

      // Nếu muốn xử lý riêng lỗi 403, có thể thêm:
      if (error?.status === 403) {
        toast(message, { icon: "⚠️" });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      id: "product_details",
      title: "Chi tiết sản phẩm",
      content: [product.description || "Chưa có mô tả sản phẩm."],
    },
    {
      id: "size_chart",
      title: "Kích thước",
      content: [
        <Image
          key="size_chart_img"
          src="/product/product_size_table.png"
          alt="Bảng kích thước"
          width={300}
          height={200}
        />,
      ],
    },
    {
      id: "reviews",
      title: (
        <div className="flex justify-between items-center w-full text-base font-semibold">
          <span>Đánh giá</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={
                    i < Math.floor(parseFloat(averageRating)) ? "black" : "none"
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
      ),
      content: [
        <div key="review_section" className="space-y-4">
          {/* Danh sách đánh giá */}
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="text-sm text-[#B0B0B0]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black">
                    {review.userId.name} -{" "}
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
                        alt={`Review image ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Chưa có đánh giá nào.</p>
          )}
          {/* Form gửi đánh giá */}
          {user && (
            <form
              onSubmit={handleSubmitReview}
              className="space-y-4 border-gray-400 border border-solid px-4 py-3"
            >
              <label className="block text-base font-bold text-black ">
                Gửi phiếu đánh giá của bạn! :
              </label>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < newReview.rating ? "black" : "none"}
                      stroke="black"
                      className="cursor-pointer"
                      onClick={() => handleRatingChange(i + 1)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-black ">
                  Nội dung:
                </label>
                <textarea
                  value={newReview.content}
                  onChange={(e) =>
                    setNewReview((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Viết đánh giá của bạn..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black ">
                  Hình ảnh (tối đa 3):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="review-images"
                  />
                  <label
                    htmlFor="review-images"
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-md cursor-pointer hover:bg-gray-100 text-black"
                  >
                    <Upload size={16} />
                    <span>Chọn ảnh</span>
                  </label>
                  <span className="text-sm text-gray-500">
                    {reviewImages.length} ảnh đã chọn
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          )}
        </div>,
      ],
    },
  ];

  return (
    <div className="border-t-2 border-[#B0B0B0] border-solid laptop:mt-16 desktop:mt-16 desktop:w-[80%] desktop:mx-auto laptop:w-[80%] laptop:mx-auto">
      {sections.map(({ id, title, content }) => (
        <div key={id} className="border-b-2 border-[#B0B0B0] border-solid">
          <a
            href="#"
            className="w-full flex items-center justify-between no-underline hover:underline focus:no-underline py-4"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick(id);
            }}
          >
            {id === "reviews" ? (
              title
            ) : (
              <>
                <p className="text-base font-semibold">{title}</p>
                <motion.img
                  src="/nav/footer_down.svg"
                  alt="Dropdown"
                  className="h-4 w-auto"
                  animate={{ rotate: activeSection === id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}
          </a>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: activeSection === id ? "auto" : 0,
              opacity: activeSection === id ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0] space-y-1"
          >
            {content.map((item, index) =>
              typeof item === "string" ? (
                <p key={index} className="pb-4">
                  {item}
                </p>
              ) : (
                <div key={index} className="pb-4">
                  {item}
                </div>
              )
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
