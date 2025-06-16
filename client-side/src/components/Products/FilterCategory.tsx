import { CategoryOption } from "@/types/filter";

interface FilterCategoryProps {
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
}

// Danh sách danh mục cố định (có thể thay bằng gọi API)
const categoryOptions: CategoryOption[] = [
  { value: "684d0988543e02998d9df014", label: "Nam" },
  { value: "684d0988543e02998d9df016", label: "Nữ" },
  { value: "684d0988543e02998d9df018", label: "Unisex" },
  // Thêm các danh mục khác nếu cần
];

export default function FilterCategory({
  selectedCategory,
  setSelectedCategory,
}: FilterCategoryProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Danh mục</h3>
      <div className="flex flex-col gap-2 mt-2">
        {categoryOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="radio"
              name="category"
              value={option.value}
              checked={selectedCategory === option.value}
              onChange={() => setSelectedCategory(option.value)}
              className="h-4 w-4 accent-black focus:ring-black"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}