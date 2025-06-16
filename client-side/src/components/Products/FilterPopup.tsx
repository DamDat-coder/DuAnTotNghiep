"use client";

import { useEffect, useState } from "react";
import FilterSort from "./FilterSort";
import FilterCategory from "./FilterCategory";
import FilterPrice from "./FilterPrice";
import FilterColor from "./FilterColor";
import FilterSize from "./FilterSize";
import { IFilterPopupProps } from "@/types/filter";

export default function FilterPopup({
  isOpen,
  setIsOpen,
  onApplyFilters,
}: IFilterPopupProps) {
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        sort: selectedSort,
        id_cate: selectedCategory,
        priceRange: selectedPrice,
        color: selectedColor,
        size: selectedSize,
      });
    }
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedSort(null);
    setSelectedCategory(null);
    setSelectedPrice(null);
    setSelectedColor(null);
    setSelectedSize(null);
    if (onApplyFilters) {
      onApplyFilters({});
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 desktop:block laptop:block hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen
            ? "translate-x-0 laptop:translate-x-0 desktop:translate-x-0"
            : "translate-x-full laptop:translate-x-full desktop:translate-x-full"
        } laptop:inset-auto laptop:w-[35%] laptop:right-0 laptop:top-0 laptop:h-full desktop:inset-auto desktop:w-[25%] desktop:right-0 desktop:top-0 desktop:h-full`}
      >
        <div className="flex flex-col h-full gap-6 px-6">
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

          <div className="flex-1 overflow-y-auto">
            <FilterSort
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
            <FilterCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <FilterPrice
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
            <FilterColor
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
            <FilterSize
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
            />

            <div className="w-full sticky bottom-0 bg-white pb-3">
              <div className="flex p-4 justify-center gap-5">
                <button
                  onClick={clearFilters}
                  className="mt-2.5 w-[40%] py-2 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black border-2"
                >
                  Xóa
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="mt-2.5 w-[40%] py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black border-2 border-white"
                >
                  Lọc sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}