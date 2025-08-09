import { Address } from "@/types/auth";

interface AddressSelectorProps {
  defaultAddress: Address | null;
  onClick: () => void;
}

export default function AddressSelector({
  defaultAddress,
  onClick,
}: AddressSelectorProps) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Địa chỉ giao hàng</h2>
      <div
        className="w-full border border-gray-300 rounded-md p-4 cursor-pointer hover:bg-gray-100"
        onClick={onClick}
      >
        {defaultAddress ? (
          <p className="text-gray-700">
            {defaultAddress.street}, {defaultAddress.ward}, {defaultAddress.province}, Việt Nam
          </p>
        ) : (
          <p className="text-gray-500">Chưa chọn địa chỉ mặc định</p>
        )}
        <button className="text-blue-600 mt-2">Thay đổi</button>
      </div>
    </div>
  );
}
