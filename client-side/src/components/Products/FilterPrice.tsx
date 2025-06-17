import { PriceOption } from "@/types/filter";

interface FilterPriceProps {
  selectedPrice: string | null;
  setSelectedPrice: (priceValue: string) => void;
}

const priceOptions: PriceOption[] = [
  { value: "under-500k", label: "Dưới 500k" },
  { value: "500k-1m", label: "Từ 500k đến 1 triệu" },
  { value: "1m-2m", label: "Từ 1 triệu đến 2 triệu" },
  { value: "2m-4m", label: "Từ 2 triệu đến 4 triệu" },
  { value: "over-4m", label: "Từ 4 triệu trở lên" },
];

export default function FilterPrice({ selectedPrice, setSelectedPrice }: FilterPriceProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Giá cả</h3>
      <div className="flex flex-col gap-2 mt-2">
        {priceOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="price"
              value={option.value}
              checked={selectedPrice === option.value}
              onChange={() => setSelectedPrice(option.value)}
              className="h-4 w-4 accent-black focus:ring-black"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}