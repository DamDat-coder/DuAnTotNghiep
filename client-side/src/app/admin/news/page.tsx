"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableNewWrapper from "@/admin/components/Admin_New/TableNewWrapper";
import NewControlBar from "@/admin/components/Admin_New/NewControlBar";
import { getNewsList } from "@/services/newApi";
import { News, NewsFilterStatus } from "@/types/new";
import { Pagination } from "@/admin/components/ui/Panigation";
import NewsTableBody from "@/admin/components/Admin_New/NewTableBody";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [displayedNews, setDisplayedNews] = useState<News[]>([]); // For client-side search preview
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NewsFilterStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;



  // Fetch news when filter/debouncedSearch/page changes
  useEffect(() => {
    const abortController = new AbortController();
    const fetchNews = async () => {
      try {
        setLoading(true);
        console.log("Fetching news with params:", {
          currentPage,
          pageSize,
          filter,
          debouncedSearch,
        }); // Debug
        let isPublished: boolean | undefined = undefined;
        if (filter === "published") isPublished = true;
        else if (filter === "draft") isPublished = false;

        const response = await getNewsList(
          currentPage,
          pageSize,
          undefined,
          isPublished,
          debouncedSearch || undefined
        );
        console.log("API response:", response); // Debug

        let filteredNews = response.news;
        if (filter === "upcoming") {
          filteredNews = response.news.filter(
            (item) =>
              item.published_at &&
              new Date(item.published_at) > new Date() &&
              !item.is_published
          );
        }
        setNewsList(filteredNews);
        setDisplayedNews(filteredNews); // Initialize displayed news
        setTotalPages(response.totalPages);
        setLoading(false);
        console.log("News list updated:", filteredNews); // Debug
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err.message); // Debug
          setError(err.message || "Không thể tải danh sách tin tức");
          setLoading(false);
        }
      }
    };
    fetchNews();
    return () => abortController.abort();
  }, [currentPage, debouncedSearch, filter]);

  // Client-side search preview
  useEffect(() => {
    console.log("Applying client-side search preview:", search); // Debug
    if (search) {
      const filtered = newsList.filter((news) =>
        news.title.toLowerCase().includes(search.toLowerCase())
      );
      setDisplayedNews(filtered);
    } else {
      setDisplayedNews(newsList); // Reset to full list when search is cleared
    }
  }, [search, newsList]);

  // Handle search changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setDebouncedSearch(val); // Update debouncedSearch immediately for API call
    setCurrentPage(1); // Reset to page 1
    console.log("Search changed:", val); // Debug
  };

  // Handle news deletion
  const handleDelete = (id: string) => {
    setNewsList((prev) => prev.filter((news) => news.id !== id));
    setDisplayedNews((prev) => prev.filter((news) => news.id !== id));
  };

  // Debug newsList and displayedNews
  useEffect(() => {
    console.log("Current newsList:", newsList); // Debug
    console.log("Current displayedNews:", displayedNews); // Debug
  }, [newsList, displayedNews]);

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

  if (displayedNews.length === 0) {
    return (
      <AdminLayout
        pageTitle="Tin tức"
        pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
      >
        <div className="space-y-4 mt-6">
          <NewControlBar
            onFilterChange={(val) => {
              setFilter(val as NewsFilterStatus);
              setCurrentPage(1);
            }}
            onSearchChange={handleSearchChange}
            loading={loading}
          />
          <div className="text-center py-4 text-gray-500">
            Không tìm thấy tin tức phù hợp với tiêu chí tìm kiếm.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Tin tức"
      pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
    >
      <div className="space-y-4 mt-6">
        <NewControlBar
          onFilterChange={(val) => {
            setFilter(val as NewsFilterStatus);
            setCurrentPage(1);
          }}
          onSearchChange={handleSearchChange}
          loading={loading}
        />
        <TableNewWrapper>
          <NewsTableBody
            newsList={displayedNews} // Use displayedNews for rendering
            token={null}
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
