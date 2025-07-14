"use client";
import { useState, useEffect } from "react";
import AddAddressModal from "../modals/AddAddressModal";
import EditAddressModal from "../modals/EditAddressModal";
import { Address } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAddress, updateAddress } from "@/services/userApi";
import toast from "react-hot-toast";

interface AddressTabProps {
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
  onClose: () => void;
}

export default function AddressTab({
  selectedAddress,
  onSelect,
  onClose,
}: AddressTabProps) {
  const { user, setUser } = useAuth();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Sync addresses with user?.addresses when user changes
  useEffect(() => {
    if (user?.addresses) {
      // Sắp xếp địa chỉ: địa chỉ mặc định (is_default: true) lên đầu
      const sortedAddresses = [...user.addresses].sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return 0;
      });
      setAddresses(sortedAddresses);
      setLoading(false);
    } else {
      setError("Không thể tải địa chỉ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [user?.addresses]);

  // Hàm chọn địa chỉ làm mặc định với xác nhận
  const handleSetDefaultAddress = (address: Address) => {
    if (!user || !user.id) {
      toast.error("Không thể xác định người dùng.");
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col items-center gap-4">
          <span>Bạn có chắc muốn đặt địa chỉ này làm mặc định?</span>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={async () => {
                try {
                  // Cập nhật địa chỉ được chọn thành mặc định
                  const updatedAddressData = {
                    street: address.street,
                    ward: address.ward,
                    district: address.district,
                    province: address.province,
                    is_default: true,
                  };

                  const result = await updateAddress(
                    user.id,
                    address._id,
                    updatedAddressData
                  );
                  if (result) {
                    // Cập nhật danh sách địa chỉ: đặt is_default cho địa chỉ được chọn, các địa chỉ khác thành false
                    const updatedAddresses = addresses.map((addr) => ({
                      ...addr,
                      is_default: addr._id === address._id,
                    }));
                    // Sắp xếp lại để địa chỉ mặc định lên đầu
                    const sortedAddresses = [...updatedAddresses].sort(
                      (a, b) => {
                        if (a.is_default && !b.is_default) return -1;
                        if (!a.is_default && b.is_default) return 1;
                        return 0;
                      }
                    );
                    setAddresses(sortedAddresses);
                    if (user) {
                      setUser({
                        ...user,
                        id: user.id ?? "",
                        email: user.email ?? "",
                        name: user.name ?? "",
                        phone: user.phone ?? "",
                        role: user.role ?? "user",
                        // add other required IUser fields here if needed
                        addresses: sortedAddresses,
                      });
                    }
                    onSelect(address); // Gọi onSelect để cập nhật selectedAddress
                    toast.success("Đặt địa chỉ mặc định thành công!");
                  } else {
                    toast.error("Đặt địa chỉ mặc định thất bại.");
                  }
                } catch (error) {
                  toast.error("Lỗi khi đặt địa chỉ mặc định.");
                  console.error("Lỗi cập nhật địa chỉ:", error);
                }
                toast.dismiss(t.id);
              }}
            >
              Xác nhận
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const onDelete = async (addressId: string) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center gap-4">
          <span>Bạn có chắc muốn xóa địa chỉ này?</span>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={async () => {
                try {
                  if (!user || !user.id) {
                    toast.error("Không thể xác định người dùng.");
                  } else {
                    const result = await deleteAddress(user.id, addressId);
                    if (result) {
                      toast.success("Xóa địa chỉ thành công!");
                      const updatedAddresses = addresses.filter(
                        (addr) => addr._id !== addressId
                      );
                      setAddresses(updatedAddresses);
                      setUser({ ...user, id: user.id!, addresses: updatedAddresses });
                    } else {
                      toast.error("Xóa địa chỉ thất bại.");
                    }
                  }
                } catch (error) {
                  toast.error("Lỗi khi xóa địa chỉ.");
                }
                toast.dismiss(t.id);
              }}
            >
              Xóa
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowEditAddress(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">ĐỊA CHỈ GIAO HÀNG</h1>
      <div>
        {loading ? (
          <p className="text-gray-500">Đang tải địa chỉ...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : addresses.length === 0 ? (
          <p className="text-gray-700 mb-6">
            Hiện tại bạn chưa lưu địa chỉ giao hàng nào. Hãy thêm địa chỉ ở đây
            để điền trước nhằm thanh toán nhanh hơn.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  address.is_default ? "hover:bg-green-600 rounded-lg" : ""
                } transition duration-200`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    checked={selectedAddress?._id === address._id}
                    onChange={() => handleSetDefaultAddress(address)}
                    className="w-5 h-5 accent-black mr-4"
                  />
                  <div
                    className="flex-1 text-sm text-gray-700 " // Thêm hover cho địa chỉ nếu là mặc định
                    onClick={() => handleEditAddress(address)}
                  >
                    {address.street}, {address.ward}, {address.district},{" "}
                    {address.province}, Việt Nam
                  </div>
                  <button
                    onClick={() => onDelete(address._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-right">
          <button
            onClick={() => setShowAddAddress(true)}
            className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Thêm địa chỉ
          </button>
        </div>
      </div>

      {showAddAddress && (
        <AddAddressModal
          onClose={() => setShowAddAddress(false)}
          onAdd={(newAddress: Address) => {
            const updatedAddresses = [...addresses, newAddress];
            // Nếu địa chỉ mới là mặc định, đặt các địa chỉ khác thành không mặc định
            const finalAddresses = updatedAddresses.map((addr) => ({
              ...addr,
              is_default: addr._id === newAddress._id && newAddress.is_default,
            }));
            const sortedAddresses = finalAddresses.sort((a, b) => {
              if (a.is_default && !b.is_default) return -1;
              if (!a.is_default && b.is_default) return 1;
              return 0;
            });
            setAddresses(sortedAddresses);
            if (user) {
              if (user) {
                setUser({
                  ...user,
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  phone: user.phone,
                  role: user.role, // Ensure role is always defined
                  // add other required IUser fields here if needed
                  addresses: sortedAddresses,
                });
              }
            }
            setShowAddAddress(false);
          }}
        />
      )}

      {showEditAddress && editingAddress && (
        <EditAddressModal
          address={editingAddress}
          onClose={() => setShowEditAddress(false)}
          onEdit={(updatedAddress: Address) => {
            // Cập nhật danh sách địa chỉ, đảm bảo chỉ một địa chỉ mặc định
            const updatedAddresses = addresses.map((addr) => ({
              ...addr,
              ...(addr._id === updatedAddress._id ? updatedAddress : {}),
              is_default:
                addr._id === updatedAddress._id && updatedAddress.is_default
                  ? true
                  : false,
            }));
            const sortedAddresses = updatedAddresses.sort((a, b) => {
              if (a.is_default && !b.is_default) return -1;
              if (!a.is_default && b.is_default) return 1;
              return 0;
            });
            setAddresses(sortedAddresses);
            if (user) {
              setUser({
                ...user,
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role ?? "user", // Ensure role is always defined
                // add other required IUser fields here if needed
                addresses: sortedAddresses,
              });
            }
            setShowEditAddress(false);
          }}
        />
      )}
    </div>
  );
}
