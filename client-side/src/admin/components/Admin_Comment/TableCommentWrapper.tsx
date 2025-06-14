import { ReactNode, useState } from "react";
import CommentControlBar from "./CommentControlBar";
import Image from "next/image";
import { dummyComments } from "@/types/comment";

interface TableCommentWrapperProps {
  children: (filteredData: typeof dummyComments) => ReactNode;
}

export default function TableCommentWrapper({
  children,
}: TableCommentWrapperProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredComments = dummyComments.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch =
      c.author.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.product.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 mt-6">
      <CommentControlBar
        onFilterChange={(val) => setFilter(val)}
        onSearchChange={(val) => setSearch(val)}
      />

      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[180px] px-4 py-0 rounded-tl-[12px] rounded-bl-[12px]">
                Người gửi
              </th>
              <th className="w-[330px] px-4 py-0">Nội dung bình luận</th>
              <th className="w-[200px] px-4 py-0">Sản phẩm/ Bài viết</th>
              <th className="w-[140px] px-4 py-0">Thời gian</th>
              <th className="w-[156px] px-4 py-0">Trạng thái</th>
              <th className="w-[56px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px]">
                <div className="flex items-center justify-end h-[64px]">
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>{children(filteredComments)}</tbody>
        </table>
      </div>
    </div>
  );
}
