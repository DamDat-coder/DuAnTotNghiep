"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { IReview } from "@/types/review";

interface EditReviewModalProps {
  review: IReview;
  onClose: () => void;
  onSave?: (updated: IReview) => void;
}

export default function EditReviewModal({
  review,
  onClose,
  onSave,
}: EditReviewModalProps) {
  const [status, setStatus] = useState<"approved" | "spam">(review.status);

  // Kiểm tra có thay đổi status không
  const isChanged = useMemo(
    () => status !== review.status,
    [status, review.status]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave && isChanged) {
      onSave({ ...review, status });
    }
    onClose();
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
            <h2 className="text-lg font-bold">
              Chi tiết & cập nhật trạng thái
            </h2>
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
              <label className="block font-bold mb-2">Ngày tạo</label>
              <input
                type="text"
                value={new Date(review.createdAt).toLocaleString("vi-VN")}
                disabled
                className="w-full px-4 h-[40px] border border-[#E2E8F0] rounded-[12px] bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="mb-8">
              <label className="block font-bold mb-2">
                Trạng thái<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "approved" | "spam")
                }
                className="w-full h-[40px] px-4 border border-[#E2E8F0] rounded-[12px] appearance-none"
                required
              >
                <option value="approved">Đã duyệt</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <button
              type="submit"
              className={`w-full bg-black text-white h-[48px] rounded-lg font-semibold hover:opacity-90 mt-4 ${
                !isChanged ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isChanged}
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
