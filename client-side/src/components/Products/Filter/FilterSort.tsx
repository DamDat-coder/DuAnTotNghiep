"use client";

import { SortOption } from "@/types/filter";

interface FilterSortProps {
  selectedSort: SortOption | null;
  setSelectedSort: (value: SortOption | null) => void;
}

// Danh sách các tùy chọn sắp xếp
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_asc", label: "Giá: Thấp đến Cao" },
  { value: "price_desc", label: "Giá: Cao đến Thấp" },
  { value: "best_selling", label: "Bán chạy nhất" },
];

export default function FilterSort({ selectedSort, setSelectedSort }: FilterSortProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Sắp xếp</h3>
      <div className="flex flex-col gap-2 mt-2">
        {/* Mặc định không chọn sắp xếp */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="sort"
            value=""
            checked={selectedSort === null}
            onChange={() => setSelectedSort(null)}
            className="h-4 w-4 accent-black focus:ring-black"
          />
          <span>Mặc định</span>
        </label>

        {/* Danh sách các lựa chọn */}
        {sortOptions.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={value}
              checked={selectedSort === value}
              onChange={() => setSelectedSort(value)}
              className="h-4 w-4 accent-black focus:ring-black"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
