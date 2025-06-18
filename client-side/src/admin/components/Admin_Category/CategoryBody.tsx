import React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  description?: string; // Bổ sung mô tả nếu muốn tương lai
}

interface CategoryBodyProps {
  categories: Category[];
  idToNameMap: Record<string, string>;
  onEdit?: (cat: Category) => void;
}

export default function CategoryBody({
  categories,
  idToNameMap,
  onEdit,
}: CategoryBodyProps) {
  return (
    <>
      {categories.map((cat) => (
        <tr
          key={cat.id}
          className="border-b hover:bg-[#F9FAFB] transition-colors duration-150 group h-[64px] align-middle"
        >
          {/* Tên danh mục */}
          <td className="h-[64px] align-middle px-4 py-0 min-w-[180px] max-w-[320px]">
            <span className="font-semibold text-[#202020] text-base break-words">
              {cat.name || "Không có dữ liệu"}
            </span>
          </td>
          {/* Mô tả danh mục */}
          <td className="h-[64px] align-middle px-4 py-0 min-w-[110px] text-gray-700">
            {cat.description || "--"}
          </td>
          {/* Danh mục cha */}
          <td className="h-[64px] align-middle px-4 py-0 min-w-[110px] text-gray-700">
            {cat.parentId && idToNameMap[cat.parentId]
              ? idToNameMap[cat.parentId]
              : cat.parentId
              ? "Không xác định"
              : "--"}
          </td>
          {/* Ba chấm (hiện nút sửa) */}
          <td className="h-[64px] align-middle px-4 py-0 min-w-[50px] text-right">
            <button
              onClick={() => onEdit?.(cat)}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Sửa"
            >
              <HiOutlineDotsHorizontal size={20} />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
