import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Sale } from "@/types/sale";

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

function DropdownMenu({ onClose }: { onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
        onClick={onClose}
      >
        Sửa
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#F75555] rounded-b-lg"
        onClick={onClose}
      >
        Xoá
      </button>
    </div>
  );
}

export default function SaleTableBody({
  sales,
  onToggleActive,
}: {
  sales: Sale[];
  onToggleActive: (id: string, newValue: boolean) => void;
}) {
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);

  if (sales.length === 0) {
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
      {sales.map((sale) => (
        <tr
          key={sale.id || sale.code}
          className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
        >
          {/* Mã giảm giá */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.code}
          </td>

          {/* Mức giảm */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.description}
          </td>

          {/* Thời gian */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {new Date(sale.startDate).toLocaleDateString("vi-VN")} -{" "}
            {new Date(sale.endDate).toLocaleDateString("vi-VN")}
          </td>

          {/* Số lượt sử dụng */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.usedCount}/{sale.usageLimit}
          </td>

          {/* Trạng thái Switch */}
          <td className="px-5 py-4">
            <SimpleSwitch
              checked={sale.status === "active"}
              onChange={(value) => onToggleActive(sale.id, value)}
            />
          </td>

          {/* Hành động */}
          <td className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
            <div className="flex items-center justify-end h-[64px]">
              <button
                className="focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionDropdownId(
                    actionDropdownId === sale.id ? null : sale.id
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

              {actionDropdownId === sale.id && (
                <DropdownMenu onClose={() => setActionDropdownId(null)} />
              )}
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
