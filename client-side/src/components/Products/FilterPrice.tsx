"use client";

import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";

interface FilterPriceProps {
  minPrice: number | null;
  setMinPrice: (value: number | null) => void;
  maxPrice: number | null;
  setMaxPrice: (value: number | null) => void;
}

export default function FilterPrice({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: FilterPriceProps) {
  const MIN_VALUE = 0;
  const MAX_VALUE = 10000000;
  const STEP = 100000;

  const [value, setValue] = useState<[number, number]>([
    minPrice ?? MIN_VALUE,
    maxPrice ?? MAX_VALUE,
  ]);

  useEffect(() => {
    setValue([minPrice ?? MIN_VALUE, maxPrice ?? MAX_VALUE]);
  }, [minPrice, maxPrice]);

  const handleChange = (_: Event, newValue: number | number[]) => {
    const [newMin, newMax] = newValue as [number, number];
    setMinPrice(newMin);
    setMaxPrice(newMax);
    setValue([newMin, newMax]);
  };

  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Khoảng giá</h3>
      <div className="px-4">
        <Slider
          getAriaLabel={() => "Khoảng giá"}
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          min={MIN_VALUE}
          max={MAX_VALUE}
          step={STEP}
          sx={{
            height: 6,
            px: 0,
            "& .MuiSlider-thumb": {
              width: 16,
              height: 16,
              backgroundColor: "#000000",
              boxShadow: "0 0 0 4px rgba(156, 163, 175, 0.3)",
              "&:hover": {
                boxShadow: "0 0 0 6px rgba(156, 163, 175, 0.5)",
              },
            },
            "& .MuiSlider-track": {
              backgroundColor: "#000000",
            },
            "& .MuiSlider-rail": {
              backgroundColor: "#e5e7eb",
              opacity: 1,
            },
          }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{value[0].toLocaleString("vi-VN")}₫</span>
        <span>{value[1].toLocaleString("vi-VN")}₫</span>
      </div>
    </div>
  );
}
