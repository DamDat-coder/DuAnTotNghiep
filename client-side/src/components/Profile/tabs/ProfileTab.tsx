import { useState } from "react";
import ChangePasswordModal from "../ChangePasswordModal";

export default function ProfileTab() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">HỒ SƠ CÁ NHÂN</h1>

      <div className="col-span-9 text-gray-500">
        <div className="space-y-6">
          {/* Họ và tên */}
          <div>
            <label className="block font-medium mb-2">Họ và tên</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập họ tên"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-2">Email</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-gray-300
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              placeholder:text-gray-400"
              disabled
              placeholder="910.hanhuttan.pch@gmail.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-2">Password</label>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400">••••••••</span>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-black underline hover:text-gray-700 text-sm"
              >
                Sửa
              </button>
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block font-medium mb-2">Số điện thoại</label>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600"></span>
              <button className="text-black underline hover:text-gray-700 text-sm">
                Thêm
              </button>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block font-medium mb-4">Địa chỉ</label>
            <div className="space-y-4">
              {/* Tỉnh / Thành */}
              <div className="space-y-1">
                <div className="text-sm text-gray-300 font-medium">
                  Tỉnh / Thành
                </div>
                <select
                  defaultValue=""
                  className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="province"
                >
                  <option disabled value="">
                    Chọn tỉnh / thành
                  </option>
                </select>
              </div>

              {/* Quận / Huyện */}
              <div className="space-y-1">
                <div className="text-sm text-gray-400 font-medium">
                  Quận / Huyện
                </div>
                <select
                  defaultValue=""
                  className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="district"
                >
                  <option disabled value="">
                    Chọn quận / huyện
                  </option>
                </select>
              </div>

              {/* Phường / Xã */}
              <div className="space-y-1">
                <div className="text-sm text-gray-400 font-medium">
                  Phường / Xã
                </div>
                <select
                  defaultValue=""
                  className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="ward"
                >
                  <option disabled value="">
                    Chọn phường / xã
                  </option>
                </select>
              </div>

              {/* Địa chỉ chi tiết */}
              <div className="space-y-1">
                <div className="text-sm text-gray-400 font-medium">Địa chỉ</div>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <button className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
