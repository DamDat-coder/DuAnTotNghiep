import { useEffect, useState } from "react";

/*
 * ALTERNATIVE VIETNAMESE ADDRESS APIs (Updated after merging provinces):
 *
 * 1. provinces.open-api.vn (Current - RECOMMENDED)
 *    - Updated with merged provinces/cities
 *    - Free and reliable
 *    - Endpoints:
 *      - Provinces: https://provinces.open-api.vn/api/p/
 *      - Districts: https://provinces.open-api.vn/api/p/{province_code}?depth=2
 *      - Wards: https://provinces.open-api.vn/api/d/{district_code}?depth=2
 *
 * 2. esgoo.net API (Alternative)
 *    - https://esgoo.net/api-tinhthanh/1/0.htm (provinces)
 *    - https://esgoo.net/api-tinhthanh/2/{province_id}.htm (districts)
 *    - https://esgoo.net/api-tinhthanh/3/{district_id}.htm (wards)
 *
 * 3. API.mysupership.vn (Alternative)
 *    - https://api.mysupership.vn/v1/partner/areas/province
 *    - https://api.mysupership.vn/v1/partner/areas/district?province={province_code}
 *    - https://api.mysupership.vn/v1/partner/areas/commune?district={district_code}
 *
 * 4. donvi.vn API (Alternative)
 *    - https://donvi.vn/api/province
 *    - https://donvi.vn/api/district/{province_code}
 *    - https://donvi.vn/api/ward/{district_code}
 */

// Updated interfaces for the new API
interface Province {
  code: string;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  districts?: District[];
}

interface District {
  code: string;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  province_code: string;
  wards?: Ward[];
}

interface Ward {
  code: string;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  district_code: string;
}

export function useAddressData() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [wardCode, setWardCode] = useState<string | null>(null);

  // Thêm biến loading
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Lấy danh sách tỉnh/thành phố (updated after merging)
  useEffect(() => {
    setIsLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/p/")
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

  // Lấy danh sách quận/huyện dựa trên provinceCode
  useEffect(() => {
    if (provinceCode) {
      setIsLoadingDistricts(true);
      fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
          setDistrictCode(null);
          setWards([]);
          setWardCode(null);
          setIsLoadingDistricts(false);
        })
        .catch(() => {
          setDistricts([]);
          setWards([]);
          setIsLoadingDistricts(false);
        });
    } else {
      setDistricts([]);
      setWards([]);
      setIsLoadingDistricts(false);
    }
  }, [provinceCode]);

  // Lấy danh sách phường/xã dựa trên districtCode
  useEffect(() => {
    if (districtCode) {
      setIsLoadingWards(true);
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
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
  }, [districtCode]);

  // Helper functions to get names by code
  const getProvinceName = (code: string | null): string => {
    if (!code) return "";
    const province = provinces.find((p) => p.code === code);
    return province?.name || "";
  };

  const getDistrictName = (code: string | null): string => {
    if (!code) return "";
    const district = districts.find((d) => d.code === code);
    return district?.name || "";
  };

  const getWardName = (code: string | null): string => {
    if (!code) return "";
    const ward = wards.find((w) => w.code === code);
    return ward?.name || "";
  };

  // Helper function to get full address
  const getFullAddress = (street: string = ""): string => {
    const parts = [
      street,
      getWardName(wardCode),
      getDistrictName(districtCode),
      getProvinceName(provinceCode),
    ].filter(Boolean);
    return parts.join(", ");
  };

  const isLoadingAllAddress =
    isLoadingProvinces || isLoadingDistricts || isLoadingWards;

  return {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    wardCode,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
    getProvinceName,
    getDistrictName,
    getWardName,
    getFullAddress,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
    isLoadingAllAddress,
  };
}
