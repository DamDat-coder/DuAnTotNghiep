"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import AddNewModal from "./AddNewModal";
import { debounce } from "lodash";

const options = [
  { value: "all", label: "Tất cả" },
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
  { value: "upcoming", label: "Sắp xuất bản" },
];

interface Props {
  onFilterChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  loading: boolean;
}

export default function NewControlBar({
  onFilterChange,
  onSearchChange,
  loading,
}: Props) {
  const [selected, setSelected] = useState(options[0]);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      console.log("Debounced search triggered:", value); // Debug
      onSearchChange(value);
    }, 300), // Reduced to 300ms for faster response
    [onSearchChange]
  );

  const handleFilter = (opt: (typeof options)[number]) => {
    setSelected(opt);
    setOpenDropdown(false);
    console.log("Filter changed:", opt.value); // Debug
    onFilterChange(opt.value);
  };

  const handleSearch = (val: string) => {
    // Sanitize input: trim and remove special regex characters
    const sanitized = val.trim().replace(/[*+?^${}()|[\]\\]/g, "");
    setSearch(sanitized);
    console.log("Search input changed:", sanitized); // Debug
    debouncedSearch(sanitized);
  };

  const handleClearSearch = () => {
    setSearch("");
    console.log("Search cleared"); // Debug
    debouncedSearch.cancel(); // Cancel pending debounced calls
    onSearchChange(""); // Immediate reset
  };

  return (
    <>
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-4">
          <div className="relative min-w-[140px]">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center justify-between gap-2 h-12 px-4 border border-gray-300 rounded-[12px] text-gray-700 font-medium bg-white w-full"
              aria-haspopup="listbox"
              aria-expanded={openDropdown}
              aria-label="Chọn bộ lọc tin tức"
            >
              {selected.label}
              <Image
                src="/admin_user/chevron-down.svg"
                width={16}
                height={16}
                alt="Mở bộ lọc"
              />
            </button>

            {openDropdown && (
              <ul
                className="absolute mt-2 z-10 w-full bg-white border border-gray-200 rounded-[12px] shadow-md text-sm text-gray-600 overflow-hidden"
                role="listbox"
              >
                {options.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleFilter(opt)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    role="option"
                    aria-selected={selected.value === opt.value}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative w-[350px] h-12">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm tin tức"
              className="w-full h-full pl-10 pr-10 border border-gray-300 rounded-[12px] text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              aria-label="Tìm kiếm tin tức theo tiêu đề"
            />
            <Image
              src="/admin_user/search.svg"
              width={20}
              height={20}
              alt="Tìm kiếm"
              className="absolute top-1/2 left-3 transform -translate-y-1/2"
            />
            {loading && (
              <div className="absolute top-1/2 right-10 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                  ></path>
                </svg>
              </div>
            )}
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
                aria-label="Xóa tìm kiếm"
              >
                <Image
                  src="/admin_user/close.svg"
                  width={14}
                  height={14}
                  alt="Xóa"
                />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 h-12 rounded-[12px] text-sm font-medium hover:opacity-90"
          aria-label="Thêm tin tức mới"
        >
          <Image src="/admin_user/plus.svg" width={10} height={10} alt="Thêm" />
          Tin tức mới
        </button>
      </div>

      {showModal && <AddNewModal onClose={() => setShowModal(false)} />}
    </>
  );
}
