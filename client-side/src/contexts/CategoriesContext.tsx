"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchCategoryTree, flattenCategories } from "@/services/categoryApi";
import { ICategory } from "@/types/category";

interface CategoriesContextType {
  tree: ICategory[];
  flat: ICategory[];
  isLoading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextType>({
  tree: [],
  flat: [],
  isLoading: true,
  error: null,
});

export const useCategories = () => useContext(CategoriesContext);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [tree, setTree] = useState<ICategory[]>([]);
  const [flat, setFlat] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryTree = await fetchCategoryTree();
        setTree(categoryTree);
        setFlat(flattenCategories(categoryTree));
      } catch (err: any) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ tree, flat, isLoading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
};
