"use client";
import React from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
}

export default function AddAddressModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Header: Title + Close button cùng hàng */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Thêm địa chỉ</h2>
          <button onClick={onClose} className="text-xl font-bold text-black">
            <Image
              src="/profile/Group.png"
              height={20}
              width={20}
              alt={"Delete Icon"}
            />
          </button>
        </div>

        <form className="space-y-3">
          <input
            type="text"
            placeholder="Họ và tên"
            className="w-full h-[47px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full h-[47px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            className="w-full h-[47px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            defaultValue=""
            className="w-full h-[47px] p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option disabled value="">
              Chọn tỉnh / thành
            </option>
          </select>

          <select
            defaultValue=""
            className="w-full h-[47px] p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option disabled value="">
              Chọn quận / huyện
            </option>
          </select>

          <select
            defaultValue=""
            className="w-full h-[47px] p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option disabled value="">
              Chọn phường / xã
            </option>
          </select>

          <input
            type="text"
            placeholder="Địa chỉ"
            className="w-full h-[47px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full mt-4 bg-black text-white py-2 rounded hover:bg-gray-700"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}
