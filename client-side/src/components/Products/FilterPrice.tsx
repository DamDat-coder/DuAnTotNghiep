// src/components/FilterPrice.tsx
import { PriceOption } from "@/types";

interface FilterPriceProps {
  selectedPrices: string[];
  handlePriceChange: (priceValue: string) => void;
}

const priceOptions: PriceOption[] = [
  { value: "0-100000", label: "Dưới 100.000₫" },
  { value: "100000-300000", label: "100.000₫ - 300.000₫" },
  { value: "300000-500000", label: "300.000₫ - 500.000₫" },
  { value: "500000+", label: "Trên 500.000₫" },
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