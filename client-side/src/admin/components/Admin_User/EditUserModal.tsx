import * as React from "react";
import { useState, useEffect } from "react";
import { IUser } from "@/types/auth";
import { updateUser } from "@/services/userApi";
import Image from "next/image";
import toast from "react-hot-toast";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onUpdate: (updatedUser: IUser | null) => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditUserModalProps) {
  if (!isOpen || !user) return null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    role: "",
  });

  const [originalRole, setOriginalRole] = useState(""); // Lưu giá trị ban đầu của role
  const [isRoleChanged, setIsRoleChanged] = useState(false); // Kiểm tra xem role có thay đổi hay không

  // Pre-populate the form with user data when it changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "Chưa có",
        province: user.addresses?.[0]?.province || "",
        district: user.addresses?.[0]?.district || "",
        ward: user.addresses?.[0]?.ward || "",
        address: user.addresses?.[0]?.street || "",
        role: user.role,
      });

      // Lưu giá trị ban đầu của role
      setOriginalRole(user.role);
    }
  }, [user]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Kiểm tra nếu role có thay đổi
    if (e.target.name === "role" && e.target.value !== originalRole) {
      setIsRoleChanged(true);
    } else {
      setIsRoleChanged(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user && isRoleChanged) {
      const updatedUser = { ...user, role: form.role };

      try {
        const updatedData = await updateUser(user.id, { role: form.role });
        console.log("update:", updatedData);

        toast.success("Cập nhật thành công.");
        onUpdate(updatedData);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Lỗi cập nhật người dùng:", error);
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại.");
        onUpdate(null);
      }
    } else {
      toast("Không có thay đổi nào để lưu.");
      onUpdate(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-br-[16px] rounded-bl-[16px] shadow-xl w-[613px] max-w-full max-h-[90vh] overflow-y-auto pb-10 relative">
        {/* Header */}
        <div className="pl-6 pr-6">
          <div className="flex justify-between items-center h-[73px]">
            <h2 className="text-lg font-semibold">Chỉnh sửa người dùng</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#F8FAFC] rounded-[8px] flex items-center justify-center"
            >
              <Image
                src="/admin_user/group.svg"
                width={10}
                height={10}
                alt="close"
              />
            </button>
          </div>
        </div>
        <div className="w-full h-px bg-[#E7E7E7] mb-3" />
        {/* Form */}
        <div className="pl-6 pr-6">
          <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-8">
              <label className="block font-bold mb-4">
                Họ tên<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled // Do not allow name editing
              />
            </div>
            {/* Email */}
            <div className="mb-8">
              <label className="block mb-4 font-bold">
                Email<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                disabled // Do not allow email editing
              />
            </div>
            {/* Phone */}
            <div className="mb-8">
              <label className="block font-bold mb-4">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                className="w-full h-[56px] px-4 border border-[#E2E8F0] rounded-[12px]"
                disabled // Display phone but do not allow editing
              />
            </div>
            {/* Address */}
            <div className="mb-8">
              <label className="block font-semibold mb-4">Nhập địa chỉ</label>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label className="text-gray-500 text-sm mb-1 block">
                    Tỉnh / Thành
                  </label>
                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className="w-full h-[56px] px-4 pr-10 border border-[#B0B0B0] rounded-[4px] appearance-none"
                  >
                    <option value="">Chọn tỉnh / thành</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                  </select>
                  <Image
                    src="/admin_user/Vector.svg"
                    width={14}
                    height={14}
                    alt="arrow down"
                    className="absolute right-3 top-[calc(50%+10px)] transform -translate-y-1/2 pointer-events-none"
                  />
                </div>

                <div className="relative">
                  <label className="text-gray-500 text-sm mb-1 block">
                    Quận / Huyện
                  </label>
                  <select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full h-[56px] px-4 border border-[#B0B0B0] rounded-[4px] appearance-none"
                  >
                    <option value="">Chọn quận / huyện</option>
                  </select>
                  <Image
                    src="/admin_user/Vector.svg"
                    width={14}
                    height={14}
                    alt="arrow down"
                    className="absolute right-3 top-[calc(50%+10px)] transform -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-gray-500 text-sm mb-1 block">
                    Phường / Xã
                  </label>
                  <select
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    className="w-full h-[56px] px-4 border border-[#B0B0B0] rounded-[4px] appearance-none"
                  >
                    <option value="">Chọn phường / xã</option>
                  </select>
                  <Image
                    src="/admin_user/Vector.svg"
                    width={14}
                    height={14}
                    alt="arrow down"
                    className="absolute right-3 top-[calc(50%+10px)] transform -translate-y-1/2 pointer-events-none"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-sm mb-1 block">
                    Địa chỉ
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                    className="w-full h-[56px] px-4 border border-[#888888] rounded-[4px]"
                    disabled
                  />
                </div>
              </div>
            </div>
            {/* Role */}
            <div>
              <label className="block font-bold mb-2">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full h-[56px] px-4 pr-10 border border-[#E2E8F0] rounded-lg appearance-none"
              >
                <option value="">Chọn role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white h-[56px] rounded-lg font-semibold hover:opacity-90 mt-6"
              disabled={!isRoleChanged} // Disable button if role is not changed
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
