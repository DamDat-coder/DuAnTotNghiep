"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableNewWrapper from "@/admin/components/Admin_New/TableNewWrapper";
import { getNewsList } from "@/services/newApi";
import { News, NewsFilterStatus } from "@/types/new";
import { Pagination } from "@/admin/components/ui/Panigation";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<NewsFilterStatus>("all");
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(1);
  const pageSize = 10;

  const loadNews = async () => {
    setLoading(true);
    try {
      let isPublished: boolean | undefined = undefined;
      if (filter === "published") isPublished = true;
      else if (filter === "draft") isPublished = false;

      const data = await getNewsList(
        currentPage,
        pageSize,
        search,
        isPublished
      );
      setNewsList(data.news ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tin tức:", error);
      setNewsList([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadNews();
  }, [search, filter, currentPage]);
  // Client-side search preview

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // Handle news deletion
  const handleDelete = (id: string) => {
    setNewsList((prev) => prev.filter((news) => news.id !== id));
  };

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
  return (
    <AdminLayout
      pageTitle="Tin tức"
      pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
    >
      <TableNewWrapper
        token={""}
        filter={filter}
        search={search}
        setFilter={setFilter}
        setSearch={setSearch}
        onUpdate={setNewsList}
        onDelete={handleDelete}
      />

      {/* Hiển thị trạng thái tải */}
      {loading && (
        <p className="text-center text-gray-500 mt-4">Đang tải dữ liệu...</p>
      )}

      {/* Hiển thị thông báo khi không có người dùng */}
      {!loading && newsList.length === 0 && (
        <div className="text-center mt-6">
          <p className="text-gray-500 text-lg">Không tìm thấy tin tức</p>
          {search && (
            <p className="text-sm text-gray-400 mt-2">
              Không có tin tức dùng nào khớp với từ khóa "{search}".
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
