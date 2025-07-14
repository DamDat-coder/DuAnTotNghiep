import * as React from "react";
import { useState, useEffect } from "react";
import { Address, IUser } from "@/types/auth";
import { fetchUserById, updateUser } from "@/services/userApi";
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
    role: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [originalRole, setOriginalRole] = useState("");
  const [isRoleChanged, setIsRoleChanged] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "Chưa có",
        role: user.role,
      });
      setOriginalRole(user.role);

      // Fetch addresses using user.id with fallback to user.addresses
      const fetchAddresses = async () => {
        try {
          const userData = await fetchUserById(user.id);
          // console.log("Fetched user data:", userData);
          if (userData && userData.addresses) {
            setAddresses(userData.addresses);
          } else {
            console.warn(
              "No addresses in fetched user data, using prop fallback"
            );
            setAddresses(user.addresses || []);
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
          toast.error(
            "Không thể tải địa chỉ người dùng, sử dụng dữ liệu hiện tại."
          );
          setAddresses(user.addresses || []); // Fallback to prop data
        }
      };

      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    // Debug: Log addresses to verify data
    console.log("EditUserModal - Addresses state:", addresses);
    console.log("EditUserModal - User object:", user);
    console.log("EditUserModal - User addresses:", user.addresses);
  }, [addresses, user]);

  // Xử lý địa chỉ để lấy 1 mặc định + 2 mới nhất (không trùng mặc định)
  const defaultAddress = addresses.find((a) => a.is_default);
  const otherAddresses = addresses
    .filter((a) => !a.is_default)
    .sort((a, b) => (b._id > a._id ? 1 : -1)); // mới nhất lên đầu

  const addressesToShow = [
    ...(defaultAddress ? [defaultAddress] : []),
    ...otherAddresses.slice(0, defaultAddress ? 2 : 3),
  ];

  const hasMore = addresses.length > addressesToShow.length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "role" && value !== originalRole) {
      setIsRoleChanged(true);
    } else if (name === "role") {
      setIsRoleChanged(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && isRoleChanged) {
      try {
        const updatedUser = await updateUser(user.id, { role: form.role });
        toast.success("Cập nhật thành công.");
        onUpdate(updatedUser);
        onClose(); // Close modal instead of reloading
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
                disabled
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
                disabled
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
                disabled
              />
            </div>
            {/* Address */}
            <div className="mb-8">
              <label className="block font-bold mb-4">Địa chỉ</label>
              {addressesToShow.length > 0 ? (
                addressesToShow.map((address, index) => (
                  <div
                    key={address._id || index}
                    className="p-2 border-b last:border-b-0 flex items-center"
                  >
                    <span
                      className={`flex-1${
                        address.is_default ? " text-green-600" : ""
                      }`}
                    >
                      {address.street || "Chưa có đường"},{" "}
                      {address.ward || "Chưa có phường/xã"},{" "}
                      {address.district || "Chưa có quận/huyện"},{" "}
                      {address.province || "Chưa có tỉnh/thành"}, Việt Nam
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Người dùng chưa có địa chỉ nào.</p>
              )}
              {hasMore && (
                <button
                  type="button"
                  className="mt-2 text-black underline"
                  onClick={() => setShowAllAddresses(true)}
                >
                  Xem tất cả địa chỉ
                </button>
              )}
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
              disabled={!isRoleChanged}
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
      {/* Popup hiện tất cả địa chỉ */}
      {showAllAddresses && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[450px] max-h-[80vh] overflow-y-auto p-6 relative">
            <h3 className="text-lg font-semibold mb-4">Tất cả địa chỉ</h3>
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setShowAllAddresses(false)}
            >
              Đóng
            </button>
            {[...addresses]
              .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
              .map((address, idx) => (
                <div
                  key={address._id || idx}
                  className="p-2 border-b last:border-b-0 flex items-center"
                >
                  <span
                    className={`flex-1${
                      address.is_default ? " text-green-600" : ""
                    }`}
                  >
                    {address.street || "Chưa có đường"},{" "}
                    {address.ward || "Chưa có phường/xã"},{" "}
                    {address.district || "Chưa có quận/huyện"},{" "}
                    {address.province || "Chưa có tỉnh/thành"}, Việt Nam
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
