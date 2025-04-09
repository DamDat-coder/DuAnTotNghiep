// src/components/FilterSize.tsx
interface FilterSizeProps {
    selectedSizes: string[];
    handleSizeChange: (size: string) => void;
  }
  
  const sizeOptions = ["Size S", "Size M", "Size L", "Size XL", "Size XXL", "Size 3XL"];
  
  export default function FilterSize({ selectedSizes, handleSizeChange }: FilterSizeProps) {
    return (
      <div className="flex flex-col gap-4 border-b pb-4 mt-4">
        <h3 className="text-base font-bold">Size</h3>
        <div className="grid grid-cols-4 gap-2 mt-2 justify-items-stretch min-w-0">
          {sizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`w-full flex items-center justify-center text-base font-medium rounded border p-2 whitespace-nowrap ${
                selectedSizes.includes(size) ? "border-black border-2" : "border-gray-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  }