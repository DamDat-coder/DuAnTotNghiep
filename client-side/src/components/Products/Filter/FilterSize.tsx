interface FilterSizeProps {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
}

// Danh sách size cố định
const sizeOptions = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function FilterSize({ selectedSize, setSelectedSize }: FilterSizeProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Size</h3>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {sizeOptions.map((size) => {
          const isActive = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => setSelectedSize(isActive ? null : size)}
              className={`w-full p-2 rounded border font-medium text-base ${
                isActive ? "border-black border-2" : "border-gray-300"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
