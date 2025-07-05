import { ReactNode, useEffect, useRef, useState } from "react";
import UserControlBar from "./UserControlBar";
import Image from "next/image";
import { IUser } from "@/types/auth";
import { fetchAllUsers, toggleUserStatus } from "@/services/userApi";
import EditUserModal from "./EditUserModal";

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

  const [states, setStates] = useState(users.map((u) => u.is_active));
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
    const loadUserStatus = async () => {
      const data = await fetchAllUsers();
      if (data) {
        setStates(data.map((user) => user.is_active));
      }
    };

    loadUserStatus();
  }, []);

  const handleStatusChange = async (
    index: number,
    userId: string,
    value: boolean
  ) => {
    const updatedStates = [...states];
    updatedStates[index] = value;
    setStates(updatedStates);

    const updatedUser = await toggleUserStatus(userId, value);

    if (!updatedUser) {
      updatedStates[index] = !value;
      setStates(updatedStates);
      alert("Cập nhật trạng thái thất bại");
    } else {
      console.log("Trạng thái người dùng sau khi cập nhật:", updatedUser);
    }
  };

  const handleEditClick = (user: IUser) => {
    setSelectedUser(user); // Lưu thông tin người dùng vào state
    setShowModal(true); // Mở modal
  };

  const handleUpdateUser = (updatedUser: IUser) => {
    // Cập nhật thông tin người dùng trong state
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    // Cập nhật lại state với danh sách người dùng mới
    // setUsers(updatedUsers); // Nếu bạn quản lý state users ở đây
  };
  return (
    <div className="space-y-4 mt-6">
      <UserControlBar onFilterChange={setFilter} onSearchChange={setSearch} />

      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px]  text-left">
          <thead className="bg-[#F8FAFC] text-[#94A3B8]">
            <tr className="overflow-hidden">
              <th className="w-[77px] px-4 h-[64px] align-middle py-0 rounded-tl-[12px] rounded-bl-[12px]">
                STT
              </th>
              <th className="w-[196px] h-[64px] align-middle px-4 py-0">
                Họ và tên
              </th>
              <th className="w-[291px] h-[64px] align-middle px-4 py-0">
                Email
              </th>
              <th className="w-[196px] h-[64px] align-middle px-4 py-0">SĐT</th>
              <th className="w-[135px] h-[64px] align-middle px-4 py-0">
                Vai trò
              </th>
              <th className="w-[96px] h-[64px] align-middle px-4 py-0">
                Trạng thái
              </th>
              <th className="w-[64px] h-[64px] align-middle px-4 py-0 rounded-tr-[12px] rounded-br-[12px]">
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
            {users.map((user, index) => (
              <tr
                key={user.id}
                className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
              >
                <td className="px-5 py-4">{index + 1}</td>
                <td className="px-5 py-4">{user.name}</td>
                <td className="px-5 py-4">{user.email}</td>
                <td className="px-5 py-4">{user.phone}</td>
                <td className="px-5 py-4 capitalize">{user.role}</td>
                <td className="px-5 py-4">
                  <SimpleSwitch
                    checked={states[index]}
                    onChange={(value) =>
                      handleStatusChange(index, user.id, value)
                    }
                  />
                </td>
                <th className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
                  <div className="flex items-center justify-end h-[64px]">
                    <button
                      className="focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionDropdownId(
                          actionDropdownId === user.id ? null : user.id
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
                    {/* Dropdown */}
                    {actionDropdownId === user.id && (
                      <div
                        ref={popupRef}
                        className="absolute right-2 top-14 z-50 min-w-[110px] rounded-lg bg-white shadow border border-gray-100 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[#2998FF] rounded-t-lg"
                          onClick={() => handleEditClick(user)}
                        >
                          Sửa
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
        {showModal && (
          <EditUserModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            user={selectedUser}
            onUpdate={handleUpdateUser}
          />
        )}
      </div>
    </div>
  );
}
