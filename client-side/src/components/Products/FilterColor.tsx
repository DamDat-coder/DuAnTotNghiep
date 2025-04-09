// src/components/FilterColor.tsx
import { ColorOption } from "@/types";

interface FilterColorProps {
  selectedColors: string[];
  handleColorChange: (colorValue: string) => void;
}

const colorOptions: ColorOption[] = [
  { value: "black", label: "Đen", color: "#000000" },
  { value: "cyan", label: "Xanh da trời", color: "#87CEEB" },
  { value: "red", label: "Đỏ", color: "#FF0000" },
  { value: "white", label: "Trắng", color: "#FFFFFF" },
  { value: "pink", label: "Hồng", color: "#FFC0CB" },
  { value: "color", label: "Màu da", color: "#FAD2B6" },
  { value: "brown", label: "Nâu", color: "#8B4513" },
];

export default function FilterColor({ selectedColors, handleColorChange }: FilterColorProps) {
  return (
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
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                option.value === "white" ? "border-gray-600 border-1 border-solid" : "border-gray-400"
              }`}
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
  );
}