import { News } from "@/types/new";
import Image from "next/image";
const statusMap = {
  published: { text: "Đã xuất bản", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  draft: { text: "Bản nháp", color: "bg-[#FDECEA] text-[#D93025]" },
  upcoming: { text: "Sắp xuất bản", color: "bg-[#FFF4E5] text-[#FF9900]" },
};

export default function NewsTableBody({ newsList }: { newsList: News[] }) {
  return (
    <>
      {newsList.map((news) => {
        const status = statusMap[news.status];
        return (
          <tr
            key={news.id}
            className="border-b hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            <td className="px-4 py-4">{news.author}</td>
            <td className="px-4 py-4 whitespace-normal break-words line-clamp-3">
              {news.title}
            </td>
            <td className="px-4 py-4">{news.category}</td>
            <td className="px-4 py-4">{news.date}</td>
            <td className="px-4 py-4">
              <span
                className={`px-2 py-2.5 font-medium rounded-[4px] ${status.color}`}
              >
                {status.text}
              </span>
            </td>
            <td className="w-[56px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px]">
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
