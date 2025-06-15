import React from "react";
import Image from "next/image";

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPage,
  onPageChange,
}) => {
  // Tạo ra list trang dạng: [1, 2, 3, ..., last]
  const pages: (number | string)[] = [];
  if (totalPage <= 5) {
    for (let i = 1; i <= totalPage; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPage - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPage - 2) pages.push("...");
    pages.push(totalPage);
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={currentPage === 1}
        className="w-12 h-12 rounded-[12px] border border-[#E6E8EC] bg-white flex items-center justify-center text-xl font-semibold hover:bg-[#f2f7fb] transition disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Image
          src="/admin/pagination/chevron-left.svg"
          width={24}
          height={24}
          alt="Left arrow"
        />
      </button>
      {pages.map((p, idx) =>
        typeof p === "number" ? (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-12 h-12 rounded-[12px] border border-[#E6E8EC] flex items-center justify-center text-[18px] font-bold
            ${
              currentPage === p
                ? "bg-[#F1F8FF] text-[#2563eb] border-[#9dc7ec]"
                : "bg-white text-[#687385] hover:bg-[#f2f7fb]"
            }`}
          >
            {p}
          </button>
        ) : (
          <span
            key={`dot-${idx}`}
            className="w-12 h-12 flex items-center justify-center text-[#B8B8B8] text-xl select-none"
          >
            ...
          </span>
        )
      )}
      <button
        disabled={currentPage === totalPage}
        className="w-12 h-12 rounded-[12px] border border-[#E6E8EC] bg-white flex items-center justify-center text-xl font-semibold hover:bg-[#f2f7fb] transition disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <Image
          src="/admin/pagination/chevron-right.svg"
          width={24}
          height={24}
          alt="Right arrow"
        />
      </button>
    </div>
  );
};
