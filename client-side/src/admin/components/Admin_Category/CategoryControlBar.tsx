"use client";
import { useState } from "react";
import Image from "next/image";

interface Props {
  onSearchChange: (val: string) => void;
  onAddCategory?: () => void;
}

export default function CategoryControlBar({ onSearchChange, onAddCategory }: Props) {
  const [search, setSearch] = useState("");

  const handleSearch = (val: string) => {
    setSearch(val);
    onSearchChange(val);
  };

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {/* Search Box */}
      <div className="relative w-[350px] h-12">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm kiếm danh mục"
          className="w-full h-full pl-10 pr-10 border border-gray-300 rounded-[12px] text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <Image
          src="/admin_user/search.svg"
          width={20}
          height={20}
          alt="search"
          className="absolute top-1/2 left-3 transform -translate-y-1/2"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
          >
            <Image src="/admin_user/close.svg" width={14} height={14} alt="clear" />
          </button>
        )}
      </div>
      {/* Add Category Button */}
      <div className="pr-6">
        <button
          onClick={onAddCategory}
          className="flex items-center gap-2 bg-black text-white px-5 h-12 rounded-[12px] text-sm font-medium hover:opacity-90"
        >
          <Image src="/admin_user/plus.svg" width={10} height={10} alt="plus" />
          Thêm danh mục
        </button>
      </div>
    </div>
  );
}
