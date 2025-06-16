export interface ColorOption {
  value: string;
  label: string;
  color: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface PriceOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface IFilterPopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilters?: (filters: any) => void;
}