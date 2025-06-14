"use client";

import { useState } from "react";
import Image from "next/image";
import AddUserModal from "./AddUserModal";

const options = [
  { value: "all", label: "Tất cả" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

export default function UserControlBar({
  onFilterChange,
  onSearchChange,
}: {
  onFilterChange: (val: string) => void;
  onSearchChange: (val: string) => void;
}) {
  const [selected, setSelected] = useState(options[0]);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFilter = (opt: (typeof options)[number]) => {
    setSelected(opt);
    setOpenDropdown(false);
    onFilterChange(opt.value);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    onSearchChange(val);
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
              placeholder="Tìm kiếm"
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-5 h-12 rounded-[12px] text-sm font-medium hover:opacity-90"
          >
            <Image
              src="/admin_user/plus.svg"
              width={10}
              height={10}
              alt="plus"
            />
            Thêm người dùng
          </button>
        </div>
      </div>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} />}
    </>
  );
}
