import { Comment } from "@/types/comment";

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
            <td className="px-4 py-4 font-medium whitespace-nowrap w-[180px]">
              {comment.author}
            </td>
            <td className="px-4 py-4 truncate w-[360px]">{comment.content}</td>
            <td className="px-4 py-4 w-[180px]">{comment.product}</td>
            <td className="px-4 py-4 w-[160px]">{comment.time}</td>
            <td className="px-4 py-4 w-[100px]">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-[4px] ${status.color}`}
              >
                {status.text}
              </span>
            </td>
            <td className="px-4 py-4 text-right w-[64px]">
              <span className="text-xl font-semibold text-gray-500">...</span>
            </td>
          </tr>
        );
      })}
    </>
  );
}
