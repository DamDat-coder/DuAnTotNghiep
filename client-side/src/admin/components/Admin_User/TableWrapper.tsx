import { ReactNode, useEffect, useRef, useState } from "react";
import UserControlBar from "./UserControlBar";
import Image from "next/image";
import { IUser } from "@/types/auth";
import { fetchAllUsers, toggleUserStatus } from "@/services/userApi";
import EditUserModal from "./EditUserModal";
import toast from "react-hot-toast"; // Giả định import
import { useAuth } from "@/contexts/AuthContext"; // Giả định import

interface Props {
  users: IUser[];
  children: (filtered: IUser[]) => React.ReactNode;
}

export default function TableWrapper({ users, children }: Props) {
  const { user } = useAuth(); // Giả định lấy user hiện tại
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

  const handleStatusChange = async (userId: string, value: boolean) => {
    // Find the user in the original users array
    const userIndex = users.findIndex((u) => u.id === userId);
    const targetUser = users[userIndex];

    if (user?.role === "admin" && !value && targetUser?.role === "admin") {
      toast.error("Không thể khóa tài khoản admin khác.");
      return;
    }

    if (!value) {
      toast(
        (t) => (
          <div>
            <p>Bạn có chắc muốn khóa tài khoản này?</p>
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => toast.dismiss(t.id)}
              >
                Hủy
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={async () => {
                  toast.dismiss(t.id);
                  await performStatusChange(userIndex, userId, value);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    } else {
      await performStatusChange(userIndex, userId, value);
    }
  };

  const performStatusChange = async (
    index: number,
    userId: string,
    value: boolean
  ) => {
    const updatedStates = [...states];
    const originalValue = updatedStates[index];

    // Optimistically update UI
    updatedStates[index] = value;
    setStates(updatedStates);

    try {
      // Use toast.promise to avoid duplicate toasts
      const updatedUser = await toast.promise(toggleUserStatus(userId, value), {
        loading: "Đang cập nhật...",
        success: value ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.",
        error: (err) => `Lỗi: ${err.message || "Cập nhật trạng thái thất bại"}`,
      });

      if (!updatedUser) {
        // Rollback state if no user returned
        updatedStates[index] = originalValue;
        setStates(updatedStates);
        return;
      }

      // Send email notification for account lock
      if (!value) {
        await sendEmailNotification(userId, updatedUser.email, value);
      }
    } catch (error) {
      // Rollback state on error
      updatedStates[index] = originalValue;
      setStates(updatedStates);
    }
  };

  // Hàm giả định gửi email (cần triển khai trong services/userApi)
  const sendEmailNotification = async (
    userId: string,
    email: string,
    isActive: boolean
  ) => {
    // Giả định API gửi email, cần định nghĩa trong services/userApi
    // Ví dụ: await sendEmail({ to: email, subject: "Tài khoản bị khóa", body: "Tài khoản của bạn đã bị khóa." });
    console.log(
      `Gửi email thông báo cho ${email}: Tài khoản ${
        isActive ? "được mở khóa" : "bị khóa"
      }.`
    );
    // Thay console.log bằng API call thực tế
  };

  const handleEditClick = (user: IUser) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleUpdateUser = (updatedUser: IUser | null) => {
    if (!updatedUser) return;
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    // setUsers(updatedUsers); // Nếu bạn quản lý state users ở đây
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
                <td className="px-5 py-4">{user.phone}</td>
                <td className="px-5 py-4 capitalize">{user.role}</td>
                <td className="px-5 py-4">
                  <SimpleSwitch
                    checked={states[users.findIndex((u) => u.id === user.id)]}
                    onChange={(value) => handleStatusChange(user.id, value)}
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
