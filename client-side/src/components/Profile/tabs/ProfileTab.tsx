"use client";
import { useEffect, useState } from "react";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAddressData } from "@/hooks/useAddressData";
import PhoneVerifyModal from "../modals/PhoneVerifyModal";
import { updateUser, addAddress, updateAddress } from "@/services/userApi";

export default function ProfileTab() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");
  const { user, setUser } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [province, setProvince] = useState("");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const {
    provinces,
    districts,
    wards,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
  } = useAddressData();
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      console.log(user);

      setName(user.name || "");
      setPhone(user.phone || "");
      const defaultAddress = user.addresses?.find((addr) => addr.is_default);

      // console.log(defaultAddress);

      if (defaultAddress) {
        setStreet(defaultAddress.street);
        setWard(defaultAddress.ward);
        setDistrict(defaultAddress.district);
        setProvince(defaultAddress.province);
        setIsDefaultAddress(defaultAddress.is_default);
      }
      // console.log("Địa chỉ của người dùng:", user.addresses);
    }
  }, [user]);

  // Hàm thêm địa chỉ
  const handleAddAddress = async () => {
    try {
      const addressData = {
        street,
        ward,
        district,
        province,
        is_default: isDefaultAddress,
      };
      const result = await addAddress(user?.id || "", addressData);
      if (result) {
        setAddresses(result.addresses || []);
        alert("Địa chỉ đã được thêm!");
      } else {
        alert("Có lỗi xảy ra khi thêm địa chỉ.");
      }
    } catch (error) {
      console.error("Thêm địa chỉ thất bại:", error);
      alert("Có lỗi xảy ra khi thêm địa chỉ.");
    }
  };

  // Hàm cập nhật địa chỉ
  const handleUpdateAddress = async (addressId: string) => {
    try {
      const addressData = {
        street,
        ward,
        district,
        province,
        is_default: isDefaultAddress,
      };
      const updatedUser = await updateAddress(
        user?.id || "",
        addressId,
        addressData
      );
      if (updatedUser) {
        alert("Cập nhật địa chỉ thành công!");
        setUser(updatedUser);
      } else {
        alert("Có lỗi xảy ra khi cập nhật địa chỉ.");
      }
    } catch (error) {
      console.error("Cập nhật địa chỉ thất bại:", error);
      alert("Có lỗi xảy ra khi cập nhật địa chỉ.");
    }
  };

  const handleSave = async () => {
    try {
      // Cập nhật thông tin người dùng
      const updatedUser = await updateUser(user?.id || "", {
        name,
        phone,
      });

      alert("Cập nhật thành công!");
      setUser(updatedUser);
    } catch (error) {
      console.error("Cập nhật người dùng thất bại:", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">HỒ SƠ CÁ NHÂN</h1>
      <div className="col-span-9 text-gray-500">
        <div className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Họ và tên"
          />

          <input
            type="text"
            value={email}
            disabled
            className="w-full p-2 border rounded text-gray-500 bg-gray-100 cursor-not-allowed"
            placeholder="Email"
          />

          <div>
            <label className="block font-medium mb-2">Password</label>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400">••••••••</span>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-black underline hover:text-gray-700 text-sm"
              >
                Sửa
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">Số điện thoại</label>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">{phone}</span>
              <button
                className="text-black underline hover:text-gray-700 text-sm"
                onClick={() => setShowPhoneModal(true)}
              >
                {phone ? "Đổi số điện thoại" : "Thêm số điện thoại"}
              </button>
            </div>
          </div>

          {showPhoneModal && (
            <PhoneVerifyModal
              userId={user?.id || ""}
              onClose={() => setShowPhoneModal(false)}
              initialPhone={phone}
              onVerified={(newPhone) => {
                setPhone(newPhone);
              }}
            />
          )}

          <div>
            <label className="block font-medium mb-4">Địa chỉ</label>
            <div className="space-y-4">
              {/* Tỉnh / Thành */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Tỉnh / Thành
                </label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => {
                    const selectedProvince = provinces.find(
                      (p) => p.name === e.target.value
                    );
                    setProvince(e.target.value);
                    setProvinceCode(selectedProvince?.code ?? null);
                    setDistrict("");
                    setWard("");

                    // Kiểm tra nếu districts có giá trị không
                    if (selectedProvince && selectedProvince.districts) {
                      setDistrict(selectedProvince.districts[0]?.name || ""); // Chọn quận mặc định
                    }
                  }}
                  className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn tỉnh / thành</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quận / Huyện */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Quận / Huyện
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => {
                    const selectedDistrict = districts.find(
                      (d) => d.name === e.target.value
                    );
                    setDistrict(e.target.value);
                    setDistrictCode(selectedDistrict?.code ?? null);
                    setWard(""); // Clear ward when changing district
                    // Kiểm tra nếu wards có giá trị không
                    if (selectedDistrict && selectedDistrict.wards) {
                      setWard(selectedDistrict.wards[0]?.name || ""); // Chọn phường mặc định
                    }
                  }}
                  disabled={!province} // Disable if no province is selected
                  className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn quận / huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phường / Xã */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Phường / Xã
                </label>
                <select
                  id="ward"
                  value={ward}
                  onChange={(e) => {
                    const selectedWard = wards.find(
                      (w) => w.name === e.target.value
                    );
                    setWard(e.target.value);
                    setWardCode(selectedWard?.code ?? null);
                  }}
                  disabled={!district} // Disable if no district is selected
                  className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn phường / xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Địa chỉ */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ (số nhà, tên đường...)"
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <button
              className="mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
              onClick={() => {
                handleSave();
                handleAddAddress();
              }}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
