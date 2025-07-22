// src/components/Core/Popups/LookupMenu/SearchInput.tsx
"use client";

import React from "react";
import Image from "next/image";
interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export default function SearchInput({
  searchTerm,
  setSearchTerm,
}: SearchInputProps) {
  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div
      className="flex items-center gap-4 bg-white sticky top-0 z-10 rounded-t"
    >
      <div className="relative w-full h-full rounded-full flex items-center ">
        <Image
          src="/nav/nav_lookup_input.svg"
          alt="Logo"
          width={120}
          height={40}
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
            <Image
              src="/nav/nav_clear.svg"
              alt="Logo"
              width={120}
              height={40}
              className="h-[0.875rem] w-[0.875rem]"
            />
          </button>
        )}
      </div>
    </div>
  );
}
