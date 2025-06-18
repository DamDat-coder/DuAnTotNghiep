import { Switch } from "@/components/ui/switch";
import { Sale } from "@/types/sale";
import Image from "next/image";

function SimpleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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


export default function SaleTableBody({
  sales,
  onToggleActive,
}: {
  sales: Sale[];
  onToggleActive: (id: number, newValue: boolean) => void;
}) {
  return (
    <>
      {sales.map((sale) => (
        <tr
          key={sale.id}
          className="border-b hover:bg-[#F9FAFB] transition-colors duration-150"
        >
          {/* Mã giảm giá */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.code}
          </td>

          {/* Mức giảm */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.discount}
          </td>

          {/* Thời gian */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.time}
          </td>

          {/* Số lượt sử dụng */}
          <td className="px-4 h-[64px] whitespace-normal break-words">
            {sale.usage}
          </td>

          {/* Trạng thái Switch */}
          <td className="px-5 py-4">
            <SimpleSwitch
              checked={sale.active}
              onChange={(value) => onToggleActive(sale.id, value)}
            />
          </td>

          {/* Hành động (3 chấm) */}
          <td className="w-[56px] px-4 h-[64px] rounded-tr-[12px] rounded-br-[12px]">
            <div className="flex items-center justify-end h-full">
              <Image
                src="/admin_user/dots.svg"
                width={24}
                height={24}
                alt="three_dot"
              />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
