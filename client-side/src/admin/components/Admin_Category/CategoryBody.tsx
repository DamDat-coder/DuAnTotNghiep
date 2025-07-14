import React, { useState, useRef, useEffect } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { ICategory } from "@/types/category";

interface CategoryBodyProps {
  categories: ICategory[];
  idToNameMap: Record<string, string>;
  onEdit?: (cat: ICategory) => void;
  getCategoryById: (id: string) => Promise<ICategory | null>;
  perPage?: number;
}

function paginate<T>(array: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
}

// Hàm lọc loại bỏ "Bài Viết" ra khỏi danh sách (đệ quy)
function filterOutBaiViet(nodes: ICategory[]): ICategory[] {
  return nodes
    .filter((cat) => cat.name?.trim().toLowerCase() !== "bài viết")
    .map((cat) => ({
      ...cat,
      children: cat.children ? filterOutBaiViet(cat.children) : [],
    }));
}

const CategoryBody: React.FC<CategoryBodyProps> = ({
  categories,
  idToNameMap,
  onEdit,
  getCategoryById,
  perPage = 10,
}) => {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const handleEdit = async (id: string) => {
    const cat = await getCategoryById(id);
    if (cat) {
      onEdit?.(cat);
    } else {
      alert("Không thể lấy dữ liệu danh mục!");
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Dùng danh sách đã được lọc bỏ "Bài Viết"
  const filteredCategories = filterOutBaiViet(categories);

  const renderTreeRows = (nodes: ICategory[], depth = 0, parentKey = "") =>
    nodes.map((cat) => {
      const hasChildren = !!cat.children && cat.children.length > 0;
      const rowKey = parentKey ? `${parentKey}-${cat._id}` : cat._id;
      return (
        <React.Fragment key={rowKey}>
          <tr className="group border-b hover:bg-[#F9FAFB] transition-colors duration-150 h-[64px] align-middle">
            <td
              className="h-[64px] align-middle px-4 py-0 min-w-[180px] max-w-[320px]"
              style={{ paddingLeft: `${depth * 28}px` }}
            >
              <div className="flex items-center gap-1">
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(cat._id)}
                    className="w-5 h-5 flex items-center justify-center mr-1"
                    aria-label={expanded[cat._id] ? "Thu gọn" : "Mở rộng"}
                  >
                    <span className="text-lg select-none">
                      {expanded[cat._id] ? "▼" : "▶"}
                    </span>
                  </button>
                )}
                <span className={`font-semibold text-[#202020] text-base break-words leading-6 ${depth === 0 ? "" : "font-medium"}`}>
                  {cat.name || "Không có dữ liệu"}
                </span>
              </div>
            </td>
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
            <td className="h-[64px] align-middle px-4 py-0 min-w-[50px] text-right relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionDropdownId(
                    actionDropdownId === cat._id ? null : cat._id
                  );
                }}
                className="p-2 rounded-full hover:bg-blue-100 transition"
                title="Thao tác"
                style={{ minWidth: 36, minHeight: 36 }}
              >
                <HiOutlineDotsHorizontal size={24} />
              </button>
              {actionDropdownId === cat._id && (
                <div
                  ref={popupRef}
                  className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-lg"
                    onClick={async () => {
                      setActionDropdownId(null);
                      await handleEdit(cat._id);
                    }}
                  >
                    Sửa
                  </button>
                </div>
              )}
            </td>
          </tr>
          {/* Render children nếu expanded */}
          {hasChildren && expanded[cat._id] && renderTreeRows(cat.children, depth + 1, rowKey)}
        </React.Fragment>
      );
    });

  const total = filteredCategories.length;
  const totalPages = Math.ceil(total / perPage);
  const paginatedRoot = paginate(filteredCategories, page, perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line
  }, [totalPages]);

  return (
    <>
      {renderTreeRows(paginatedRoot, 0, "")}
      {totalPages > 1 && (
        <tr>
          <td colSpan={4}>
            <div className="flex justify-center items-center gap-2 mt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setPage(idx + 1)}
                  className={`px-3 py-1 rounded ${page === idx + 1 ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
              >
                Sau
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default CategoryBody;
