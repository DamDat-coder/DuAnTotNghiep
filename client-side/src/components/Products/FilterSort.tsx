// src/components/FilterSort.tsx
import { SortOption } from "@/types";

interface FilterSortProps {
  selectedSort: string | null;
  setSelectedSort: (value: string) => void;
}

const sortOptions: SortOption[] = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "priceLowToHigh", label: "Giá: Thấp đến cao" },
  { value: "priceHighToLow", label: "Giá: Cao đến thấp" },
  { value: "newest", label: "Mới nhất" },
];

export default function FilterSort({ selectedSort, setSelectedSort }: FilterSortProps) {
  return (
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
  );
}