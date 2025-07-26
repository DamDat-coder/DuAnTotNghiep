import React, { ReactNode, useEffect, useRef, useState } from "react";
import UserControlBar from "./UserControlBar";
import Image from "next/image";
import { IUser } from "@/types/auth";
import { fetchAllUsersAdmin, toggleUserStatus } from "@/services/userApi";
import EditUserModal from "./EditUserModal";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface Props {
  users: IUser[];
  filter: string;
  search: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onUpdate: React.Dispatch<React.SetStateAction<IUser[]>>;
  children?: (filtered: IUser[]) => React.ReactNode; // Made children optional
}

export default function TableWrapper({ users: initialUsers, children }: Props) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmActive, setConfirmActive] = useState<boolean>(true);
   const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const popupRef = useRef<HTMLDivElement | null>(null);

  // Fetch users with search and filter
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllUsersAdmin(
          search,
          1,
          10,
          filter === "all" ? undefined : filter
        );
        // console.log("fetchAllUsersAdmin response:", data);
        if (data && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("No valid users data received");
          setUsers([]);
        }
        console.log("Fetched users:", data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      }
      setIsLoading(false);
    };
    loadUsers();
  }, [search, filter]);

  // Handle clicks outside dropdown
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
    disabled,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
  }) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        disabled={disabled}
        className={`w-10 h-6 rounded-full transition relative focus:outline-none ${
          checked ? "bg-[#2563EB]" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={`absolute left-0 top-0 transition-all duration-200 w-6 h-6 bg-white rounded-full shadow ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    );
  }

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

  const onStatusChange = (userId: string, isActive: boolean) => {
    const targetUser = users.find((u) => u.id === userId);
    if (user?.role === "admin" && !isActive && targetUser?.role === "admin") {
      toast.error("Không thể khóa tài khoản admin khác.");
      return;
    }
    setConfirmUserId(userId);
    setConfirmActive(isActive);
  };

  const performStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const updatedUser = await toast.promise(
        toggleUserStatus(userId, isActive),
        {
          loading: "Đang cập nhật...",
          success: isActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.",
          error: (err) =>
            `Lỗi: ${err.message || "Cập nhật trạng thái thất bại"}`,
        }
      );

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u))
        );
        if (!isActive) {
          await sendEmailNotification(userId, updatedUser.email, isActive);
        }
      }
    } catch (error) {
      console.error("Status change failed:", error);
    }
  };

  const sendEmailNotification = async (
    userId: string,
    email: string,
    isActive: boolean
  ) => {
    console.log(
      `Gửi email thông báo cho ${email}: Tài khoản ${
        isActive ? "được mở khóa" : "bị khóa"
      }.`
    );
  };

  const handleEditClick = (user: IUser) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleUpdateUser = (updatedUser: IUser | null) => {
    if (!updatedUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  return (
    <div className="space-y-4 mt-6">
      <UserControlBar onFilterChange={setFilter} onSearchChange={setSearch} />
      <div className="overflow-x-auto bg-white rounded-2xl p-4 border">
        <table className="min-w-full text-[16px] text-left">
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
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className="border-b text-[#0F172A] font-[500] text-[16px] hover:bg-[#F9FAFB] transition-colors duration-150"
              >
                <td className="px-5 py-4">{index + 1}</td>
                <td className="px-5 py-4">{user.name}</td>
                <td className="px-5 py-4">{user.email}</td>
                <td className="px-5 py-4">{user.phone || "N/A"}</td>
                <td className="px-5 py-4 capitalize">{user.role}</td>
                <td className="px-5 py-4">
                  <SimpleSwitch
                    checked={user.is_active}
                    onChange={(value) => onStatusChange(user.id, value)}
                    disabled={isLoading || user.role === "admin"}
                  />
                </td>
                <td className="w-[64px] px-4 py-0 rounded-tr-[12px] rounded-br-[12px] align-middle relative">
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
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        {showModal && selectedUser && (
          <EditUserModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            user={selectedUser}
            onUpdate={handleUpdateUser}
          />
        )}
      </div>
      <ConfirmDialog
        open={!!confirmUserId}
        title={`Bạn có chắc muốn ${
          confirmActive ? "mở khóa" : "khóa"
        } tài khoản này?`}
        onConfirm={async () => {
          await performStatusChange(confirmUserId!, confirmActive);
          setConfirmUserId(null);
        }}
        onCancel={() => setConfirmUserId(null)}
      />
      {children && children(filteredUsers)}
    </div>
  );
}
