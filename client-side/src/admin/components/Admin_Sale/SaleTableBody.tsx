import { Switch } from "@/components/ui/switch";
import { Sale } from "@/types/sale";

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
          <td className="w-[180px] px-4 py-4 font-medium">{sale.code}</td>
          <td className="w-[368px] px-4 py-4">{sale.discount}</td>
          <td className="w-[230px] px-4 py-4">{sale.time}</td>
          <td className="w-[140px] px-4 py-4">{sale.usage}</td>
          <td className="w-[96px] px-4 py-4">
            <Switch
              checked={sale.active}
              onCheckedChange={(value) => onToggleActive(sale.id, value)}
              className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors data-[state=checked]:bg-[#2563EB] bg-gray-300"
            >
              <span className="pointer-events-none absolute left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 data-[state=checked]:translate-x-6" />
            </Switch>
          </td>
          <td className="w-[64px] px-4 py-4 text-right">
            <span className="text-xl font-semibold text-gray-500">...</span>
          </td>
        </tr>
      ))}
    </>
  );
}
