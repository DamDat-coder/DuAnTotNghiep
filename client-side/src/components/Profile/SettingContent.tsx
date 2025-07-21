"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void; // Đổi tên prop
}

export default function SettingsContent({ activeTab, onTabChange }: Props) {
  const accountTabs = ["Hồ sơ", "Địa chỉ", "Yêu thích"];
  const [showAccountMenu, setShowAccountMenu] = useState(true);

  return (
    <div className="p-4 text-black bg-white">
      <h1 className="text-2xl font-semibold mb-10">Cài đặt</h1>

      <div className="mb-6">
        <div
          className="flex items-center justify-between font-semibold mb-2 cursor-pointer"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/profile/user.svg"
              alt="User icon"
              width={20}
              height={20}
            />
            <span>Tài khoản</span>
          </div>
        </div>

        {showAccountMenu && (
          <ul className="space-y-2 ml-4 mt-2">
            {accountTabs.map((item) => (
              <li
                key={item}
                className="py-2 border-b border-gray-200 last:border-0"
              >
                <button
                  onClick={() => onTabChange(item)} // Đổi lại
                  className={`relative text-left
                    ${activeTab === item ? "text-black" : "text-gray-400"}
                    hover:text-black
                    laptop:after:content-['']
                    laptop:after:absolute
                    laptop:after:bottom-0
                    laptop:after:left-0
                    laptop:after:w-full
                    laptop:after:h-[2px]
                    laptop:after:bg-black
                    laptop:after:transform
                    laptop:after:origin-left
                    laptop:after:transition-transform
                    laptop:after:duration-500
                    ${
                      activeTab === item
                        ? "laptop:after:scale-x-100"
                        : "laptop:after:scale-x-0 laptop:hover:after:scale-x-100"
                    }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mục Đơn hàng */}
      <div className="mb-6">
        <button
          onClick={() => onTabChange("Đơn hàng")} // Đổi lại
          className="flex items-center gap-2 font-semibold text-black"
        >
          <Image
            src="/profile/file-text.svg"
            alt="Order icon"
            width={20}
            height={20}
          />
          <span>Đơn hàng</span>
        </button>
      </div>
    </div>
  );
}
