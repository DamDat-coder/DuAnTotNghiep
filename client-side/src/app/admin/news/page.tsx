"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { dummyNews } from "@/types/new";
import TableNewWrapper from "@/admin/components/Admin_New/TableNewWrapper";
import NewsTableBody from "@/admin/components/Admin_New/NewTableBody";
import NewControlBar from "@/admin/components/Admin_New/NewControlBar";
import { Pagination } from "@/admin/components/ui/Panigation";

export default function NewsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredNews = dummyNews.filter((item) => {
    const matchFilter = filter === "all" || item.status === filter;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPage = Math.ceil(filteredNews.length / pageSize);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <AdminLayout
      pageTitle="Tin tức"
      pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
    >
      <div className="space-y-4 mt-6">
        <NewControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
        <TableNewWrapper>
          <NewsTableBody newsList={paginatedNews} />
        </TableNewWrapper>

        {/* Pagination */}
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
