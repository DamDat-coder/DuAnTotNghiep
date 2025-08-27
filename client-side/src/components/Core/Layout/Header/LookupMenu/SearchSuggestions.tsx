interface Suggestion {
  name: string;
  id: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onClick: (suggestion: Suggestion) => void;
}

export default function SearchSuggestions({ suggestions, onClick }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[1.125rem] text-[#687176]">Gợi ý hàng đầu</h2>
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="text-sm text-black py-1 px-3 rounded cursor-pointer hover:shadow-lg hover:bg-gray-100 line-clamp-2"
            onClick={() => {
              onClick(suggestion);
               window.location.href = `/products/${suggestion.id}`;
            }}
          >
            {suggestion.name}
          </div>
        ))}
      </div>
    </div>
  );
}
