import { Comment } from "@/types/comment";
import Image from "next/image";
const statusMap = {
  published: { text: "Đã đăng", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  spam: { text: "Spam", color: "bg-[#FFF4E5] text-[#FF9900]" },
  deleted: { text: "Xóa", color: "bg-[#FDECEA] text-[#D93025]" },
};

export default function CommentTableBody({
  comments,
}: {
  comments: Comment[];
}) {
  return (
    <>
      {comments.map((comment) => {
        const status = statusMap[comment.status];
        return (
          <tr
            key={comment.id}
            className="border-b hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            <td className="px-4 py-4 whitespace-nowrap">{comment.author}</td>
            <td className="px-4 py-4 whitespace-normal break-words line-clamp-3">
              {comment.content}
            </td>

            <td className="px-4 py-4">{comment.product}</td>
            <td className="px-4 py-4">{comment.time}</td>
            <td className="px-4 py-4">
              <span
                className={`px-2 py-2.5 font-medium rounded-[4px] ${status.color}`}
              >
                {status.text}
              </span>
            </td>
            <td className="px-4 py-0 rounded-tr-[12px] rounded-br-[12px]">
              <div className="flex items-center justify-end h-[64px]">
                <Image
                  src="/admin_user/dots.svg"
                  width={24}
                  height={24}
                  alt="three_dot"
                />
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
