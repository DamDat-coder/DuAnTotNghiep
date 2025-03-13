"use client"; // Đánh dấu đây là Client Component để dùng React hooks như useState

import React, { useState } from "react";

// Định nghĩa interface cho props của Header
interface HeaderProps {
  title: string; // Tiêu đề truyền vào từ component cha (dù hiện tại dùng logo)
}

// Component Header nhận props title
export default function Header({ title }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false); // State để kiểm soát menu mobile (mở/đóng)

  return (
    // Phần navbar chính
    <nav className="bg-white text-black"> {/* Đổi text-black để hiển thị rõ trên nền trắng */}
      {/* Container chính của navbar */}
      <div className="container mx-auto px-4">
        {/* Thanh điều hướng cố định cao 16 (64px), căn giữa và phân bố đều */}
        <div className="flex h-16 items-center justify-between">
          {/* Phần logo bên trái */}
          <div className="flex items-center">
            <img src="/nav/logo.svg" alt="Logo" className="h-auto w-10%" />
          </div>

          {/* Phần CTA bên phải */}
          <div className="cta">
            {/* Container cho hamburger và nav_lookup, xếp ngang */}
            <div className="flex items-center space-x-[0.75rem] tablet:hidden">
              {/* Hình nav_lookup */}
              <a href="#"><img src="/nav/nav_lookup.svg" alt="Nav Lookup" className="h-6 w-auto" /> </a> {/* Cao 24px */}
              <a href="#"><img src="/nav/nav_user.svg" alt="Nav user" className="h-6 w-auto" /> </a> 
              <a href="#"><img src="/nav/nav_cart.svg" alt="Nav cart" className="h-6 w-auto" /> </a> 
              <button
                type="button"
                className=" text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)} // Khi nhấn, đảo ngược trạng thái isOpen
              >
                {/* Icon hamburger (hiện khi menu đóng) */}
               <img src="/nav/nav_bugger.svg" alt="" />
                {/* Icon đóng (hiện khi menu mở) */}
              </button>
            </div>

            {/* Menu cho tablet/desktop (hiển thị từ 768px trở lên) */}
            <div className="hidden tablet:flex space-x-4">
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Dashboard
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Team
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Projects
              </a>
            </div>

            {/* Menu mobile fullscreen */}
            <div
              className={`fixed inset-0 bg-gray-800 transform transition-transform duration-300 ease-in-out z-50 tablet:hidden ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Nút đóng menu mobile */}
              <button
                type="button"
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:outline-none"
                onClick={() => setIsOpen(false)} // Khi nhấn, đóng menu
              >
                <svg
                  className="size-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Danh sách các link trong menu mobile */}
              <div className="flex flex-col h-full justify-center items-center space-y-6">
                <a
                  href="#"
                  className="text-xl font-medium text-white hover:bg-gray-700 px-4 py-2 rounded"
                  onClick={() => setIsOpen(false)} // Đóng menu khi nhấn
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-xl font-medium text-white hover:bg-gray-700 px-4 py-2 rounded"
                  onClick={() => setIsOpen(false)} // Đóng menu khi nhấn
                >
                  Team
                </a>
                <a
                  href="#"
                  className="text-xl font-medium text-white hover:bg-gray-700 px-4 py-2 rounded"
                  onClick={() => setIsOpen(false)} // Đóng menu khi nhấn
                >
                  Projects
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}