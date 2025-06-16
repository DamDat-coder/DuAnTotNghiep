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

export interface FilterPopupProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onApplyFilters: (filters: {
    sort?: string;
    id_cate?: string;
    priceRange?: string;
    color?: string;
    size?: string;
  }) => void;
  currentFilters: {
    sort?: string;
    id_cate?: string;
    priceRange?: string;
    color?: string;
    size?: string;
  };
}