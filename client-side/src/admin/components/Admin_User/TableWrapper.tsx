import { ReactNode, useState } from "react";
import UserControlBar from "./UserControlBar";
import Image from "next/image";
import { IUser } from "@/types/auth";

interface Props {
  users: IUser[];
  children: (filtered: IUser[]) => React.ReactNode;
}

export default function TableWrapper({ users, children }: Props) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

const filteredUsers = users.filter((user) => {
  const matchFilter = filter === "all" || user.role === filter;
  const name = user.name || "";
  const email = user.email || "";
  const matchSearch =
    name.toLowerCase().includes(search.toLowerCase()) ||
    email.toLowerCase().includes(search.toLowerCase());
  return matchFilter && matchSearch;
});


  return (
    <div className="space-y-4 mt-6">
      <UserControlBar onFilterChange={setFilter} onSearchChange={setSearch} />

      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[77px] px-4 py-0 rounded-tl-[12px] rounded-bl-[12px]">
                STT
              </th>
              <th className="w-[196px] px-4 py-0">Họ và tên</th>
              <th className="w-[291px] px-4 py-0">Email</th>
              <th className="w-[196px] px-4 py-0">SĐT</th>
              <th className="w-[135px] px-4 py-0">Vai trò</th>
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
          <tbody>{children(filteredUsers)}</tbody>
        </table>
      </div>
    </div>
  );
}
