import { ReactNode, useState } from "react";
import CommentControlBar from "./CommentControlBar";
import Image from "next/image";
import { dummyComments } from "@/types/comment";

interface TableCommentWrapperProps {
  children: (filteredData: typeof dummyComments) => ReactNode;
}

export default function TableCommentWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 mt-6">
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px] text-left font-description">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[180px] px-4 h-[64px] align-middle rounded-tl-[12px] rounded-bl-[12px]">
                Người gửi
              </th>
              <th className="w-[330px] px-4 h-[64px] align-middle">
                Nội dung bình luận
              </th>
              <th className="w-[200px] px-4 h-[64px] align-middle">
                Sản phẩm/ Bài viết
              </th>
              <th className="w-[140px] px-4 h-[64px] align-middle">
                Thời gian
              </th>
              <th className="w-[156px] px-4 h-[64px] align-middle">
                Trạng thái
              </th>
              <th className="w-[56px] px-4 h-[64px] align-middle rounded-tr-[12px] rounded-br-[12px]">
                <div className="flex items-center justify-end h-full">
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

          <tbody className="font-semibold">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
