import { ReactNode } from "react";
import Image from "next/image";

export default function TableNewWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 mt-6">
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px] text-left font-description">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[130px] px-4 h-[64px] align-middle py-0 rounded-tl-[12px] rounded-bl-[12px]">
                Tác giả
              </th>
              <th className="w-[380px] px-4 h-[64px] align-middle py-0">
                Tiêu đề
              </th>
              <th className="w-[200px] px-4 h-[64px] align-middle py-0">
                Danh mục
              </th>
              <th className="w-[156px] px-4 h-[64px] align-middle py-0">
                Ngày đăng
              </th>
              <th className="w-[156px] px-4 h-[64px] align-middle py-0">
                Trạng thái
              </th>
              <th className="w-[56px] px-4 h-[64px] align-middle py-0 rounded-tr-[12px] rounded-br-[12px]">
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
