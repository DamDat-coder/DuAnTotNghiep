"use client";
import { useState } from "react";
import DeleteSuccessModal from "../modals/DeleteSuccessModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";

export default function DeleteTab() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">XÓA TÀI KHOẢN</h1>
      <div>
        <p className="mb-4 text-gray-700">
          Bạn có chắc chắn muốn xóa hồ sơ của mình? Bạn hiện đang được hưởng các
          quyền lợi:
        </p>

        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Miễn phí đổi trả cho tất cả đơn hàng</li>
          <li>Thanh toán nhanh chóng mỗi lần mua sắm</li>
          <li>Danh sách Yêu thích cá nhân để lưu sản phẩm</li>
          <li>Theo dõi đơn hàng dễ dàng</li>
        </ul>

        <p className="mb-2 text-gray-700">Khi bạn xóa hồ sơ của mình:</p>

        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>
            Bạn sẽ không còn truy cập được vào hồ sơ Thành viên hoặc tài khoản.
          </li>
          <li>Thông tin đơn hàng chỉ có thể được cung cấp qua bộ phận CSKH.</li>
          <li>Dữ liệu trên ứng dụng và các nền tảng khác sẽ bị gỡ hoặc ẩn.</li>
          <li>Thông tin chia sẻ trên mạng xã hội sẽ không bị ảnh hưởng.</li>
        </ul>

        <p className="mb-6 text-gray-700">
          Nếu bạn chắc chắn muốn tiếp tục, hãy xác nhận để xóa hồ sơ của mình
          vĩnh viễn.
        </p>

        <div className="text-right">
          <button
            className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
            onClick={() => setShowConfirmModal(true)}
          >
            Xóa tài khoản
          </button>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showConfirmModal && (
        <ConfirmDeleteModal
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Modal thành công */}
      {showSuccessModal && (
        <DeleteSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </div>
  );
}
