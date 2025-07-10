import { deleteCoupon, updateCouponStatus } from "@/services/couponApi";
import { Coupon } from "@/types/coupon";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import EditCouponModal from "./EditCouponModal";
import toast from "react-hot-toast";

function SimpleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      className={`w-10 h-6 rounded-full transition relative focus:outline-none ${
        checked ? "bg-[#2563EB]" : "bg-gray-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`absolute left-0 top-0 transition-all duration-200 w-6 h-6 bg-white rounded-full shadow ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function DropdownMenu({
  couponId,
  onEdit,
  onDeleteConfirm,
  setActionDropdownId,
}: {
  couponId: string;
  onEdit: () => void;
  onDeleteConfirm: () => void;
  setActionDropdownId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setActionDropdownId]);

  return (
    <div
      ref={menuRef}
      className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
        onClick={() => {
          onEdit();
          setActionDropdownId(null);
        }}
      >
        Sửa
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
        onClick={() => {
          onDeleteConfirm();
          setActionDropdownId(null);
        }}
      >
        Xoá
      </button>
    </div>
  );
}

const deleteConfirmation = async (
  couponId: string,
  onDelete: () => void,
  onCancel: () => void
) => {
  if (window.confirm("Bạn có chắc muốn xóa mã giảm giá này?")) {
    try {
      await deleteCoupon(couponId);
      alert("Mã giảm giá đã được xóa thành công!");
      onDelete();
    } catch (error) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      alert("Xóa mã giảm giá thất bại!");
    }
  } else {
    onCancel();
  }
};

export default function CouponTableBody({
  coupons,
  onToggleActive,
  onCouponsChange,
  onEditCoupon,
}: {
  coupons: Coupon[];
  onToggleActive: (id: string, newValue: boolean) => void;
  onCouponsChange: (newCoupons: Coupon[]) => void;
  onEditCoupon: (coupon: Coupon) => void;
}) {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const handleEdit = (coupon: Coupon) => {

    setSelectedCoupon(coupon);

    onEditCoupon(coupon);

  };

  const handleSave = (updatedCoupon: Coupon) => {
    onCouponsChange(
      coupons.map((c) => (c._id === updatedCoupon._id ? updatedCoupon : c))
    );
    setSelectedCoupon(null);
  };

  const handleDeleteConfirm = (couponId: string) => {
    deleteConfirmation(
      couponId,
      () => {
        onCouponsChange(coupons.filter((c) => c._id !== couponId));
      },
      () => setActionDropdownId(null)
    );
  };

  const handleToggleActive = async (id: string, newValue: boolean) => {
    try {
      await toast.promise(updateCouponStatus(id, newValue), {
        loading: "Đang cập nhật trạng thái...",
        success: "Cập nhật trạng thái thành công!",
        error: "Cập nhật trạng thái thất bại!",
      });
      onCouponsChange(
        coupons.map((coupon) =>
          coupon._id === id ? { ...coupon, is_active: newValue } : coupon
        )
      );
    } catch (err: any) {
      // Không cần toast.error ở đây nữa vì toast.promise đã xử lý
    }
  };

  if (coupons.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="text-center py-8 text-gray-500">
          Không có mã giảm giá nào.
        </td>
      </tr>
    );
  }

  return (
    <>
      {coupons.map((coupon) => (
        <tr
          key={coupon._id}
          className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {coupon.code}
          </td>
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {coupon.description || "Không có mô tả"}
          </td>
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {new Date(coupon.startDate).toLocaleDateString("vi-VN")} -{" "}
            {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
          </td>
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {coupon.usedCount}/{coupon.usageLimit || "Không giới hạn"}
          </td>
          <td className="px-5 py-4">
            <SimpleSwitch
              checked={coupon.is_active}
              onChange={(value) => handleToggleActive(coupon._id, value)}
            />
          </td>
          <td className="w-[60px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
            <div className="flex items-center justify-end h-[64px]">
              <button
                className="focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionDropdownId(
                    actionDropdownId === coupon._id ? null : coupon._id
                  );
                }}
              >
                <Image
                  src="/admin_user/dots.svg"
                  width={24}
                  height={24}
                  alt="three_dot"
                />
              </button>
              {actionDropdownId === coupon._id && (
                <DropdownMenu
                  couponId={coupon._id}
                  onEdit={() => handleEdit(coupon)}
                  onDeleteConfirm={() => handleDeleteConfirm(coupon._id)}
                  setActionDropdownId={setActionDropdownId}
                />
              )}
            </div>
          </td>
        </tr>
      ))}

      {selectedCoupon && (
        <EditCouponModal
          coupon={selectedCoupon}
          onSave={handleSave}
          onClose={() => setSelectedCoupon(null)}
        />
      )}
    </>
  );
}

      


