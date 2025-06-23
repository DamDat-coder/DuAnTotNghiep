"use client";
import { useEffect, useState } from "react";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAddressData } from "@/hooks/useAddressData";
import PhoneVerifyModal from "../modals/PhoneVerifyModal";
import { updateUser } from "@/services/userApi";

export default function ProfileTab() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [province, setProvince] = useState("");

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
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone ?? "");
      const defaultAddress = user.addresses?.find((a) => a.is_default);
      if (defaultAddress) {
        setStreet(defaultAddress.street || "");
        setDistrict(defaultAddress.district || "");
        setWard(defaultAddress.ward || "");
        setProvince(defaultAddress.province || "");

        const selectedProvince = provinces.find(
          (p) => p.name === defaultAddress.province
        );
        const selectedDistrict = districts.find(
          (d) => d.name === defaultAddress.district
        );
        const selectedWard = wards.find((w) => w.name === defaultAddress.ward);
        setProvinceCode(selectedProvince?.code ?? null);
        setDistrictCode(selectedDistrict?.code ?? null);
        setWardCode(selectedWard?.code ?? null);
      }
    }
  }, [
    user,
    provinces,
    districts,
    wards,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
  ]);

  const handleSave = async () => {
    const updated = await updateUser({
      name,
      phone,
      addresses: [
        {
          street,
          ward,
          district,
          province,
          is_default: true,
        },
      ],
    });

    if (updated) {
      alert("Cập nhật thành công!");
      // Có thể cập nhật lại context user tại đây nếu cần
    } else {
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
                {phone ? "Sửa" : "Thêm"}
              </button>
            </div>
          </div>

          {showPhoneModal && (
            <PhoneVerifyModal
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
              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Tỉnh / Thành
                </label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => {
                    const selected = provinces.find(
                      (p) => p.name === e.target.value
                    );
                    setProvince(e.target.value);
                    setProvinceCode(selected?.code ?? null);
                    setDistrict("");
                    setWard("");
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

              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Quận / Huyện
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => {
                    const selected = districts.find(
                      (d) => d.name === e.target.value
                    );
                    setDistrict(e.target.value);
                    setDistrictCode(selected?.code ?? null);
                    setWard("");
                  }}
                  disabled={!province}
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

              <div className="space-y-1">
                <label className="text-sm text-gray-700 font-medium">
                  Phường / Xã
                </label>
                <select
                  id="ward"
                  value={ward}
                  onChange={(e) => {
                    const selected = wards.find(
                      (w) => w.name === e.target.value
                    );
                    setWard(e.target.value);
                    setWardCode(selected?.code ?? null);
                  }}
                  disabled={!district}
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
              onClick={handleSave}
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
