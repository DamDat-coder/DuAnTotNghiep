import { API_BASE_URL } from "@/services/api";
import { useEffect, useState } from "react";

// Đơn giản hóa interface cho dữ liệu 2 cấp
interface Province {
  code: string;
  name: string;
  [key: string]: any;
}

interface Ward {
  code: string;
  name: string;
  parent_code: string;
  [key: string]: any;
}

export function useAddressData() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [wardCode, setWardCode] = useState<string | null>(null);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    setIsLoadingProvinces(true);
    fetch(`${API_BASE_URL}/address/provinces`)
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data || []);
        setIsLoadingProvinces(false);
      })
      .catch(() => {
        setProvinces([]);
        setIsLoadingProvinces(false);
      });
  }, []);

  // Lấy danh sách phường/xã theo mã tỉnh/thành phố
  useEffect(() => {
    if (provinceCode) {
      setIsLoadingWards(true);
      fetch(`${API_BASE_URL}/address/wards/${provinceCode}`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data || []);
          setWardCode(null);
          setIsLoadingWards(false);
        })
        .catch(() => {
          setWards([]);
          setIsLoadingWards(false);
        });
    } else {
      setWards([]);
      setIsLoadingWards(false);
    }
  }, [provinceCode]);

  // Helper functions
  const getProvinceName = (code: string | null): string => {
    if (!code) return "";
    const province = provinces.find((p) => p.code === code);
    return province?.name || "";
  };

  const getWardName = (code: string | null): string => {
    if (!code) return "";
    const ward = wards.find((w) => w.code === code);
    return ward?.name || "";
  };

  const getFullAddress = (street: string = ""): string => {
    const parts = [
      street,
      getWardName(wardCode),
      getProvinceName(provinceCode),
    ].filter(Boolean);
    return parts.join(", ");
  };

  const isLoadingAllAddress = isLoadingProvinces || isLoadingWards;

  return {
    provinces,
    wards,
    provinceCode,
    wardCode,
    setProvinceCode,
    setWardCode,
    getProvinceName,
    getWardName,
    getFullAddress,
    isLoadingProvinces,
    isLoadingWards,
    isLoadingAllAddress,
  };
}
