"use client";

import { useEffect } from "react";

interface ColorSelectorProps {
  colors: { name: string; hex: string }[];
  selectedColor: string | null;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string | null) => void;
  availableSizes: string[];
}

export default function ColorSelector({
  colors,
  selectedColor,
  setSelectedColor,
  setSelectedSize,
  availableSizes,
}: ColorSelectorProps) {
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedColor && !availableSizes.includes(selectedColor)) {
      setSelectedSize(null);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Màu sắc</h3>
      <div className="flex gap-3 flex-wrap">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          const tickColor = color.hex === "#FFFFFF" ? "black" : "white";
          return (
            <div
              key={color.name}
              onClick={() => handleColorChange(color.name)}
              className={`w-8 h-8 rounded-full cursor-pointer border-2 relative border-solid border-[#B0B0B0]`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Chọn màu ${color.name}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleColorChange(color.name);
                }
              }}
            >
              {isSelected && (
                <svg
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={tickColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}