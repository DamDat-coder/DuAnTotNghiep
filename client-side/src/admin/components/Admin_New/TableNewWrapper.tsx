"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { deleteNews, getNewsList } from "@/services/newApi";
import { News } from "@/types/new";
import NewControlBar from "./NewControlBar";
import EditNewsModal from "./EditNewsModal";
import { toast, Toaster } from "react-hot-toast";

const statusMap = {
  published: { text: "Đã xuất bản", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  draft: { text: "Bản nháp", color: "bg-[#FDECEA] text-[#D93025]" },
  // Uncomment if needed
  // upcoming: { text: "Sắp xuất bản", color: "bg-[#FFF4E5] text-[#FF9900]" },
  // unknown: { text: "Không xác định", color: "bg-gray-200 text-gray-700" },
};

interface TableNewWrapperProps {
  newsList: News[];
  token?: string;
  onDelete: (id: string) => void;
  children?: (filtered: News[]) => React.ReactNode;
}

export default function TableNewWrapper({
  newsList = [], // Default to empty array to prevent undefined
  token,
  onDelete,
  children,
}: TableNewWrapperProps) {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [news, setNews] = useState<News[]>(
    Array.isArray(newsList) ? newsList : []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInside = Array.from(dropdownRefs.current.values()).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!isClickInside) {
        setActionDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        let isPublished: boolean | undefined = undefined;
        if (filter === "published") isPublished = true;
        else if (filter === "draft") isPublished = false;

        const data = await getNewsList(1, 10, search, isPublished);
        console.log("getNewsList response:", data);
        if (data && Array.isArray(data.news)) {
          setNews(data.news);
        } else {
          console.error("No valid news data received:", data);
          setNews([]);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, [search, filter]);

  const handleDelete = async (id: string) => {
    // Show the toast with the confirmation message
    toast(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-[#0F172A] mb-4">
            Bạn có chắc chắn muốn xóa tin tức này không?
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)} // Cancel action
            >
              Hủy
            </button>
            <button
              className="px-3 py-1 bg-[#D93025] text-white rounded hover:bg-[#B71C1C]"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setIsLoading(true);
                  await deleteNews(id);
                  setNews((prevNews) =>
                    prevNews.filter((item) => item._id !== id)
                  );
                  onDelete(id);
                  setActionDropdownId(null);
                  toast.success("Xóa tin tức thành công!", {
                    style: { background: "#EDF7ED", color: "#2E7D32" },
                  });
                } catch (err: any) {
                  console.error("Error deleting news:", err);
                  toast.error(
                    `Lỗi khi xóa tin tức: ${err.message || "Không xác định"}`,
                    {
                      style: { background: "#FDECEA", color: "#D93025" },
                    }
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      ),
      { duration: Infinity } // Keep the toast visible indefinitely until user clicks confirm
    );
  };

  const handleEdit = (news: News) => {
    if (!news._id) {
      console.error("Invalid news ID");
      return;
    }
    setSelectedNews(news);
    setShowModal(true);
  };

  const filteredNews = useMemo(() => {
    // Ensure news is an array before filtering
    if (!Array.isArray(news)) {
      console.error("News is not an array:", news);
      return [];
    }

    return news
      .filter((item) => {
        if (!item._id) return false; // Skip invalid items
        if (filter === "all") return true;
        if (filter === "published") return item.is_published === true;
        if (filter === "draft") return item.is_published === false;
        return true;
      })
      .filter((item) => {
        const title = item.title || "";
        return title.toLowerCase().includes(search.toLowerCase());
      });
  }, [news, filter, search]);
  return (
    <div className="space-y-4 mt-6">
      <NewControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
      {isLoading && <div className="text-center py-4">Đang tải dữ liệu...</div>}
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px] text-left font-description">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr>
              <th
                scope="col"
                className="w-[130px] px-4 h-[64px] align-middle py-0 rounded-tl-[12px] rounded-bl-[12px]"
              >
                Tác giả
              </th>
              <th
                scope="col"
                className="w-[380px] px-4 h-[64px] align-middle py-0"
              >
                Tiêu đề
              </th>
              <th
                scope="col"
                className="w-[200px] px-4 h-[64px] align-middle py-0"
              >
                Danh mục
              </th>
              <th
                scope="col"
                className="w-[156px] px-4 h-[64px] align-middle py-0"
              >
                Ngày đăng
              </th>
              <th
                scope="center"
                className="w-[156px] px-4 h-[64px] align-middle py-0"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="w-[56px] px-4 h-[64px] align-middle py-0 rounded-tr-[12px] rounded-br-[12px]"
              >
                <div className="flex items-center justify-end h-[64px]">
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="Actions menu"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không tìm thấy tin tức
                </td>
              </tr>
            )}
            {filteredNews.map((news) => {
              const status = news.is_published
                ? statusMap.published
                : statusMap.draft;

              return (
                <tr
                  key={news._id}
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
                    {news.is_published && news.published_at
                      ? new Date(news.published_at).toLocaleDateString("vi-VN")
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
                        aria-label="Open actions menu"
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
                          alt="Actions menu"
                        />
                      </button>
                      {actionDropdownId === news._id && (
                        <div
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
                            onClick={() => handleEdit(news)}
                          >
                            Sửa
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                            onClick={() => news._id && handleDelete(news._id)}
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
          </tbody>
        </table>
        {showModal && selectedNews && (
          <EditNewsModal
            newsData={selectedNews}
            onClose={() => {
              setShowModal(false);
              setSelectedNews(null);
            }}
          />
        )}
      </div>
      {children && children(filteredNews)}
    </div>
  );
}
