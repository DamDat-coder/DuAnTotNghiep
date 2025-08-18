"use client";
import { useState, useEffect } from "react";
import AddAddressModal from "../modals/AddAddressModal";
import EditAddressModal from "../modals/EditAddressModal";
import { Address } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAddress, updateAddress, fetchUser } from "@/services/userApi";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useAddressData } from "@/hooks/useAddressData";

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
  const [confirmAddressId, setConfirmAddressId] = useState<string | null>(null);
  const [isDefaultAddress, setIsDefaultAddress] = useState<boolean>(false);
  const [confirmDefaultId, setConfirmDefaultId] = useState<string | null>(null);
  const { provinces, wards } = useAddressData();

  // Sync addresses with user?.addresses when user changes
  useEffect(() => {
    if (user?.addresses) {
      // Sắp xếp để địa chỉ mặc định lên đầu
      const sorted = [...user.addresses].sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return 0;
      });
      setAddresses(sorted);
      setError(null);
      setLoading(false);
    } else if (user && !user.addresses) {
      setAddresses([]);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
      setError(null);
    }
  }, [user?.addresses]);

  // Khi xóa địa chỉ
  const onDelete = (address: Address) => {
    setConfirmAddressId(address._id);
    setIsDefaultAddress(address.is_default);
  };

  // Khi đặt mặc định
  const handleSetDefaultAddress = (address: Address) => {
    if (!user || !user.id) {
      toast.error("Không thể xác định người dùng.");
      return;
    }
    if (address.is_default) {
      toast.error("Địa chỉ này đã là mặc định, vui lòng chọn địa chỉ khác.");
      return;
    }
    setConfirmDefaultId(address._id);
  };

  // Hàm xử lý xóa địa chỉ
  const handleDeleteAddress = async (
    addressId: string,
    wasDefault: boolean
  ) => {
    if (!user) {
      toast.error("Không thể xác định người dùng.");
      return;
    }
    await deleteAddress(user.id, addressId);
    // Khi xóa địa chỉ
    let updatedAddresses = addresses.filter((addr) => addr._id !== addressId);
    if (wasDefault && updatedAddresses.length > 0) {
      // Đặt địa chỉ mới nhất làm mặc định
      const newest = updatedAddresses[updatedAddresses.length - 1];
      await updateAddress(user.id, newest._id, { ...newest, is_default: true });
      updatedAddresses = updatedAddresses.map((addr) =>
        addr._id === newest._id
          ? { ...addr, is_default: true }
          : { ...addr, is_default: false }
      );
    }
    // Sắp xếp lại
    const sortedAddresses = updatedAddresses.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return 0;
    });
    setAddresses(sortedAddresses);
    if (user) {
      setUser({
        ...user,
        id: user.id ?? "",
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role ?? "user",
        addresses: sortedAddresses,
        is_active: user.is_active ?? true, // Ensure is_active is always boolean
        wishlist: user.wishlist ?? [],
        active: user.active ?? true,
        defaultAddress: user.defaultAddress ?? "",
      });
      toast.success("Xóa địa chỉ thành công!"); // Thêm dòng này
    }
  };

  // Hàm xử lý đặt mặc định
  const handleSetDefault = async (addressId: string) => {
    const address = addresses.find((a) => a._id === addressId);
    if (!address) return;
    const updatedAddressData = {
      street: address.street,
      ward: address.ward,
      province: address.province,
      is_default: true,
    };
    if (!user) {
      toast.error("Không thể xác định người dùng.");
      return;
    }
    const result = await updateAddress(
      user.id,
      address._id,
      updatedAddressData
    );
    if (result) {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        is_default: addr._id === address._id,
      }));
      setAddresses(updatedAddresses);
      setUser({ ...user, addresses: updatedAddresses });
      onSelect(address);
      toast.success("Đặt địa chỉ mặc định thành công!"); // Thêm dòng này
    }
  };

  // Hàm xử lý chỉnh sửa địa chỉ
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowEditAddress(true);
  };

  // Helper lấy name_with_type
  const getProvinceWithType = (provinceName: string) => {
    const province = provinces.find((p) => p.name === provinceName);
    return province?.name_with_type || provinceName;
  };
  const getWardWithType = (wardName: string) => {
    const ward = wards.find((w) => w.name === wardName);
    return ward?.name_with_type || wardName;
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">ĐỊA CHỈ GIAO HÀNG</h1>
      <div>
        {loading ? (
          <p className="text-gray-500">Đang tải địa chỉ...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : addresses.length === 0 ? (
          <p className="text-gray-700 mb-6">
            Hiện tại bạn chưa lưu địa chỉ giao hàng nào. Hãy thêm địa chỉ ở đây
            để điền trước nhằm đặt hàng nhanh hơn.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  address.is_default
                    ? "hover:bg-green-600 hover:text-white rounded-lg"
                    : ""
                } transition duration-200`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    checked={address.is_default}
                    onChange={() => handleSetDefaultAddress(address)}
                    className="w-5 h-5 rounded-full text-black border-gray-400 accent-black mr-4"
                  />
                  <div
                    className="flex-1 text-sm"
                    onClick={() => handleEditAddress(address)}
                  >
                    {address.street},{" "}
                    {getWardWithType(address.ward)}, {getProvinceWithType(address.province)}
                  </div>
                  <div>
                    <button
                      onClick={() => onDelete(address)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
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
          onAdd={async (newAddress: Address) => {
            setShowAddAddress(false);
            const updatedUser = await fetchUser();
            if (updatedUser) {
              const sortedAddresses = [...(updatedUser.addresses ?? [])].sort((a, b) => {
                if (a.is_default && !b.is_default) return -1;
                if (!a.is_default && b.is_default) return 1;
                return 0;
              });
              setAddresses(sortedAddresses);
              setUser({ ...updatedUser, addresses: sortedAddresses });
            }
          }}
        />
      )}

      {showEditAddress && editingAddress && (
        <EditAddressModal
          address={editingAddress}
          onClose={() => setShowEditAddress(false)}
          onEdit={(updatedAddress: Address) => {
            const updatedAddresses = addresses.map((addr) => ({
              ...addr,
              ...(addr._id === updatedAddress._id ? updatedAddress : {}),
              is_default:
                addr._id === updatedAddress._id && updatedAddress.is_default
                  ? true
                  : addr.is_default && updatedAddress.is_default
                  ? false
                  : addr.is_default,
            }));
            // Sắp xếp lại
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
                role: user.role ?? "user",
                addresses: sortedAddresses,
              });
            }
            setShowEditAddress(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmAddressId}
        title={
          isDefaultAddress
            ? "Đây là địa chỉ mặc định. Bạn có chắc muốn xóa không?"
            : "Bạn có chắc muốn xóa địa chỉ này?"
        }
        description={
          isDefaultAddress
            ? "Nếu xóa, địa chỉ được thêm gần nhất sẽ thành mặc định."
            : undefined
        }
        onConfirm={async () => {
          await handleDeleteAddress(confirmAddressId!, isDefaultAddress);
          setConfirmAddressId(null);
        }}
        onCancel={() => setConfirmAddressId(null)}
      />
      <ConfirmDialog
        open={!!confirmDefaultId}
        title="Bạn có chắc muốn đặt địa chỉ này làm mặc định?"
        onConfirm={async () => {
          await handleSetDefault(confirmDefaultId!);
          setConfirmDefaultId(null);
        }}
        onCancel={() => setConfirmDefaultId(null)}
      />
    </div>
  );
}
