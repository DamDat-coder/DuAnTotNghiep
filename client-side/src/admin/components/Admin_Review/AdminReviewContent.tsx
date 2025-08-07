"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableReviewWrapper from "@/admin/components/Admin_Review/TableReviewWrapper";
import { Pagination } from "@/admin/components/ui/Panigation";
import ReviewControlBar from "@/admin/components/Admin_Review/ReviewControlBar";
import { fetchAllReviews } from "@/services/reviewApi";
import { IReview } from "@/types/review";

export default function ReviewsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: pageSize,
        };
        if (filter !== "all") params.status = filter;
        if (search) params.search = search;
        const res = await fetchAllReviews(params);
        setReviews(res.data);
        setTotalPage(res.pagination.totalPages);
      } catch {
        setReviews([]);
        setTotalPage(1);
      }
    };
    fetchData();
  }, [filter, search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <AdminLayout
      pageTitle="Đánh giá"
      pageSubtitle="Thông tin chi tiết về đánh giá của người dùng"
    >
      <div className="space-y-4 mt-6"></div>
      <ReviewControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
      <TableReviewWrapper
        reviews={reviews}
        filter={filter}
        search={search}
        setFilter={setFilter}
        setSearch={setSearch}
        onUpdate={setReviews}
        currentPage={currentPage}
        totalPage={totalPage}
        onPageChange={setCurrentPage}
      />
    </AdminLayout>
  );
}
