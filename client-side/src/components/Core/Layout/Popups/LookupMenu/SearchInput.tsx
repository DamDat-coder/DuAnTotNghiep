// src/components/Core/Popups/LookupMenu/SearchInput.tsx
"use client";

import React from "react";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export default function SearchInput({
  searchTerm,
  setSearchTerm,
  setIsOpen,
  isMobile,
}: SearchInputProps) {
  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div
      className={`flex items-center gap-4 laptop:w-[80%] desktop:w-[80%]${
        isMobile ? "px-6 pt-4 pb-6" : "px-4 py-2"
      } bg-white sticky top-0 z-10 rounded-t`}
    >
      <div className="relative bg-[#687176] w-full rounded-full flex items-center ">
        <img
          src="/nav/nav_lookup_input.svg"
          alt="Search"
          className="absolute left-4 h-5 w-5"
        />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-12 pr-12 text-lg text-black bg-[#ededed] border-none rounded-full focus:outline-none focus:ring-0 placeholder:text-base placeholder:text-[#687176] truncate "
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-4 flex items-center"
            onClick={handleClear}
          >
            <img
              src="/nav/nav_clear.svg"
              alt="Clear"
              className="h-[0.875rem] w-[0.875rem]"
            />
          </button>
        )}
      </div>

      <button
        type="button"
        className="laptop:hidden desktop:hidden text-black hover:text-gray-800 focus:ring-2 focus:ring-black focus:outline-none whitespace-nowrap"
        onClick={() => setIsOpen(false)}
      >
        Hủy bỏ
      </button>
    </div>
  );
}
