"use client";
import { useState } from "react";
import AddAddressModal from "../AddAddressModal";

export default function AddressTab() {
  const [showAddAddress, setShowAddAddress] = useState(false);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">ĐỊA CHỈ GIAO HÀNG</h1>
      <div>
        <p className="text-gray-700 mb-6">
          Hiện tại bạn chưa lưu địa chỉ giao hàng nào. Hãy thêm địa chỉ ở đây để
          điền trước nhằm thanh toán nhanh hơn.
        </p>

        <div className="text-right">
          <button
            onClick={() => setShowAddAddress(true)}
            className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Thêm địa chỉ
          </button>
        </div>
      </div>
      {showAddAddress && (
        <AddAddressModal onClose={() => setShowAddAddress(false)} />
      )}
    </div>
  );
}
