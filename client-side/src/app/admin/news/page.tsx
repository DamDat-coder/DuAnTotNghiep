"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableNewWrapper from "@/admin/components/Admin_New/TableNewWrapper";
import NewControlBar from "@/admin/components/Admin_New/NewControlBar";
import AddNewModal from "@/admin/components/Admin_New/AddNewModal";
import { getNewsList } from "@/services/newApi";
import { News, NewsFilterStatus } from "@/types/new";
import NewsTableBody from "@/admin/components/Admin_New/NewTableBody";
import { Pagination } from "@/admin/components/ui/Panigation";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NewsFilterStatus>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const pageSize = 10;

  // Lấy token từ localStorage khi mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  // Lấy danh sách tin tức từ API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { news, totalPages } = await getNewsList(currentPage, pageSize);
        setNewsList(news);
        setTotalPages(totalPages);
        setLoading(false);
      } catch (err: any) {
        setError("Không thể tải danh sách tin tức");
        setLoading(false);
      }
    };
    fetchNews();
  }, [currentPage]);

  // Lọc và tìm kiếm phía client
  useEffect(() => {
    const filtered = newsList.filter((item) => {
      const matchFilter = filter === "all" || item.status === filter;
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category_id?.name.toLowerCase().includes(search.toLowerCase()) ||
        item.user_id?.name.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
    setFilteredNews(filtered);
    setCurrentPage(1); // Reset về trang 1 khi lọc hoặc tìm kiếm
  }, [newsList, filter, search]);

  // Xử lý xóa tin tức
  const handleDelete = (id: string) => {
    setNewsList(newsList.filter((news) => news.id !== id));
    setFilteredNews(filteredNews.filter((news) => news.id !== id));
  };

  // Tính toán dữ liệu phân trang
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <AdminLayout
        pageTitle="Tin tức"
        pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
      >
        <div className="text-center py-4">Đang tải...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        pageTitle="Tin tức"
        pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
      >
        <div className="text-center py-4 text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Tin tức"
      pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
    >
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <NewControlBar
            onFilterChange={setFilter}
            onSearchChange={setSearch}
          />
        </div>
        <TableNewWrapper>
          <NewsTableBody
            newsList={paginatedNews}
            token={token}
            onDelete={handleDelete}
          />
        </TableNewWrapper>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPage={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
