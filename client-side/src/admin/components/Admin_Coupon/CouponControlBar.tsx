"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { debounce } from "lodash";

const options = [
  { value: "all", label: "Tất cả" },
  { value: "true", label: "Kích hoạt" },
  { value: "false", label: "Chưa kích hoạt" },
];

export default function CouponControlBar({
  onFilterChange,
  onSearchChange,
  onAddCoupon, // thêm prop này
}: {
  onFilterChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onAddCoupon: () => void; // thêm prop này
}) {
  const [selected, setSelected] = useState(options[0]);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  // Debounce hàm onSearchChange
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 500), // Chờ 500ms trước khi gọi onSearchChange
    [onSearchChange]
  );

  // Xử lý thay đổi filter
  const handleFilter = (opt: (typeof options)[number]) => {
    setSelected(opt);
    setOpenDropdown(false);
    onFilterChange(opt.value);
  };

  // Xử lý thay đổi giá trị tìm kiếm
  const handleSearch = (val: string) => {
    setSearch(val);
    debouncedSearch(val); // Gọi hàm debounce thay vì onSearchChange trực tiếp
  };

  // Xử lý xóa từ khóa tìm kiếm
  const handleClearSearch = () => {
    setSearch("");
    onSearchChange(""); // Gọi ngay lập tức để cập nhật kết quả
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* Filter & Search */}
        <div className="flex items-center gap-6">
          {/* Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center justify-between gap-2 h-12 px-4 border border-gray-300 rounded-[12px] text-gray-500 font-medium bg-white min-w-[103px]"
            >
              {selected.label}
              <Image
                src="/admin_user/chevron-down.svg"
                width={16}
                height={16}
                alt="option"
              />
            </button>

            {openDropdown && (
              <ul className="absolute mt-2 z-10 w-full bg-white border border-gray-200 rounded-[12px] shadow-md text-sm text-gray-600">
                {options.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleFilter(opt)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-[12px]"
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-[350px] h-12">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã khuyến mãi"
              className="w-full h-full pl-10 pr-10 border border-gray-300 rounded-[12px] text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Image
              src="/admin_user/search.svg"
              width={20}
              height={20}
              alt="search"
              className="absolute top-1/2 left-3 transform -translate-y-1/2"
            />
            {search && ( // Chỉ hiển thị nút xóa khi có từ khóa
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                <Image
                  src="/admin_user/close.svg"
                  width={14}
                  height={14}
                  alt="clear"
                />
              </button>
            )}
          </div>
        </div>

        {/* Add User Button */}
        <div className="pr-6">
          <button
            onClick={onAddCoupon}
            className="flex items-center gap-2 bg-black text-white px-5 h-12 rounded-[12px] text-sm font-medium hover:opacity-90"
          >
            <Image
              src="/admin_user/plus.svg"
              width={10}
              height={10}
              alt="plus"
            />
            Thêm mã khuyến mãi
          </button>
        </div>
      </div>
    </>
  );
}
