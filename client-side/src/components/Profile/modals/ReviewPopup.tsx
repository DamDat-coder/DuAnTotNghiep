// components/ReviewPopup.tsx
"use client";
import { Star, Upload } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface IReview {
  content: string;
  rating: number;
  images?: string[];
}

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: string, rating: number, images: File[]) => void;
  suggestedReviews: string[];
  isSubmitting?: boolean; // thêm prop này
  hasReviewed?: boolean;
  reviewData?: IReview;
}

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedReviews,
  isSubmitting = false, // default
  hasReviewed,
  reviewData,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      let newImages = [...images, ...files];
      if (newImages.length > 3) {
        toast.error("Chỉ được chọn tối đa 3 ảnh!");
        newImages = newImages.slice(0, 3);
      }
      setImages(newImages);
    }
  };

  // Ngăn scroll khi mở popup
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (hasReviewed && reviewData) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-md w-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Bạn đã đánh giá sản phẩm này!
          </h2>
          <div className="mb-4">
            <div className="flex gap-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={26}
                  fill={i < reviewData.rating ? "black" : "none"}
                  stroke="black"
                  className="cursor-pointer transition-colors duration-200"
                />
              ))}
            </div>
            <div className="mt-2 text-center">{reviewData.content}</div>
          </div>

          {reviewData.images && reviewData.images.length > 0 && (
            <div className="flex gap-2 mb-4">
              {reviewData.images.map((image, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded overflow-hidden border border-gray-200"
                >
                  <Image
                    src={image}
                    alt={`Ảnh đánh giá ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Nút Đóng */}
          <div className="flex justify-center mt-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Viết đánh giá
        </h2>

        {/* Đánh giá sao */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={26}
              fill={
                (hoverRating !== null ? i < hoverRating : i < rating)
                  ? "black"
                  : "none"
              }
              stroke="black"
              className="cursor-pointer transition-colors duration-200 hover:fill-black"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(null)}
            />
          ))}
        </div>

        {/* Nhập nhận xét */}
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows={4}
          placeholder="Nhập nhận xét của bạn..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

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
            {images.length} ảnh đã chọn
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 mb-4">
          * Chỉ được chọn tối đa 3 ảnh
        </p>
        {images.length > 0 && (
          <div className="flex gap-2 mt-2 mb-4">
            {images.map((file, idx) => (
              <div
                key={idx}
                className="relative w-16 h-16 rounded overflow-hidden border border-gray-200"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Ảnh ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-0 bg-black bg-opacity-60 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  onClick={() => {
                    setImages((prev) => prev.filter((_, i) => i !== idx));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Gợi ý nhận xét */}
        <div className="mb-4">
          <h3 className="font-semibold">Gợi ý nhận xét:</h3>
          <Swiper
            modules={[FreeMode, Mousewheel]}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode={{
              enabled: true,
              momentumRatio: 0.8,
              momentumVelocityRatio: 0.6,
            }}
            mousewheel={{
              enabled: true,
              sensitivity: 1,
            }}
            speed={600}
            loop={false}
            grabCursor={true}
            slidesOffsetBefore={4}
            slidesOffsetAfter={4}
            className="mt-2 select-none"
          >
            {suggestedReviews.map((suggestion, index) => (
              <SwiperSlide
                key={index}
                style={{ width: "auto", flex: "0 0 auto" }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 cursor-pointer transition duration-200 whitespace-nowrap"
                  onClick={() => setReview(suggestion)}
                >
                  {suggestion}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Nút Hủy và Gửi */}
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded-md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded-md flex items-center justify-center min-w-[110px]"
            onClick={() => {
              onSubmit(review, rating, images);
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
