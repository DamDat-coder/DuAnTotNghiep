"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchProducts } from "@/services/productApi";

interface SuggestionsContextType {
  defaultSuggestions: string[];
}

const SuggestionsContext = createContext<SuggestionsContextType>({
  defaultSuggestions: [],
});

export function SuggestionsProvider({ children }: { children: React.ReactNode }) {
  const [defaultSuggestions, setDefaultSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const loadDefaultSuggestions = async () => {
      try {
        const response = await fetchProducts({ sort_by: "best_selling", is_active: true });
        const suggestions = response.data
          .map((product: any) => product.name)
          .slice(0, 5);
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