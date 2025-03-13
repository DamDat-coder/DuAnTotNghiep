"use client"; // Giữ "use client" nếu cần tương tác sau này, nếu không thì bỏ

import React, { useState } from "react";

export default function Banner() {
  // Nếu không dùng state, có thể bỏ useState. Thêm ví dụ nếu cần tương tác
  // const [isClicked, setIsClicked] = useState(false);

  return (
    // Phần banner chính
    <div className="banner flex flex-col items-start justify-evenly gap-5 px-6 py-0 max-w-md mx-auto tablet:max-w-2xl desktop:max-w-4xl">
      {/* Hình ảnh banner */}
      <img
        src="/banner/banner_1.png"
        alt="Áo khoác Gopcore Basic"
        className="w-full h-auto object-cover"
      />
      <div className="banner_content flex-col items-start justify-evenly gap-3" >
        <div className="banner_status text-base">Vừa ra mắt</div>

        {/* Tên sản phẩm */}
        <div className="banner_name text-xl font-bold text-gray-900 tablet:text-2xl desktop:text-3xl">
          Áo khoác Gopcore Basic
        </div>

        {/* Mô tả sản phẩm */}
        <div className="banner_description text-base text-gray-700 tablet:text-lg">
          Chào đón chương tiếp theo của Dynamic Air. Cảm nhận sự khác biệt.
        </div>
      </div>

      {/* Nút hành động */}
      <button className="banner_action px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors">
        Shop
      </button>
    </div>
  );
}
