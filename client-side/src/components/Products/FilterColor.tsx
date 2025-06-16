import { ColorOption } from "@/types/filter";

interface FilterColorProps {
  selectedColor: string | null;
  setSelectedColor: (colorValue: string | null) => void;
}

const colorOptions: ColorOption[] = [
  { value: "Đen", label: "Đen", color: "#000000" },
  { value: "Xám", label: "Xanh da trời", color: "#87CEEB" },
  { value: "Đỏ", label: "Đỏ", color: "#FF0000" },
  { value: "trắng", label: "Trắng", color: "#FFFFFF" },
  // { value: "Đen", label: "Hồng", color: "#FFC0CB" },
  // { value: "Trắng", label: "Màu da", color: "#FAD2B6" },
  // { value: "Đỏ", label: "Nâu", color: "#8B4513" },
];

export default function FilterColor({ selectedColor, setSelectedColor }: FilterColorProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Màu sắc</h3>
      <div className="grid grid-cols-3 gap-5 mt-2 justify-items-center">
        {colorOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedColor(option.value === selectedColor ? null : option.value)}
            className="flex w-full flex-col items-center text-sm cursor-pointer text-center"
          >
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                option.value === "white" ? "border-gray-600 border-2" : "border-gray-400"
              } ${selectedColor === option.value ? "ring-2 ring-black" : ""}`}
              style={{ backgroundColor: option.color }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${
                  selectedColor === option.value
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
          </button>
        ))}
      </div>
    </div>
  );
}