"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { createReview } from "@/services/reviewApi";
import { IUser } from "@/types/auth";
import { IReview } from "@/types/review";
import { useValidOrderId } from "@/hooks/useValidOrderId";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewFormProps {
  productId: string;
  user: IUser | null;
  suggestedReviews: string[];
  onReviewSubmitted: (review: IReview) => void;
  onClose: () => void;
}

export default function ReviewForm({
  productId,
  user,
  suggestedReviews,
  onReviewSubmitted,
  onClose,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  const { orderId, loading: isCheckingOrder } = useValidOrderId(productId);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setImages(files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSuggestedClick = (suggestion: string) => {
    setReview((prev) => (prev ? `${prev} ${suggestion}` : suggestion));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    if (!review.trim() || rating === 0) {
      toast.error("Vui lòng nhập nội dung và chọn đánh giá!");
      return;
    }

    if (isCheckingOrder) {
      toast.error("Đang kiểm tra đơn hàng...");
      return;
    }

    if (!orderId) {
      toast.error("Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao hàng.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await createReview(
        productId,
        review.trim(),
        rating,
        orderId,
        images
      );

      if (response.success) {
        if (response.data?.status === "approved") {
          onReviewSubmitted(response.data);
          setReview("");
          setRating(0);
          setImages([]);
          toast.success(response.message);
          onClose();
        } else {
          toast.error(response.message || "Đánh giá bị đánh dấu là spam.");
        }
      } else {
        if (response.accountBlocked) {
          toast.error(response.message || "Tài khoản của bạn đã bị khóa.");
          setTimeout(() => {
            logout();
          }, 1000);
          return;
        }
        toast.error(response.message || "Không thể gửi đánh giá.");
      }
    } catch (error: any) {
      if (error.accountBlocked) {
        toast.error(error.message || "Tài khoản của bạn đã bị khóa.");
        setTimeout(() => {
          logout();
        }, 1000);
        return;
      }
      toast.error(error.message || "Không thể gửi đánh giá.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="border-gray-400 border border-solid rounded-md bg-white w-full px-5 py-4"
    >
      <label className="block text-base font-bold text-black mb-2">
        Gửi phiếu đánh giá của bạn!
      </label>

      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20}
            fill={
              hoverRating !== null
                ? i < hoverRating
                  ? "black"
                  : "none"
                : i < rating
                ? "black"
                : "none"
            }
            stroke="black"
            className="cursor-pointer transition"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(null)}
          />
        ))}
      </div>

      <div className="mb-3">
        <label className="block text-sm font-bold text-black mb-1">
          Nội dung:
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={4}
          placeholder="Viết đánh giá của bạn..."
        />
      </div>

      {suggestedReviews?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {suggestedReviews.map((text, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestedClick(text)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-md border"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-bold text-black mb-1">
          Hình ảnh (tối đa 3):
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            id="review-images"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="review-images"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-md cursor-pointer hover:bg-gray-100 border text-black"
          >
            <Upload size={16} />
            <span>Chọn ảnh</span>
          </label>
          <span className="text-sm text-gray-500">
            {images.length} ảnh đã chọn
          </span>
        </div>
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
      </div>

      <button
        type="submit"
        disabled={isLoading || isCheckingOrder}
        className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}
