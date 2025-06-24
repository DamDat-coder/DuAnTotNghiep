import { Comment } from "@/types/comment";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const statusMap = {
  published: { text: "Đã đăng", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  spam: { text: "Spam", color: "bg-[#FFF4E5] text-[#FF9900]" },
  deleted: { text: "Xóa", color: "bg-[#FDECEA] text-[#D93025]" },
};

export default function CommentTableBody({
  comments,
}: {
  comments: Comment[];
}) {
  const [actionDropdownId, setActionDropdownId] = useState<number | null>(null);

  const dropdownRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const isClickInsideDropdown = Array.from(
        dropdownRefs.current.values()
      ).some((ref) => ref && ref.contains(event.target as Node));

      if (!isClickInsideDropdown) {
        setActionDropdownId(null);
      }
    };

    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {comments.map((comment) => {
        const status = statusMap[comment.status];

        return (
          <tr
            key={comment.id}
            className="border-b text-[#0F172A] h-[64px] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            {/* Người gửi */}
            <td className="px-2 max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis align-middle">
              {comment.author}
            </td>

            {/* Nội dung bình luận (2 dòng, có ...) */}
            <td className="px-2 w-[330px] align-middle overflow-hidden text-ellipsis line-clamp-2">
              <div className="line-clamp-2">{comment.content}</div>
            </td>

            {/* Sản phẩm / Bài viết */}
            <td className="px-2 align-middle">{comment.product}</td>

            {/* Thời gian */}
            <td className="px-2 align-middle">{comment.time}</td>

            {/* Trạng thái */}
            <td className="px-2 align-middle">
              <span
                className={`px-2 py-2.5 font-medium rounded-[4px] ${status.color}`}
              >
                {status.text}
              </span>
            </td>

            {/* Hành động dropdown */}
            <td className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
              <div className="flex items-center justify-end h-[64px]">
                <button
                  className="focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionDropdownId(
                      actionDropdownId === comment.id ? null : comment.id
                    );
                  }}
                >
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </button>

                {actionDropdownId === comment.id && (
                  <div
                    ref={(ref) => {
                      dropdownRefs.current.set(comment.id, ref);
                    }}
                    className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                      onClick={() => setActionDropdownId(null)}
                    >
                      Sửa
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                      onClick={() => setActionDropdownId(null)}
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
