"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { deleteNews, getNewsList } from "@/services/newsApi";
import { News } from "@/types/new";
import NewControlBar from "./NewControlBar";
import EditNewsModal from "./EditNewsModal";
import { toast, Toaster } from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Pagination } from "../ui/Panigation";

const statusMap = {
  published: { text: "Đã xuất bản", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  draft: { text: "Bản nháp", color: "bg-[#FDECEA] text-[#D93025]" },
  upcoming: { text: "Sắp xuất bản", color: "bg-[#FFF4E5] text-[#FF9900]" },
};

interface TableNewWrapperProps {
  newsList: News[];
  token?: string;
  onDelete: (id: string) => void;
  children?: (filtered: News[]) => React.ReactNode;
  renderControlBar?: (props: {
    onFilterChange: (val: string) => void;
    onSearchChange: (val: string) => void;
  }) => React.ReactNode;
}

export default function TableNewWrapper({
  newsList = [],
  token,
  onDelete,
  children,
  renderControlBar,
}: TableNewWrapperProps) {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "upcoming"
  >("all");
  const [news, setNews] = useState<News[]>(
    Array.isArray(newsList) ? newsList : []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [confirmNewsId, setConfirmNewsId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

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
        // Không cần xử lý filter "upcoming" ở đây vì đã xử lý trong filteredNews

        const data = await getNewsList(currentPage, 10, search, isPublished);
        console.log("getNewsList response:", data);
        if (data && Array.isArray(data.news)) {
          setNews(data.news);
          setTotalPage(data.totalPages || 1);
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
  }, [search, filter, currentPage]);

  const handleDelete = (id: string) => {
    setConfirmNewsId(id);
  };

  const performDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteNews(id);
      setNews((prevNews) => prevNews.filter((item) => item._id !== id));
      onDelete(id);
      setActionDropdownId(null);
      toast.success("Xóa tin tức thành công!", {
        style: { background: "#EDF7ED", color: "#2E7D32" },
      });
    } catch (err: any) {
      toast.error(`Lỗi khi xóa tin tức: ${err.message || "Không xác định"}`, {
        style: { background: "#FDECEA", color: "#D93025" },
      });
    } finally {
      setIsLoading(false);
    }
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
    if (!Array.isArray(news)) return [];
    const now = new Date();
    now.setHours(now.getHours() + 7); // Điều chỉnh sang UTC+7

    return news
      .filter((item) => {
        if (!item._id) return false;
        if (filter === "all") return true;
        if (filter === "published") return item.is_published === true;
        if (filter === "draft")
          return (
            item.is_published === false &&
            (!item.published_at || new Date(item.published_at) <= now)
          );
        if (filter === "upcoming")
          return (
            item.is_published === false &&
            item.published_at &&
            new Date(item.published_at) > now
          );
        return true;
      })
      .filter((item) => {
        const title = item.title || "";
        return title.toLowerCase().includes(search.toLowerCase());
      });
  }, [news, filter, search]);

  // Thêm đoạn này để khóa scroll khi mở EditNewsModal
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showModal]);

  return (
    <>
      <div className="space-y-4 mt-6">
        {renderControlBar ? (
          renderControlBar({
            onFilterChange: (val: string) =>
              setFilter(val as "all" | "published" | "draft" | "upcoming"),
            onSearchChange: setSearch,
          })
        ) : (
          <NewControlBar
            onFilterChange={(val: string) =>
              setFilter(val as "all" | "published" | "draft" | "upcoming")
            }
            onSearchChange={setSearch}
            onAddNews={() => setShowModal(true)}
          />
        )}
        {isLoading && (
          <div className="text-center py-4">Đang tải dữ liệu...</div>
        )}
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
                const now = new Date();
                now.setHours(now.getHours() + 7); // Điều chỉnh sang UTC+7
                let status;
                if (news.is_published) {
                  status = statusMap.published;
                } else if (
                  news.published_at &&
                  new Date(news.published_at) > now
                ) {
                  status = statusMap.upcoming;
                } else {
                  status = statusMap.draft;
                }

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
                      {news.published_at
                        ? new Date(news.published_at).toLocaleDateString(
                            "vi-VN"
                          )
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
                              className="w-full text-left px-4 py-2 text-[#2998FF] hover:bg-gray-100 rounded-t-lg"
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
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}
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
      </div>

      <ConfirmDialog
        open={!!confirmNewsId}
        title="Bạn có chắc chắn muốn xóa tin tức này không?"
        onConfirm={async () => {
          await performDelete(confirmNewsId!);
          setConfirmNewsId(null);
        }}
        onCancel={() => setConfirmNewsId(null)}
      />
      {children && children(filteredNews)}
    </>
  );
}
