"use client";
import { useState, useEffect, useMemo } from "react";
import CategoryControlBar from "./CategoryControlBar";
import CategoryBody from "./CategoryBody";
import { Pagination } from "../ui/Panigation";

export default function CategoryTableWrapper({ categories = [], onAddCategory, onEditCategory }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Map id -> name để hiển thị danh mục cha
  const idToNameMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => (map[cat.id] = cat.name));
    return map;
  }, [categories]);

  // Lọc search
  const filtered = useMemo(
    () => categories.filter((cat) => cat.name?.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4 mt-6">
      <CategoryControlBar onSearchChange={setSearch} onAddCategory={onAddCategory} />
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="">
              <th className="px-4 py-0 rounded-tl-[12px] rounded-bl-[12px] h-[64px] align-middle">Tên danh mục</th>
              <th className="px-4 py-0 h-[64px] align-middle">Mô tả danh mục</th>
              <th className="px-4 py-0 h-[64px] align-middle">Danh mục cha</th>
              <th className="px-4 py-0 rounded-tr-[12px] rounded-br-[12px] text-right h-[64px] align-middle">...</th>
            </tr>
          </thead>
          <tbody>
            <CategoryBody categories={pageData} idToNameMap={idToNameMap} onEdit={onEditCategory} />
                        {totalPage > 1 && (
              <>
                <tr>
                  <td colSpan={7} className="py-2">
                    <div className="w-full h-[1.5px] bg-gray-100 rounded"></div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={7} className="pt-4 pb-2">
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
    </div>
  );
}
