"use client";
import React from "react";

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
        <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl font-bold text-black"
        >
          ×
        </button>
        <input
          type="password"
          placeholder="Nhập mật khẩu cũ*"
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          placeholder="Nhập mật khẩu mới*"
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới*"
          className="w-full p-2 border rounded mb-4"
        />
        <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-700">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
