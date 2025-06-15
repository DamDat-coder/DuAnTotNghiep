// src/components/FilterPrice.tsx
import { PriceOption } from "@/types";

interface FilterPriceProps {
  selectedPrices: string[];
  handlePriceChange: (priceValue: string) => void;
}

const priceOptions: PriceOption[] = [
  { value: "0-500000", label: "Dưới 500k" },
  { value: "500000-1000000", label: "Từ 500k đến 1 triệu" },
  { value: "1000000-2000000", label: "Từ 1 triệu đến 2 triệu" },
  { value: "2000000-4000000", label: "Từ 2 triệu đến 4 triệu" },
  { value: "4000000+", label: "Từ 4 triệu trở lên" },
];

export default function FilterPrice({ selectedPrices, handlePriceChange }: FilterPriceProps) {
  return (
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
  );
}