// src/components/Core/Popups/LookupMenu/SearchSuggestions.tsx
"use client";

import React from "react";

interface SearchSuggestionsProps {
  suggestions: string[];
  handleSuggestionClick: (suggestion: string) => void;
  onClick: (suggestion: string) => void;
}

export default function SearchSuggestions({
  suggestions,
  handleSuggestionClick,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {suggestions.map((suggestion, index) => (
        <a
          key={index}
          href="#"
          className="text-base text-black hover:bg-gray-200 py-1 px-2 rounded cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            handleSuggestionClick(suggestion);
          }}
        >
          {suggestion}
        </a>
      ))}
    </div>
  );
}