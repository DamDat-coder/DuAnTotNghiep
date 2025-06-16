interface FilterSizeProps {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void; // Sửa thành string | null
}

const sizeOptions = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function FilterSize({ selectedSize, setSelectedSize }: FilterSizeProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-4 mt-4">
      <h3 className="text-base font-bold">Size</h3>
      <div className="grid grid-cols-4 gap-2 mt-2 justify-items-stretch">
        {sizeOptions.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size === selectedSize ? null : size)}
            className={`w-full flex items-center justify-center text-base font-medium rounded border p-2 ${
              selectedSize === size ? "border-black border-2" : "border-gray-300"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
