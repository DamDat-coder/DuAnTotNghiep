import { useRouter } from "next/navigation";

interface Suggestion {
  name: string;
  id: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onClick: (suggestion: Suggestion) => void;
}

export default function SearchSuggestions({ suggestions, onClick }: SearchSuggestionsProps) {
  const router = useRouter();

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[1.125rem] text-[#687176]">Gợi ý hàng đầu</h2>
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="text-base text-black py-2 px-3 rounded cursor-pointer hover:shadow-lg hover:bg-gray-100"
            onClick={() => {
              onClick(suggestion);
              router.push(`/products/${suggestion.id}`);
            }}
          >
            {suggestion.name}
          </div>
        ))}
      </div>
    </div>
  );
}
