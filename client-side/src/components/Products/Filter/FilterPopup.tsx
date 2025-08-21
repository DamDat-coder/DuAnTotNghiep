"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterSort from "./FilterSort";
import FilterCategory from "./FilterCategory";
import FilterPrice from "./FilterPrice";
import FilterColor from "./FilterColor";
import FilterSize from "./FilterSize";
import { FilterPopupProps, SortOption } from "@/types/filter";

function parseFiltersFromSearchParams(searchParams: URLSearchParams) {
  const sort_by = searchParams.get("sort_by");
  const id_cate = searchParams.get("id_cate");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const color = searchParams.get("color");
  const size = searchParams.get("size");

  const validSortOptions: SortOption[] = [
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "best_selling",
  ];
  let decodedColor = color;
  try {
    decodedColor = decodeURIComponent(decodeURIComponent(color || ""));
  } catch (e) {
    console.error("Error decoding color in FilterPopup:", e);
  }

  return {
    sort_by:
      sort_by && validSortOptions.includes(sort_by as SortOption)
        ? (sort_by as SortOption)
        : null,
    id_cate: id_cate || null,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    color: decodedColor || null,
    size: size || null,
  };
}

export default function FilterPopup({
  isOpen,
  setIsOpen,
  onApplyFilters,
  currentFilters,
}: FilterPopupProps) {
  const searchParams = useSearchParams();

  const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const parsed = parseFiltersFromSearchParams(searchParams);
      setSelectedSort(parsed.sort_by || currentFilters?.sort_by || null);
      setSelectedCategory(parsed.id_cate || currentFilters?.id_cate || null);
      setMinPrice(parsed.minPrice || currentFilters?.minPrice || null);
      setMaxPrice(parsed.maxPrice || currentFilters?.maxPrice || null);
      setSelectedColor(parsed.color || currentFilters?.color || null);
      setSelectedSize(parsed.size || currentFilters?.size || null);
      document.body.classList.add("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, searchParams, currentFilters]);

  const handleApply = () => {
    const filters = {
      sort_by: selectedSort || undefined,
      id_cate: selectedCategory || undefined,
      minPrice: minPrice !== null ? minPrice : undefined,
      maxPrice: maxPrice !== null ? maxPrice : undefined,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    };
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedSort(null);
    setSelectedCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedColor(null);
    setSelectedSize(null);
    onApplyFilters({});
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
          {/* Header */}
          <div className="flex justify-between items-center pt-[1.625rem] sticky top-0 bg-white z-10">
            <h2 className="text-base">Lọc sản phẩm</h2>
            <button
              type="button"
              className="text-black hover:text-gray-800"
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

          {/* Body filter content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <FilterSort
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
            <FilterCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <FilterPrice
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
            <FilterColor
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
            <FilterSize
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
            />

            {/* Footer button actions */}
            <div className="w-full sticky bottom-0 bg-white pb-3">
              <div className="flex p-4 justify-center gap-5">
                <button
                  onClick={clearFilters}
                  className="mt-2.5 w-[40%] py-2 text-sm font-medium text-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-black border"
                >
                  Xóa
                </button>
                <button
                  onClick={handleApply}
                  className="mt-2.5 w-[40%] py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black border-2 border-white"
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
