import { ColorOption } from "@/types/filter";

interface FilterColorProps {
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
}

const colorOptions: ColorOption[] = [
  { value: "Đen", label: "Đen", color: "#000000" },
  { value: "Xám", label: "Xám", color: "#808080" },
  { value: "Đỏ", label: "Đỏ", color: "#FF0000" },
  { value: "trắng", label: "Trắng", color: "#FFFFFF" },
];

export default function FilterColor({ selectedColor, setSelectedColor }: FilterColorProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Màu sắc</h3>
      <div className="grid grid-cols-3 gap-5 mt-2 justify-items-center">
        {colorOptions.map(({ value, label, color }) => {
          const isSelected = selectedColor === value;

          return (
            <button
              key={value}
              onClick={() => setSelectedColor(isSelected ? null : value)}
              className="flex flex-col items-center text-sm cursor-pointer text-center"
            >
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  color.toLowerCase() === "#ffffff"
                    ? "border-gray-600 border-2"
                    : "border-gray-400"
                }`}
                style={{ backgroundColor: color }}
              >
                {/* Hiển thị dấu check nếu được chọn */}
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${
                      value.toLowerCase() === "trắng" ? "text-black" : "text-white"
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
                )}
              </div>
              <span className="text-[0.875rem] font-bold mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
