import { ReactNode, useState, useRef, useEffect } from "react";
import CouponControlBar from "./CouponControlBar";
import Image from "next/image";
import { Coupon } from "@/types/coupon";
import EditCouponModal from "./EditCouponModal";
import { toast } from "react-hot-toast";
import { hideCoupon, enableCoupon } from "@/services/couponApi";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Pagination } from "@/admin/components/ui/Panigation";

interface Props {
  coupons: Coupon[];
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  children?: (filtered: Coupon[]) => React.ReactNode;
  onDelete: (id: string) => void;
  onUpdate: (updater: (prev: Coupon[]) => Coupon[]) => void; // thêm prop onUpdate
}

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

export default function TableCouponWrapper({
  coupons,
  currentPage,
  totalPage,
  onPageChange,
  onDelete,
  children,
  onUpdate, // nhận thêm prop này từ cha
}: Props) {
  // State declarations
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmCouponId, setConfirmCouponId] = useState<string | null>(null);
  const [confirmActive, setConfirmActive] = useState<boolean>(true);

  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActionDropdownId(null);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  // Khi đổi trạng thái, cập nhật ngay coupon trong danh sách
  const performStatusChange = async (couponId: string, isActive: boolean) => {
    try {
      await toast.promise(
        isActive ? enableCoupon(couponId) : hideCoupon(couponId),
        {
          loading: isActive
            ? "Đang mở khóa mã giảm giá..."
            : "Đang ẩn mã giảm giá...",
          success: isActive
            ? "Đã mở khóa mã giảm giá thành công."
            : "Đã ẩn mã giảm giá thành công.",
          error: (err) => {
            if (err.message.includes("404")) {
              return "Mã giảm giá không tồn tại.";
            } else if (err.message.includes("400")) {
              return isActive
                ? "Mã giảm giá đã được mở khóa trước đó."
                : "Mã giảm giá đã được ẩn trước đó.";
            }
            return `Lỗi: ${
              err.message ||
              (isActive
                ? "Mở khóa mã giảm giá thất bại"
                : "Ẩn mã giảm giá thất bại")
            }`;
          },
        }
      );
      // Cập nhật trạng thái coupon ngay trong danh sách
      if (typeof onUpdate === "function") {
        onUpdate((prev) =>
          prev.map((c) =>
            c._id === couponId ? { ...c, is_active: isActive } : c
          )
        );
      }
    } catch (error: any) {
      console.error(`${isActive ? "Enable" : "Hide"} coupon failed:`, error);
    }
  };

  const onStatusChange = (couponId: string, isActive: boolean) => {
    setConfirmCouponId(couponId);
    setConfirmActive(isActive);
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowModal(true);
  };

  // Không dùng setCoupons nữa, chỉ gọi onDelete từ cha khi cần xóa

  // Filter coupons based on search and filter criteria (nếu cần filter ở FE)
  const filteredCoupons = coupons.filter((coupon) => {
    const matchFilter = filter === "all" || String(coupon.is_active) === filter;
    const code = coupon.code || "";
    const matchSearch = code.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Khi thêm/sửa thành công, reload lại trang
  const handleEditModalClose = (shouldReload: boolean = false) => {
    setShowModal(false);
    setSelectedCoupon(null);
  };

  return (
    <div className="space-y-4 mt-6">
      <CouponControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px] text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[177px] px-4 h-[64px] align-middle py-0 rounded-tl-[12px] rounded-bl-[12px]">
                Mã KM
              </th>
              <th className="w-[360px] px-4 h-[64px] align-middle py-0">
                Giảm giá
              </th>
              <th className="w-[224px] px-4 h-[64px] align-middle py-0">
                Thời gian
              </th>
              <th className="w-[134px] px-4 h-[64px] align-middle py-0">
                Lượt dùng
              </th>
              <th className="w-[105px] px-4 h-[64px] align-middle py-0">
                Trạng thái
              </th>
              <th className="w-[60px] px-4 h-[64px] align-middle py-0 rounded-tr-[12px] rounded-br-[12px]">
                <div className="flex items-center justify-end h-[64px]">
                  <Image
                    src="/admin_user/dots.svg"
                    width={24}
                    height={24}
                    alt="three_dot"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
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
                    onChange={(value) => onStatusChange(coupon._id, value)}
                  />
                </td>
                <td className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
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
                        alt="Actions menu"
                      />
                    </button>
                    {actionDropdownId === coupon._id && (
                      <div
                        ref={popupRef}
                        className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                          onClick={() => handleEditClick(coupon)}
                        >
                          Sửa
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {totalPage > 1 && (
              <>
                <tr>
                  <td colSpan={6} className="py-2">
                    <div className="w-full h-[1.5px] bg-gray-100 rounded"></div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="pt-4 pb-2">
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPage={totalPage}
                        onPageChange={onPageChange}
                      />
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        {showModal && selectedCoupon && (
          <EditCouponModal
            coupon={selectedCoupon}
            onClose={handleEditModalClose}
            onSave={(updatedCoupon) => {
              // Cập nhật coupon trong danh sách ngay khi sửa thành công
              if (typeof onUpdate === "function") {
                onUpdate((prev) =>
                  prev.map((c) =>
                    c._id === updatedCoupon._id ? updatedCoupon : c
                  )
                );
              }
            }}
          />
        )}
      </div>
      <ConfirmDialog
        open={!!confirmCouponId}
        title={`Bạn có chắc muốn ${
          confirmActive ? "mở khóa" : "ẩn"
        } mã giảm giá này?`}
        onConfirm={async () => {
          await performStatusChange(confirmCouponId!, confirmActive);
          setConfirmCouponId(null);
        }}
        onCancel={() => setConfirmCouponId(null)}
      />
      {children && children(filteredCoupons)}
    </div>
  );
}
