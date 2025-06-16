import { Switch } from "@/components/ui/switch";
import { Sale } from "@/types/sale";
import Image from "next/image";

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
          <td className="px-4 h-[64px]">
            <Switch
              checked={sale.active}
              onCheckedChange={(value) => onToggleActive(sale.id, value)}
              className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors data-[state=checked]:bg-[#2563EB] bg-gray-300"
            >
              <span className="pointer-events-none absolute left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 data-[state=checked]:translate-x-6" />
            </Switch>
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
