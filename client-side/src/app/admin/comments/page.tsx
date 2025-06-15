"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/admin/layouts/AdminLayout";
import TableCommentWrapper from "@/admin/components/Admin_Comment/TableCommentWrapper";
import CommentTableBody from "@/admin/components/Admin_Comment/CommentTableBody";
import { dummyComments } from "@/types/comment";
import { Pagination } from "@/admin/components/ui/Panigation";
import CommentControlBar from "@/admin/components/Admin_Comment/CommentControlBar";

export default function CommentsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredComments = dummyComments.filter((item) => {
    const matchFilter = filter === "all" || item.status === filter;
    const matchSearch =
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPage = Math.ceil(filteredComments.length / pageSize);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  return (
    <AdminLayout
      pageTitle="Bình luận"
      pageSubtitle="Thông tin chi tiết về bình luận của bạn"
    >
      <div className="space-y-4 mt-6"></div>
      <CommentControlBar
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />
      <TableCommentWrapper>
        <CommentTableBody comments={paginatedComments} />
      </TableCommentWrapper>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </AdminLayout>
  );
}
