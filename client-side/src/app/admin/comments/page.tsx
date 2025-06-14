"use client";

import CommentTableBody from "@/admin/components/Admin_Comment/CommentTableBody";
import TableCommentWrapper from "@/admin/components/Admin_Comment/TableCommentWrapper";
import AdminLayout from "@/admin/layouts/AdminLayout";
import { dummyComments } from "@/types/comment";

export default function CommentsPage() {
  return (
    <AdminLayout
      pageTitle="Bình luận"
      pageSubtitle="Thông tin chi tiết về bình luận của bạn"
    >
      <TableCommentWrapper>
        {(filteredComments) => <CommentTableBody comments={filteredComments} />}
      </TableCommentWrapper>
    </AdminLayout>
  );
}
