"use client";
import React, { useState } from "react";
// import { FaChevronDown, FaChevronRight }  from "react-icons/fa";
// import { HiOutlineDotsHorizontal } from "react-icons/hi";

type Category = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  type: "product" | "news";
};

const mockCategories: Category[] = [
  // Sản phẩm
  {
    id: "1",
    name: "Products",
    description: "Danh mục sản phẩm",
    parentId: null,
    type: "product",
  },
  {
    id: "2",
    name: "Quần áo nam",
    description: "Quần áo dành cho nam",
    parentId: "1",
    type: "product",
  },
  {
    id: "3",
    name: "Áo sơ mi",
    description: "Áo sơ mi nam",
    parentId: "2",
    type: "product",
  },
  {
    id: "4",
    name: "Áo khoác",
    description: "Áo khoác nam",
    parentId: "2",
    type: "product",
  },
  {
    id: "5",
    name: "Áo khoác da",
    description: "Áo khoác da",
    parentId: "2",
    type: "product",
  },
  {
    id: "6",
    name: "Quần áo nữ",
    description: "Quần áo dành cho nữ",
    parentId: "1",
    type: "product",
  },
  {
    id: "7",
    name: "Quần áo nam",
    description: "Quần áo dành cho nam",
    parentId: "1",
    type: "product",
  },

  // News
  {
    id: "10",
    name: "News",
    description: "Danh mục tin tức",
    parentId: null,
    type: "news",
  },
  {
    id: "11",
    name: "Tin tức thời trang",
    description: "Cập nhật thời trang",
    parentId: "10",
    type: "news",
  },
  {
    id: "12",
    name: "Tin tức công nghệ",
    description: "Tin công nghệ mới nhất",
    parentId: "10",
    type: "news",
  },
];

const getChildren = (categories: Category[], parentId: string | null) =>
  categories.filter((cat) => cat.parentId === parentId);

function CategoryTree({
  categories,
  parentId,
  level = 0,
  expanded,
  setExpanded,
  setActionDropdown,
  actionDropdown,
  parentName,
}: {
  categories: Category[];
  parentId: string | null;
  level?: number;
  expanded: string[];
  setExpanded: (cb: (exp: string[]) => string[]) => void;
  setActionDropdown: (id: string | null) => void;
  actionDropdown: string | null;
  parentName?: string;
}) {
  return getChildren(categories, parentId).map((cat) => {
    const children = getChildren(categories, cat.id);
    const isExpandable = children.length > 0;
    const isExpanded = expanded.includes(cat.id);

    return (
      <React.Fragment key={cat.id}>
        <tr>
          <td
            className="py-2 font-medium"
            style={{ paddingLeft: `${level * 24 + 8}px` }}
          >
            <div className="flex items-center gap-2">
              {isExpandable ? (
                <button
                  onClick={() =>
                    setExpanded((prev) =>
                      isExpanded
                        ? prev.filter((id) => id !== cat.id)
                        : [...prev, cat.id]
                    )
                  }
                  className="text-[#222] hover:bg-gray-100 w-5 h-5 flex items-center justify-center rounded"
                  tabIndex={-1}
                  type="button"
                >
                  {/* {isExpanded ? (
                    <FaChevronDown size={13} />
                  ) : (
                    <FaChevronRight size={13} />
                  )} */}
                </button>
              ) : level > 0 ? (
                <span style={{ width: 20, display: "inline-block" }} />
              ) : null}
              <span>{cat.name}</span>
            </div>
          </td>
          <td className="py-2">{cat.description}</td>
          <td className="py-2">
            {parentName || getParentName(categories, cat.parentId)}
          </td>
          <td className="py-2 text-center relative">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setActionDropdown(actionDropdown === cat.id ? null : cat.id);
              }}
            >
              <HiOutlineDotsHorizontal className="text-xl text-[#8C94A5]" />
            </button>
            {actionDropdown === cat.id && (
              <div
                className="absolute right-0 top-9 z-50 min-w-[100px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                  onClick={() => {
                    setActionDropdown(null);
                    alert("Chức năng sửa (demo)");
                  }}
                >
                  Sửa
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
                  onClick={() => {
                    setActionDropdown(null);
                    alert("Chức năng xoá (demo)");
                  }}
                >
                  Xoá
                </button>
              </div>
            )}
          </td>
        </tr>
        {isExpanded && (
          <CategoryTree
            categories={categories}
            parentId={cat.id}
            level={level + 1}
            expanded={expanded}
            setExpanded={setExpanded}
            setActionDropdown={setActionDropdown}
            actionDropdown={actionDropdown}
            parentName={cat.name}
          />
        )}
      </React.Fragment>
    );
  });
}

function getParentName(
  categories: Category[],
  parentId: string | null
): string {
  if (!parentId) return "";
  const parent = categories.find((c) => c.id === parentId);
  return parent?.name || "";
}

export default function CategoryContent() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["1", "2", "10"]); // mặc định expand các nhóm chính
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);

  // Dữ liệu lọc
  const filtered = mockCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
  );

  // Đóng dropdown khi click ngoài
  React.useEffect(() => {
    const handler = () => setActionDropdown(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#eaf3f8] pt-10 pb-0">
      <div className="mx-auto w-[1126px] bg-white rounded-[34px] p-10 shadow">
        <div className="flex items-center gap-3 w-full mb-6">
          <div className="relative" style={{ width: 350, maxWidth: "100%" }}>
            <input
              className="w-full h-10 px-4 pr-10 rounded-lg border border-[#E6E8EC] bg-[#F6F8FB] text-base focus:outline-none"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-5 h-5 text-[#8C94A5] absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="9" cy="9" r="7" stroke="#8C94A5" strokeWidth="2" />
              <path
                d="M16 16L13.5 13.5"
                stroke="#8C94A5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Nút thêm danh mục */}
          <button
            className="ml-auto h-10 px-5 bg-[#111] text-white font-semibold rounded-lg hover:bg-[#8C94A5] transition flex items-center"
            onClick={() => alert("Chức năng Thêm danh mục (demo)")}
          >
            <span className="mr-2 text-xl font-bold">+</span>
            Thêm danh mục
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-base">
            <thead>
              <tr
                className="border-b border-[#F1F1F1] text-[#878B93] font-semibold"
                style={{ background: "#F8FAFC" }}
              >
                <th
                  className="py-3 text-left font-semibold"
                  style={{ width: 320 }}
                >
                  Tên danh mục
                </th>
                <th className="py-3 text-left font-semibold">Mô tả danh mục</th>
                <th
                  className="py-3 text-left font-semibold"
                  style={{ width: 170 }}
                >
                  Danh mục cha
                </th>
                <th
                  className="py-3 text-center font-semibold"
                  style={{ width: 60 }}
                >
                  ...
                </th>
              </tr>
            </thead>
            <tbody>
              <CategoryTree
                categories={filtered}
                parentId={null}
                expanded={expanded}
                setExpanded={setExpanded}
                setActionDropdown={setActionDropdown}
                actionDropdown={actionDropdown}
              />
            </tbody>
          </table>
        </div>
      </div>
      {/* Dropdown animation CSS */}
      <style>
        {`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease;
        }
        `}
      </style>
    </div>
  );
}
