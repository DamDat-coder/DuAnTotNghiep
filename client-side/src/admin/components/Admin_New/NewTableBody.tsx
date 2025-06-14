import { News } from "@/types/new";

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
            <td className="w-[180px] px-4 py-4 font-medium">{news.author}</td>
            <td className="w-[368px] px-4 py-4">{news.title}</td>
            <td className="w-[230px] px-4 py-4">{news.category}</td>
            <td className="w-[140px] px-4 py-4">{news.date}</td>
            <td className="w-[96px] px-4 py-4">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-[8px] ${status.color}`}
              >
                {status.text}
              </span>
            </td>
            <td className="w-[64px] px-4 py-4 text-right">
              <span className="text-xl font-semibold text-gray-500">...</span>
            </td>
          </tr>
        );
      })}
    </>
  );
}
