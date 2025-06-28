"use client";

import { Address } from "@/types/auth";
import { motion, AnimatePresence } from "framer-motion";

interface AddressPopupProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
  onClose: () => void;
}

export default function AddressPopup({
  addresses,
  selectedAddress,
  onSelect,
  onClose,
}: AddressPopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 w-full max-w-[65%]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4">Chọn địa chỉ giao hàng</h2>
          <div className="max-h-96 overflow-y-auto">
            {addresses.length === 0 ? (
              <p className="text-gray-500">Chưa có địa chỉ nào.</p>
            ) : (
              addresses.map((address) => (
                <label
                  key={address._id}
                  className="flex items-center p-2 border-b border-gray-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress?._id === address._id}
                    onChange={() => onSelect(address)}
                    className="mr-2"
                  />
                  <span>
                    {address.street}, {address.ward}, {address.district},{" "}
                    {address.province}, Việt Nam
                    {address.is_default && (
                      <span className="ml-2 text-green-600">(Mặc định)</span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
