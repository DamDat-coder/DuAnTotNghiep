"use client";

import { useState, useMemo, useEffect } from "react";
import CategoryControlBar from "./CategoryControlBar";
import CategoryBody from "./CategoryBody";
import AddCategoryForm from "./AddCategoryForm";
import { Pagination } from "../ui/Panigation";
import { ICategory } from "@/types/category";
import Image from "next/image";

interface CategoryTableWrapperProps {
  categories: ICategory[];
  onAddCategory?: () => void;
  onEditCategory?: (cat: ICategory) => void;
}

export default function CategoryTableWrapper({
  categories = [],
  onEditCategory,
  onAddCategory,
}: CategoryTableWrapperProps) {
  const [search, setSearch] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Tìm các node root phù hợp search
  const filteredRootNodes = useMemo(
    () =>
      categories.filter((cat) =>
        cat.name?.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const totalRoot = filteredRootNodes.length;
  const totalPage = Math.ceil(totalRoot / PAGE_SIZE);

  // Vẫn truyền đủ children và parentId cho node con
  const paginatedTree = filteredRootNodes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Build map: _id -> name cho toàn bộ cây
  const idToNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    function traverse(nodes: ICategory[]) {
      nodes.forEach((cat) => {
        map[cat._id] = cat.name;
        if (cat.children && cat.children.length) traverse(cat.children);
      });
    }
    traverse(categories);
    return map;
  }, [categories]);

  // Hàm lấy category theo id trong toàn bộ cây
  const findCategoryById = async (id: string): Promise<ICategory | null> => {
    function find(nodes: ICategory[]): ICategory | null {
      for (const cat of nodes) {
        if (cat._id === id) return cat;
        if (cat.children && cat.children.length) {
          const found = find(cat.children);
          if (found) return found;
        }
      }
      return null;
    }
    return find(categories);
  };

  useEffect(() => {
    if (currentPage > totalPage) setCurrentPage(1);
  }, [totalPage]);

  return (
    <div className="mt-6 relative">
      <CategoryControlBar
        onSearchChange={setSearch}
        onAddCategory={() => setShowAddPopup(true)}
      />
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr>
              <th className="px-4 py-0 rounded-tl-[12px] rounded-bl-[12px] h-[64px] align-middle">
                Tên danh mục
              </th>
              <th className="px-4 py-0 h-[64px] align-middle">
                Mô tả danh mục
              </th>
              <th className="px-4 py-0 h-[64px] align-middle">
                Danh mục cha
              </th>
              <th className="px-4 py-0 rounded-tr-[12px] rounded-br-[12px] text-right h-[64px] align-middle">
                <Image
                  src="/admin_user/dots.svg"
                  width={24}
                  height={24}
                  alt="three_dot"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <CategoryBody
              categories={paginatedTree}
              idToNameMap={idToNameMap}
              onEdit={onEditCategory}
              getCategoryById={findCategoryById}
            />
            {totalPage > 1 && (
              <>
                <tr>
                  <td colSpan={4} className="py-2">
                    <div className="w-full h-[1.5px] bg-gray-100 rounded"></div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="pt-4 pb-2">
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPage={totalPage}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
        {showAddPopup && (
          <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full relative shadow-lg animate-fadeIn">
              <button
                onClick={() => setShowAddPopup(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <AddCategoryForm onClose={() => setShowAddPopup(false)} />
            </div>
          </div>
        )}
    </div>
  );
}
