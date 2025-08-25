"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateAddress } from "@/services/userApi";
import { Address } from "@/types/auth";
import { ClipLoader } from "react-spinners";
import { useAddressData } from "@/hooks/useAddressData";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Chống SSR cho react-leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const LocationPicker = dynamic(
  async () => {
    const { useMapEvents } = await import("react-leaflet");
    return function LocationPicker({
      onSelect,
    }: {
      onSelect: (lat: number, lng: number) => void;
    }) {
      useMapEvents({
        click(e) {
          onSelect(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    };
  },
  { ssr: false }
);

// Fix icon Marker khi build
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface Props {
  address: Address;
  onClose: () => void;
  onEdit: (updatedAddress: Address) => void;
}

export default function EditAddressModal({ address, onClose, onEdit }: Props) {
  const { user } = useAuth();
  const {
    provinces,
    wards,
    setProvinceCode,
    setWardCode,
    isLoadingAllAddress,
  } = useAddressData();

  // Pre-populate form data with address prop
  const [formData, setFormData] = useState({
    street: address.street,
    province: address.province.replace("Thành phố ", "").replace("Tỉnh ", ""),
    ward: address.ward.replace("Phường ", "").replace("Xã ", ""),
    isDefaultAddress: address.is_default,
  });

  // Set province and ward codes based on initial address
  useEffect(() => {
    const provinceObj = provinces.find(
      (p) =>
        p.name_with_type === address.province || p.name === address.province
    );
    if (provinceObj) {
      setProvinceCode(provinceObj.code);
    }

    const wardObj = wards.find(
      (w) => w.name_with_type === address.ward || w.name === address.ward
    );
    if (wardObj) {
      setWardCode(wardObj.code);
    }
  }, [provinces, wards, address.province, address.ward]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "province") {
      const selectedProvince = provinces.find((p) => p.name === value);
      setProvinceCode(selectedProvince?.code ?? null);
      setFormData((prev) => ({ ...prev, ward: "" }));
      setWardCode(null);
    } else if (name === "ward") {
      const selectedWard = wards.find((w) => w.name === value);
      setWardCode(selectedWard?.code ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để chỉnh sửa địa chỉ.");
      return;
    }

    if (!formData.province) {
      toast.error("Vui lòng chọn tỉnh/thành phố.");
      return;
    }
    if (!formData.ward) {
      toast.error("Vui lòng chọn phường/xã.");
      return;
    }
    if (!formData.street) {
      toast.error("Vui lòng nhập địa chỉ.");
      return;
    }

    setIsSubmitting(true);

    const provinceObj = provinces.find(
      (p) =>
        p.name === formData.province ||
        p.name_with_type === `Thành phố ${formData.province}` ||
        p.name_with_type === `Tỉnh ${formData.province}`
    );
    const wardObj = wards.find(
      (w) =>
        w.name === formData.ward ||
        w.name_with_type === `Phường ${formData.ward}` ||
        w.name_with_type === `Xã ${formData.ward}`
    );

    const addressData = {
      street: formData.street,
      ward: wardObj?.name_with_type || formData.ward,
      province: provinceObj?.name_with_type || formData.province,
      is_default: formData.isDefaultAddress,
    };

    try {
      const result = await updateAddress(user.id, address._id, addressData);
      if (result) {
        toast.success("Chỉnh sửa địa chỉ thành công!");
        onEdit({
          _id: address._id,
          street: addressData.street,
          ward: addressData.ward,
          province: addressData.province,
          is_default: addressData.is_default,
        });
        onClose();
      } else {
        toast.error("Thêm địa chỉ thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi thêm địa chỉ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.street && formData.province && formData.ward;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm state cho map
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [wardRawFromMap, setWardRawFromMap] = useState<string>("");

  // ===== Reverse geocode OSM =====
  const getAddressFromLatLng = async (lat: number, lng: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`
    );
    if (!res.ok) return null;
    return res.json();
  };

  function normalizeFromNominatim(addr: any) {
    const houseNumber = addr.house_number || "";
    const street =
      addr.road || addr.residential || addr.neighbourhood || addr.hamlet || "";
    const fullStreet = houseNumber ? `${houseNumber} ${street}` : street;

    const provinceRaw = addr.state || addr.province || addr.city || "";
    const wardRaw =
      addr.suburb ||
      addr.village ||
      addr.town ||
      addr.city_district ||
      addr.county ||
      "";

    return { street: fullStreet, provinceRaw, wardRaw };
  }

  const normalizeName = (name: string) =>
    name
      .replace(/^(Tỉnh|Thành phố|Phường|Xã|Thị trấn)\s+/i, "")
      .trim()
      .toLowerCase();

  // Khi chọn trên bản đồ:
  const handleMapClick = async (lat: number, lng: number) => {
    setMapPosition({ lat, lng });
    const result = await getAddressFromLatLng(lat, lng);
    if (!result || !result.address) {
      toast.error("Không lấy được địa chỉ từ vị trí đã chọn.");
      return;
    }

    const { street, provinceRaw, wardRaw } = normalizeFromNominatim(
      result.address
    );

    const provinceObj =
      provinces.find(
        (p) => normalizeName(p.name) === normalizeName(provinceRaw)
      ) ||
      provinces.find((p) =>
        normalizeName(p.name_with_type).endsWith(normalizeName(provinceRaw))
      );

    setFormData((prev) => ({
      ...prev,
      street: street || prev.street,
      province: provinceObj?.name || provinceRaw,
      ward: "", // reset ward, sẽ set lại sau
    }));
    setProvinceCode(provinceObj?.code ?? null);
    setWardRawFromMap(wardRaw); // lưu lại wardRaw để xử lý sau

    setShowMap(false);
    toast.success("Đã chọn địa chỉ từ bản đồ!");
  };

  // Auto set ward khi wards thay đổi
  useEffect(() => {
    if (!wardRawFromMap || wards.length === 0) return;
    const wardObj =
      wards.find(
        (w) => normalizeName(w.name) === normalizeName(wardRawFromMap)
      ) ||
      wards.find((w) =>
        normalizeName(w.name_with_type).endsWith(normalizeName(wardRawFromMap))
      );
    if (wardObj) {
      setFormData((prev) => ({
        ...prev,
        ward: wardObj.name,
      }));
      setWardCode(wardObj.code);
      setWardRawFromMap(""); // reset để tránh lặp lại
    }
  }, [wards, wardRawFromMap]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
      <div className="bg-white w-[536px] max-w-full mobile:w-full rounded-lg shadow-lg p-[48px] mobile:p-3 max-h-[90vh] mobile:max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-[24px]">
          <h2 className="text-[24px] mobile:text-[18px] font-bold text-black leading-[36px]">
            Chỉnh sửa địa chỉ
          </h2>
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center"
          >
            <Image src="/profile/Group.png" alt="Đóng" width={20} height={20} />
          </button>
        </div>

        {isLoadingAllAddress ? (
          <div className="flex flex-col items-center py-8">
            <ClipLoader color="#36d7b7" size={40} />
            <div className="mt-4 text-sm text-gray-500">
              Đang tải dữ liệu địa chỉ...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <input
              type="text"
              name="street"
              placeholder="Địa chỉ"
              value={formData.street}
              onChange={handleChange}
              className="w-[440px] mobile:w-full h-[47px] px-3 border border-gray-300 rounded-[4px] mb-[16px] text-sm"
              required
            />

            <div className="relative w-[440px] mobile:w-full mb-[16px]">
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
                required
              >
                <option value="">Chọn tỉnh / thành</option>
                {provinces.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Image
                src="/profile/Vector (Stroke).svg"
                alt="Dropdown icon"
                width={16}
                height={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            <div className="relative w-[440px] mobile:w-full mb-[16px]">
              <select
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                disabled={!formData.province}
                className="w-full h-[47px] px-3 pr-10 border border-gray-300 rounded-[4px] text-sm text-gray-600 appearance-none"
                required
              >
                <option value="">Chọn phường / xã</option>
                {wards.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Image
                src="/profile/Vector (Stroke).svg"
                alt="Dropdown icon"
                width={16}
                height={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            <label className="flex items-center w-[440px] mobile:w-full mb-[16px]">
              <input
                type="checkbox"
                name="isDefaultAddress"
                checked={formData.isDefaultAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDefaultAddress: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              Đặt làm địa chỉ mặc định
            </label>

            <div className="flex gap-2 w-full flex-col mobile:flex-col mobile:gap-2 laptop:flex-row">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-[220px] mobile:w-full h-[40px] mt-[8px] rounded-[8px] text-sm text-[#F5F5F5] ${
                  isSubmitting || !isFormValid
                    ? "bg-gray-400"
                    : "bg-black hover:bg-opacity-90"
                }`}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="w-[220px] mobile:w-full h-[40px] mt-[8px] rounded-[8px] text-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Chọn trên bản đồ
              </button>
            </div>
          </form>
        )}

        {showMap && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl w-full max-w-[900px] mobile:max-w-full p-4 relative">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Chọn vị trí giao hàng</h4>
                <button
                  onClick={() => setShowMap(false)}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Đóng
                </button>
              </div>
              <div className="w-full h-[520px] mobile:h-[300px] rounded-xl overflow-hidden">
                <MapContainer
                  center={mapPosition ?? { lat: 10.7769, lng: 106.7009 }}
                  zoom={14}
                  style={{ width: "100%", height: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationPicker onSelect={handleMapClick} />
                  {mapPosition && <Marker position={mapPosition} />}
                </MapContainer>
              </div>
              <div className="text-sm mt-2 text-gray-500">
                Nhấn vào bản đồ để chọn vị trí.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
