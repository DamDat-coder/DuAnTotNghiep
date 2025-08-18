import { API_BASE_URL } from "@/services/api";
import React, { createContext, useContext, useEffect, useState } from "react";

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

interface AddressDataContextType {
  provinces: Province[];
  wards: Ward[];
  loading: boolean;
}

const AddressDataContext = createContext<AddressDataContextType>({
  provinces: [],
  wards: [],
  loading: true,
});

export function AddressDataProvider({ children }: { children: React.ReactNode }) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/address/provinces`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/address/wards/all`).then((res) => res.json()),
    ]).then(([provincesData, wardsData]) => {
      setProvinces(provincesData || []);
      setWards(wardsData || []);
      setLoading(false);
    });
  }, []);

  return (
    <AddressDataContext.Provider value={{ provinces, wards, loading }}>
      {children}
    </AddressDataContext.Provider>
  );
}

export function useAddressDataContext() {
  return useContext(AddressDataContext);
}