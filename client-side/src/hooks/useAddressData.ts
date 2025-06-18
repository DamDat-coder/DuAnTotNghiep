import { useEffect, useState } from "react";

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
  province_code: number;
}

interface Ward {
  code: number;
  name: string;
  district_code: number;
}

export function useAddressData() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (provinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts);
          setDistrictCode(null); // reset khi đổi tỉnh
          setWards([]);
          setWardCode(null);
        })
        .catch(() => {
          setDistricts([]);
          setWards([]);
        });
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [provinceCode]);

  useEffect(() => {
    if (districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards);
          setWardCode(null); // reset khi đổi quận
        })
        .catch(() => setWards([]));
    } else {
      setWards([]);
    }
  }, [districtCode]);

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
  };
}
