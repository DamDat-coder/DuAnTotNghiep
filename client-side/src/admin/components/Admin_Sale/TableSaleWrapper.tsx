import { ReactNode } from "react";
import SaleControls from "./SaleControlBar";
import Image from "next/image";

export default function TableSaleWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 mt-6">
      <SaleControls />

      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[180px] px-4 py-0 rounded-tl-[12px] rounded-bl-[12px]">
                Mã KM
              </th>
              <th className="w-[368px] px-4 py-0">Giảm giá</th>
              <th className="w-[230px] px-4 py-0">Thời gian</th>
              <th className="w-[140px] px-4 py-0">Lượt dùng</th>
              <th className="w-[96px] px-4 py-0">Trạng thái</th>
              <th className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px]">
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

          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
