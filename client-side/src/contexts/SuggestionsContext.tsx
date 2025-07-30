"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchProducts } from "@/services/productApi";
import { Suggestion } from "@/types/product";
interface SuggestionsContextType {
  defaultSuggestions: Suggestion[];
}

const SuggestionsContext = createContext<SuggestionsContextType>({
  defaultSuggestions: [],
});

export function SuggestionsProvider({ children }: { children: React.ReactNode }) {
  const [defaultSuggestions, setDefaultSuggestions] = useState<Suggestion[]>([]); // ✅ sửa string[] thành Suggestion[]

  useEffect(() => {
    const loadDefaultSuggestions = async () => {
      try {
        const response = await fetchProducts({
          sort_by: "best_selling",
          is_active: true,
        });
        const suggestions = response.data.slice(0, 5).map((product: any) => ({
          name: product.name,
          id: product.id, // hoặc product.slug nếu bạn dùng slug
        }));
        setDefaultSuggestions(suggestions);
      } catch (error) {
        console.error("Lỗi khi tải gợi ý mặc định:", error);
      }
    };
    loadDefaultSuggestions();
  }, []);

  return (
    <SuggestionsContext.Provider value={{ defaultSuggestions }}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export const useSuggestions = () => useContext(SuggestionsContext);
