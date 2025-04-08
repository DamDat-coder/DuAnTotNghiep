// src/components/FilterPopup.tsx
"use client";

import React, { useState } from "react";
import { IFilterPopupProps } from "../types";

export default function FilterPopup({ isOpen, setIsOpen }: IFilterPopupProps) {
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const sortOptions = [
    { value: "popular", label: "Phổ biến nhất" },
    { value: "priceLowToHigh", label: "Giá: Thấp đến cao" },
    { value: "priceHighToLow", label: "Giá: Cao đến thấp" },
    { value: "newest", label: "Mới nhất" },
  ];

  const genderOptions = [
    { value: "unisex", label: "Unisex" },
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
  ];

  const priceOptions = [
    { value: "0-100000", label: "Dưới 100.000₫" },
    { value: "100000-300000", label: "100.000₫ - 300.000₫" },
    { value: "300000-500000", label: "300.000₫ - 500.000₫" },
    { value: "500000+", label: "Trên 500.000₫" },
  ];

  const colorOptions = [
    { value: "black", label: "Đen", color: "#000000" },
    { value: "cyan", label: "Xanh da trời", color: "#87CEEB" },
    { value: "red", label: "Đỏ", color: "#FF0000" },
    { value: "white", label: "Trắng", color: "#FFFFFF" },
    { value: "pink", label: "Hồng", color: "#FFC0CB" },
    { value: "color", label: "Màu da", color: "#FAD2B6" },
    { value: "brown", label: "Nâu", color: "#8B4513" },
  ];

  const sizeOptions = ["Size S", "Size M", "Size L", "Size XL", "Size XXL", "Size 3XL"];

  const brandOptions = [
    { value: "nike", label: "Nike" },
    { value: "adidas", label: "Adidas" },
    { value: "puma", label: "Puma" },
    { value: "gucci", label: "Gucci" },
  ];

  const handlePriceChange = (priceValue: string) => {
    setSelectedPrices((prev) =>
      prev.includes(priceValue) ? prev.filter((p) => p !== priceValue) : [...prev, priceValue]
    );
  };

  const handleColorChange = (colorValue: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue) ? prev.filter((c) => c !== colorValue) : [...prev, colorValue]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleBrandChange = (brandValue: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandValue) ? prev.filter((b) => b !== brandValue) : [...prev, brandValue]
    );
  };

  const handleClearFilters = () => {
    setSelectedSort(null);
    setSelectedGender(null);
    setSelectedPrices([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
  };

  return (
    <>
      {/* Overlay cho desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 desktop:block hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? "translate-x-0 desktop:translate-x-0" : "translate-x-full desktop:translate-x-full"
        } desktop:inset-auto desktop:w-[25%] desktop:right-0 desktop:top-0 desktop:h-full`}
      >
        <div className="flex flex-col h-full gap-6 px-6">
          {/* Header */}
          <div className="flex justify-between items-center pt-[1.625rem] sticky top-0 bg-white z-10">
            <h2 className="text-base">Lọc sản phẩm</h2>
            <button
              type="button"
              className="text-black hover:text-gray-800 focus:ring-2 focus:ring-black focus:outline-none"
              onClick={() => setIsOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Nội dung cuộn */}
          <div className="flex-1 overflow-y-auto">
            {/* Sắp xếp theo */}
            <div className="flex flex-col gap-4 border-b pb-4">
              <h3 className="text-base font-bold">Sắp xếp theo</h3>
              <div className="flex flex-col gap-2 mt-2">
                {sortOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={selectedSort === option.value}
                      onChange={() => setSelectedSort(option.value)}
                      className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-4 border-b pb-4 mt-4">
              <h3 className="text-base font-bold">Giới tính</h3>
              <div className="flex flex-col gap-2 mt-2">
                {genderOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={selectedGender === option.value}
                      onChange={() => setSelectedGender(option.value)}
                      className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Giá cả */}
            <div className="flex flex-col gap-4 border-b pb-4 mt-4">
              <h3 className="text-base font-bold">Giá cả</h3>
              <div className="flex flex-col gap-2 mt-2">
                {priceOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={selectedPrices.includes(option.value)}
                      onChange={() => handlePriceChange(option.value)}
                      className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Màu sắc */}
            <div className="flex flex-col gap-4 border-b pb-4 mt-4">
              <h3 className="text-base font-bold">Màu sắc</h3>
              <div className="grid grid-cols-3 gap-5 mt-2 justify-items-center">
                {colorOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex w-full flex-col items-center text-sm cursor-pointer text-center"
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={selectedColors.includes(option.value)}
                      onChange={() => handleColorChange(option.value)}
                      className="hidden"
                    />
                    <div
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                      style={{ backgroundColor: option.color }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          selectedColors.includes(option.value)
                            ? option.value === "white"
                              ? "text-black"
                              : "text-white"
                            : "hidden"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-[0.875rem] font-bold flex flex-nowrap">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="flex flex-col gap-4 border-b pb-4 mt-4">
              <h3 className="text-base font-bold">Size</h3>
              <div className="grid grid-cols-4 gap-2 mt-2 justify-items-stretch min-w-0">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`w-full flex items-center justify-center text-base font-medium rounded border p-2 whitespace-nowrap ${
                      selectedSizes.includes(size) ? "border-black border-2" : "border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-4 border-b pb-4 mt-4">
              <h3 className="text-base font-bold">Brand</h3>
              <div className="flex flex-col gap-2 mt-2">
                {brandOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={selectedBrands.includes(option.value)}
                      onChange={() => handleBrandChange(option.value)}
                      className="h-4 w-4 accent-black focus:ring-black"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-full flex h-auto justify-center gap-5 pb-3">
              <button
                onClick={handleClearFilters}
                className="mt-2.5 w-[40%] py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black border-2"
              >
                Xoá
              </button>
              <button className="mt-2.5 w-[40%] py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black border-2 border-white">
                Lọc sản phẩm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}