export interface CategoryOption {
  value: string;
  label: string;
}

export interface ColorOption {
  value: string;
  label: string;
  color: string;
}

export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "best_selling";

export interface FilterPopupProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApplyFilters: (filters: {
    sort_by?: SortOption;
    id_cate?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
  }) => void;
  currentFilters?: {
    sort_by?: SortOption;
    id_cate?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    size?: string;
  };
}