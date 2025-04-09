// src/components/FilterBrand.tsx
import { BrandOption } from "@/types";

interface FilterBrandProps {
  selectedBrands: string[];
  handleBrandChange: (brandValue: string) => void;
}

const brandOptions: BrandOption[] = [
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
  { value: "puma", label: "Puma" },
  { value: "gucci", label: "Gucci" },
];

export default function FilterBrand({ selectedBrands, handleBrandChange }: FilterBrandProps) {
  return (
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
  );
}