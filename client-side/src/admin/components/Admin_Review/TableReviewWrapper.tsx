import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IReview } from "@/types/review";
import { updateReviewStatus } from "@/services/reviewApi";
import EditReviewModal from "./EditReviewModal";
import { toast } from "react-hot-toast";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Pagination } from "../ui/Panigation";

interface Props {
  reviews: IReview[];
  filter: string;
  search: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onUpdate: React.Dispatch<React.SetStateAction<IReview[]>>;
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  children?: (filtered: IReview[]) => React.ReactNode;
}

function SimpleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      className={`w-10 h-6 rounded-full transition relative focus:outline-none ${
        checked ? "bg-[#2563EB]" : "bg-gray-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`absolute left-0 top-0 transition-all duration-200 w-6 h-6 bg-white rounded-full shadow ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const statusMap = {
  approved: { text: "Đã duyệt", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  spam: { text: "Spam", color: "bg-[#FFF4E5] text-[#FF9900]" },
};

export default function TableReviewWrapper({
  reviews,
  filter,
  search,
  setFilter,
  setSearch,
  onUpdate,
  currentPage,
  totalPage,
  onPageChange,
  children,
}: Props) {
  const [reviewsState, setReviews] = useState<IReview[]>(reviews);
  const [isLoading, setIsLoading] = useState(false);
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmReviewId, setConfirmReviewId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<
    "approved" | "spam" | null
  >(null);

  // Ref to store dropdown refs for each review
  const dropdownRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    setReviews(reviews);
  }, [reviews]);

  const filteredReviews = reviewsState.filter((review) => {
    const content = review.content || "";
    return content.toLowerCase().includes(search.toLowerCase());
  });

  const handleEdit = (review: IReview) => {
    setSelectedReview(review);
    setShowModal(true);
    setActionDropdownId(null);
  };

  const onStatusChange = (reviewId: string, isApproved: boolean) => {
    const newStatus = isApproved ? "approved" : "spam";
    if (newStatus === "spam") {
      setConfirmReviewId(reviewId);
      setPendingStatus("spam");
    } else {
      // Duyệt không cần xác nhận
      updateStatus(reviewId, newStatus);
    }
  };

  const updateStatus = async (
    reviewId: string,
    status: "approved" | "spam"
  ) => {
    try {
      await toast.promise(updateReviewStatus(reviewId, status), {
        loading: "Đang cập nhật trạng thái...",
        success: "Cập nhật trạng thái thành công!",
        error: "Cập nhật trạng thái thất bại!",
      });
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status } : r))
      );
      onUpdate((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status } : r))
      );
    } catch (error) {
      // nothing
    }
  };

  return (
    <>
      <div className="space-y-4 mt-6">
        <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
          <table className="min-w-full table-fixed text-[16px] text-left font-description">
            <thead className="bg-[#F8FAFC] text-[#94A3B8]">
              <tr>
                <th className="w-[180px] px-2 h-[64px] align-middle rounded-tl-[12px] rounded-bl-[12px]">
                  Người gửi
                </th>
                <th className="w-[312px] px-2 h-[64px] align-middle">
                  Nội dung bình luận
                </th>
                <th className="w-[200px] px-2 h-[64px] align-middle">
                  Sản phẩm
                </th>
                <th className="w-[156px] px-2 h-[64px] align-middle">
                  Thời gian
                </th>
                <th className="w-[156px] px-2 h-[64px] align-middle">
                  Trạng thái
                </th>
                <th className="w-[56px] px-2 h-[64px] align-middle rounded-tr-[12px] rounded-br-[12px]">
                  <div className="flex items-center justify-end h-full">
                    <Image
                      src="/admin_user/dots.svg"
                      width={24}
                      height={24}
                      alt="three_dot"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => {
                const status = statusMap[review.status];
                return (
                  <tr
                    key={review._id}
                    className="border-b text-[#0F172A] h-[64px] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
                  >
                    {/* Người gửi */}
                    <td className="px-5 py-4 whitespace-nowrap overflow-hidden text-ellipsis align-middle">
                      {Array.isArray(review.userId)
                        ? review.userId.map((u: any) => u.name).join(", ")
                        : (review.userId as any)?.name}
                    </td>
                    {/* Nội dung bình luận */}
                    <td className="px-2 w-[330px] align-middle overflow-hidden">
                      <div className="line-clamp-2" title={review.content}>
                        {review.content}
                      </div>
                    </td>
                    {/* Sản phẩm */}
                    <td className="px-2 align-middle overflow-hidden">
                      <div
                        className="line-clamp-2"
                        title={
                          Array.isArray(review.productId)
                            ? review.productId
                                .map((p: any) => p.name)
                                .join(", ")
                            : typeof review.productId === "object" &&
                              review.productId !== null &&
                              "name" in review.productId
                            ? (review.productId as any).name
                            : ""
                        }
                      >
                        {Array.isArray(review.productId)
                          ? review.productId.map((p: any) => p.name).join(", ")
                          : typeof review.productId === "object" &&
                            review.productId !== null &&
                            "name" in review.productId
                          ? (review.productId as any).name
                          : ""}
                      </div>
                    </td>
                    {/* Thời gian */}
                    <td className="px-2 align-middle">
                      {new Date(review.createdAt).toLocaleString("vi-VN")}
                    </td>
                    {/* Trạng thái */}
                    <td className="px-5 py-4 align-middle">
                      <SimpleSwitch
                        checked={review.status === "approved"}
                        onChange={(value) => onStatusChange(review._id, value)}
                      />
                    </td>
                    {/* Hành động dropdown */}
                    <td className="w-[56px] px-2 h-[64px] align-middle rounded-tr-[12px] rounded-br-[12px] relative">
                      <div className="flex items-center justify-end h-[64px]">
                        <button
                          aria-label="Open actions menu"
                          className="focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionDropdownId(
                              actionDropdownId === review._id
                                ? null
                                : review._id
                            );
                          }}
                        >
                          <Image
                            src="/admin_user/dots.svg"
                            width={24}
                            height={24}
                            alt="Actions menu"
                          />
                        </button>
                        {actionDropdownId === review._id && (
                          <div
                            ref={(ref) => {
                              dropdownRefs.current.set(review._id, ref);
                            }}
                            className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                              onClick={() => handleEdit(review)}
                            >
                              Sửa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {totalPage > 1 && (
                <>
                  <tr>
                    <td colSpan={6} className="py-2">
                      <div className="w-full h-[1.5px] bg-gray-100 rounded"></div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="pt-4 pb-2">
                      <div className="flex justify-center">
                        <Pagination
                          currentPage={currentPage}
                          totalPage={totalPage}
                          onPageChange={onPageChange}
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          {showModal && selectedReview && (
            <EditReviewModal
              review={selectedReview}
              onClose={() => {
                setShowModal(false);
                setSelectedReview(null);
              }}
              onSave={(updatedReview) => {
                setReviews((prev) =>
                  prev.map((r) =>
                    r._id === updatedReview._id ? updatedReview : r
                  )
                );
                onUpdate((prev) =>
                  prev.map((r) =>
                    r._id === updatedReview._id ? updatedReview : r
                  )
                );
              }}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmReviewId}
        title="Bạn có chắc chắn muốn ẩn đánh giá này không?"
        onConfirm={async () => {
          if (confirmReviewId && pendingStatus) {
            await updateStatus(confirmReviewId, pendingStatus);
          }
          setConfirmReviewId(null);
          setPendingStatus(null);
        }}
        onCancel={() => {
          setConfirmReviewId(null);
          setPendingStatus(null);
        }}
      />
      {children && children(filteredReviews)}
    </>
  );
}
