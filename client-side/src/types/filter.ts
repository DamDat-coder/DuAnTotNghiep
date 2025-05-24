export interface IFilterPopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilters?: (filters: FilterState) => void;
}

export interface FilterState {
  sort: string | null;
  gender: string | null;
  prices: string[];
  colors: string[];
  sizes: string[];
  brands: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface GenderOption {
  value: string;
  label: string;
}

export interface PriceOption {
  value: string;
  label: string;
}

export interface ColorOption {
  value: string;
  label: string;
  color: string;
}

export interface BrandOption {
  value: string;
  label: string;
}