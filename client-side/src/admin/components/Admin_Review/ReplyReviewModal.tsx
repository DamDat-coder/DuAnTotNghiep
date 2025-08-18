"use client";

import { useState } from "react";
import Image from "next/image";
import { IReview } from "@/types/review";
import { replyToReview } from "@/services/reviewApi";
import { toast } from "react-hot-toast";

interface ReplyReviewModalProps {
  review: IReview;
  onClose: () => void;
  onSave: (updated: IReview) => void;
}

export default function ReplyReviewModal({
  review,
  onClose,
  onSave,
}: ReplyReviewModalProps) {
  const [replyContent, setReplyContent] = useState(
    review.adminReply?.content || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await toast.promise(
        replyToReview(review._id, replyContent.trim()),
        {
          loading: "Đang gửi câu trả lời...",
          success: "Gửi câu trả lời thành công!",
          error: "Gửi câu trả lời thất bại!",
        }
      );
      if (response.success && response.data) {
        onSave(response.data);
        onClose();
      }
    } catch (error) {
      // Error handled by toast
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy tên user và tên sản phẩm
  const userName = Array.isArray(review.userId)
    ? review.userId.map((u: any) => u.name).join(", ")
    : (review.userId as any)?.name || "";
  const productName = Array.isArray(review.productId)
    ? review.productId.map((p: any) => p.name).join(", ")
    : (review.productId as any)?.name || "";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-[16px] shadow-xl w-[480px] max-w-full max-h-[90vh] overflow-y-auto pb-10 relative scroll-hidden">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px] mb-3">
            <h2 className="text-lg font-bold">Trả lời đánh giá</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#F8FAFC] rounded-[8px] flex items-center justify-center"
            >
              <Image
                src="https://res.cloudinary.com/testupload1/image/upload/v1755272889/group_wnydzc.svg"
                width={10}
                height={10}
                alt="close"
              />
            </button>
          </div>
        </div>
        <div className="w-full h-px bg-[#E7E7E7]" />
        {/* Form */}
        <div className="pl-6 pr-6">
          <form className="text-sm" onSubmit={handleSubmit}>
            <div className="mt-3 mb-4">
              <label className="block font-bold mb-2">Người gửi</label>
              <input
                type="text"
                value={userName}
                disabled
                className="w-full px-4 h-[40px] border border-[#E2E8F0] rounded-[12px] bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">Sản phẩm</label>
              <div
                className="w-full px-4 min-h-[60px] border border-[#E2E8F0] rounded-[12px] bg-gray-100 cursor-not-allowed flex items-center"
                style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}
              >
                {productName}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">Nội dung đánh giá</label>
              <div className="w-full min-h-[80px] px-4 py-3 border border-[#E2E8F0] rounded-[12px] bg-gray-100 whitespace-pre-line">
                {review.content}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">Điểm đánh giá</label>
              <input
                type="number"
                value={review.rating}
                disabled
                className="w-full px-4 h-[40px] border border-[#E2E8F0] rounded-[12px] bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">Ảnh đánh giá</label>
              <div className="flex gap-2 flex-wrap">
                {review.images && review.images.length > 0 ? (
                  review.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`review-img-${idx}`}
                      width={60}
                      height={60}
                      className="rounded-lg border object-cover"
                    />
                  ))
                ) : (
                  <span className="text-gray-400">Không có ảnh</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">
                Câu trả lời<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-[12px] min-h-[100px]"
                placeholder="Nhập câu trả lời của bạn..."
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-black text-white h-[48px] rounded-lg font-semibold hover:opacity-90 mt-4 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi trả lời"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}