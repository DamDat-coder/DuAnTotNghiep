"use client";

import { deleteNews } from "@/services/newApi";
import { News } from "@/types/new";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EditNewsModal from "./EditNewsModal";

const statusMap = {
  published: { text: "Đã xuất bản", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  draft: { text: "Bản nháp", color: "bg-[#FDECEA] text-[#D93025]" },
  upcoming: { text: "Sắp xuất bản", color: "bg-[#FFF4E5] text-[#FF9900]" },
  unknown: { text: "Không xác định", color: "bg-gray-200 text-gray-700" },
};

export default function NewsTableBody({
  newsList,
  token,
  onDelete,
}: {
  newsList: News[];
  token: string | null;
  onDelete: (id: string) => void;
}) {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const isClickInside = Array.from(dropdownRefs.current.values()).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!isClickInside) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async (id: string) => {
    if (!token) {
      alert("Vui lòng đăng nhập để xóa tin tức");
      return;
    }
    try {
      await deleteNews(id);
      onDelete(id);
      setActionDropdownId(null);
      alert("Xóa tin tức thành công!");
    } catch (err: any) {
      alert(`Lỗi khi xóa tin tức: ${err.message}`);
    }
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setShowModal(true);
  };

  return (
    <>
      {newsList.map((news, index) => {
        const status = news.is_published
          ? statusMap.published
          : news.published_at && new Date(news.published_at) > new Date()
          ? statusMap.upcoming
          : statusMap.draft;

        return (
          <tr
            key={news._id || index}
            className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            <td className="px-4 py-4">
              {news.user_id?.name || "Chưa có tên tác giả"}
            </td>
            <td className="px-4 py-4 whitespace-normal break-words">
              <div className="line-clamp-2">{news.title}</div>
            </td>
            <td className="px-4 py-4">
              {news.category_id?.name || "Chưa có danh mục"}
            </td>
            <td className="px-4 py-4">
              {news.is_published
                ? news.published_at
                  ? new Date(news.published_at).toLocaleDateString("vi-VN") // Kiểm tra xem published_at có hợp lệ không
                  : "Chưa có ngày xuất bản"
                : "Chưa xuất bản"}
            </td>

            <td className="px-4 py-4">
              <span
                className={`px-2 py-2.5 font-medium rounded-[4px] ${status.color}`}
              >
                {status.text}
              </span>
            </td>
            <td className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
              <div className="flex items-center justify-end h-[64px]">
                <button
                  className="focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionDropdownId(
                      actionDropdownId === news._id ? null : news._id
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

                {actionDropdownId === news._id && (
                  <div
                    key={news._id}
                    ref={(ref) => {
                      if (news._id) {
                        dropdownRefs.current.set(news._id, ref);
                      }
                    }}
                    className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                      onClick={() => {
                        if (news._id) {
                          handleEdit(news);
                        } else {
                          console.error("ID không hợp lệ:", news._id);
                        }
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                      onClick={() => {
                        if (news._id) {
                          handleDelete(news._id);
                        } else {
                          console.error("ID không hợp lệ:", news._id);
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        );
      })}
      {showModal && selectedNews && (
        <EditNewsModal
          newsData={selectedNews}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
