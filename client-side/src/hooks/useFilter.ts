// src/hooks/useFilter.ts
"use client";

import { useState } from "react";

export function useFilter(
  initialState = {
    sort: null,
    gender: null,
    prices: [],
    colors: [],
    sizes: [],
    brands: [],
  }
) {
  const [selectedSort, setSelectedSort] = useState<string | null>(
    initialState.sort
  );
  const [selectedGender, setSelectedGender] = useState<string | null>(
    initialState.gender
  );
  const [selectedPrices, setSelectedPrices] = useState<string[]>(
    initialState.prices
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialState.colors
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialState.sizes
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialState.brands
  );

  const handlePriceChange = (priceValue: string) => {
    setSelectedPrices((prev) =>
      prev.includes(priceValue)
        ? prev.filter((p) => p !== priceValue)
        : [...prev, priceValue]
    );
  };

  const handleColorChange = (colorValue: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue)
        ? prev.filter((c) => c !== colorValue)
        : [...prev, colorValue]
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleBrandChange = (brandValue: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandValue)
        ? prev.filter((b) => b !== brandValue)
        : [...prev, brandValue]
    );
  };

  const clearFilters = () => {
    setSelectedSort(null);
    setSelectedGender(null);
    setSelectedPrices([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
  };

  const getFilters = () => ({
    sort: selectedSort,
    gender: selectedGender,
    prices: selectedPrices,
    colors: selectedColors,
    sizes: selectedSizes,
    brands: selectedBrands,
  });

  return {
    selectedSort,
    setSelectedSort,
    selectedGender,
    setSelectedGender,
    selectedPrices,
    handlePriceChange,
    selectedColors,
    handleColorChange,
    selectedSizes,
    handleSizeChange,
    selectedBrands,
    handleBrandChange,
    clearFilters,
    getFilters,
  };
}
