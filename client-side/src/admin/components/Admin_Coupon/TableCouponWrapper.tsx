import { ReactNode, useState, useRef, useEffect } from "react";
import CouponControlBar from "./CouponControlBar";
import Image from "next/image";
import { Coupon } from "@/types/coupon";
import EditCouponModal from "./EditCouponModal";
import { toast } from "react-hot-toast";
import { fetchCoupons, hideCoupon, enableCoupon } from "@/services/couponApi";

interface Props {
  filter: string;
  coupons: Coupon[];
  search: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onUpdate: React.Dispatch<React.SetStateAction<Coupon[]>>;
  children?: (filtered: Coupon[]) => React.ReactNode;
  onDelete: (id: string) => void;
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
  coupons: initialCoupons,
  onDelete,
  children,
}: Props) {
  // State declarations
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadCoupons = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCoupons(
          1,
          10,
          search,
          filter === "all"
            ? undefined
            : filter === "active"
            ? true
            : filter === "inactive"
            ? false
            : undefined
        );
        if (data && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        } else {
          console.error("No valid coupons data received");
          setCoupons([]);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
        setCoupons([]);
      }
      setIsLoading(false);
    };
    loadCoupons();
  }, [search, filter]);

  // Filter coupons based on search and filter criteria
  const filteredCoupons = coupons.filter((coupon) => {
    const matchFilter = filter === "all" || String(coupon.is_active) === filter;
    const code = coupon.code || "";
    const matchSearch = code.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

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

  const performStatusChange = async (couponId: string, isActive: boolean) => {
    try {
      // Optimistically update the coupon state
      setCoupons((prev) =>
        prev.map((coupon) =>
          coupon._id === couponId ? { ...coupon, is_active: isActive } : coupon
        )
      );

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
    } catch (error: any) {
      // Revert optimistic update on failure, except for 404 or 400 errors
      if (!error.message.includes("404") && !error.message.includes("400")) {
        setCoupons((prev) =>
          prev.map((coupon) =>
            coupon._id === couponId
              ? { ...coupon, is_active: !isActive }
              : coupon
          )
        );
      }
      console.error(`${isActive ? "Enable" : "Hide"} coupon failed:`, error);
    }
  };

  const onStatusChange = async (couponId: string, isActive: boolean) => {
    toast(
      (t) => (
        <div>
          <p>Bạn có chắc muốn {isActive ? "mở khóa" : "ẩn"} mã giảm giá này?</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
            <button
              className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              onClick={async () => {
                toast.dismiss(t.id);
                await performStatusChange(couponId, isActive);
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowModal(true);
  };

  const handleUpdateCoupon = (updatedCoupon: Coupon | null) => {
    if (!updatedCoupon) return;
    setCoupons((prev) =>
      prev.map((u) => (u._id === updatedCoupon._id ? updatedCoupon : u))
    );
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
            {filteredCoupons.map((coupon) => (
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
          </tbody>
        </table>
        {showModal && selectedCoupon && (
          <EditCouponModal
            coupon={selectedCoupon}
            onClose={() => {
              setShowModal(false);
              setSelectedCoupon(null);
            }}
            onSave={handleUpdateCoupon}
          />
        )}
      </div>
      {children && children(filteredCoupons)}
    </div>
  );
}
