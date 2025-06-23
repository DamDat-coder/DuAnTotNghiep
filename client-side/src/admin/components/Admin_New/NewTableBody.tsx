import { News } from "@/types/new";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const statusMap = {
  published: { text: "Đã xuất bản", color: "bg-[#EDF7ED] text-[#2E7D32]" },
  draft: { text: "Bản nháp", color: "bg-[#FDECEA] text-[#D93025]" },
  upcoming: { text: "Sắp xuất bản", color: "bg-[#FFF4E5] text-[#FF9900]" },
};

export default function NewsTableBody({ newsList }: { newsList: News[] }) {
  const [actionDropdownId, setActionDropdownId] = useState<number | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const isClickInside = Array.from(dropdownRefs.current.values()).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!isClickInside) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {newsList.map((news) => {
        const status = statusMap[news.status];

        return (
          <tr
            key={news.id}
            className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            <td className="px-4 py-4">{news.author}</td>
            <td className="px-4 py-4 whitespace-normal break-words">
              <div className="line-clamp-2">{news.title}</div>
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
            <td className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
              <div className="flex items-center justify-end h-[64px]">
                <button
                  className="focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionDropdownId(
                      actionDropdownId === news.id ? null : news.id
                    );
                  }}
                >
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </button>

                {/* Dropdown */}
                {actionDropdownId === news.id && (
                  <div
                    ref={(ref) => {
                      dropdownRefs.current.set(news.id, ref);
                    }}
                    className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                      onClick={() => setActionDropdownId(null)}
                    >
                      Sửa
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                      onClick={() => setActionDropdownId(null)}
                    >
                      Xoá
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
