"use client";

import { useState } from "react";
import Image from "next/image";
import AdminLayout from "@/admin/layouts/AdminLayout";

import { dummyNews } from "@/types/new";
import TableNewWrapper from "@/admin/components/Admin_New/TableNewWrapper";
import NewsTableBody from "@/admin/components/Admin_New/NewTableBody";
import NewControlBar from "@/admin/components/Admin_New/NewControlBar";

export default function NewsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredNews = dummyNews.filter((item) => {
    const matchFilter = filter === "all" || item.status === filter;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <AdminLayout
      pageTitle="Tin tức"
      pageSubtitle="Quản lý bài viết và trạng thái xuất bản"
    >
      <div className="space-y-4 mt-6">
        <NewControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
        <TableNewWrapper>
          <NewsTableBody newsList={filteredNews} />
        </TableNewWrapper>
      </div>
    </AdminLayout>
  );
}
