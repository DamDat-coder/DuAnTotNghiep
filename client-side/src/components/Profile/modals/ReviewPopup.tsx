// components/ReviewPopup.tsx
"use client";
import { Star, Upload } from "lucide-react";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import Image from "next/image";

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: string, rating: number, images: File[]) => void;
  suggestedReviews: string[];
}

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedReviews,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setImages(files);
    }
  };

  if (!isOpen) return null;

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
          >
            Hủy
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => {
              onSubmit(review, rating, images);
            }}
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
