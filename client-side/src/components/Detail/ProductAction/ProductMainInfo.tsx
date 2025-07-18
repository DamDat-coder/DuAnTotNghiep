import { IProduct } from "@/types/product";
import { Star } from "lucide-react";

interface Props {
  product: IProduct;
}
export default function ProductMainInfo({ product }: Props) {
  return (
    <div className="mt-4 flex flex-col items-start gap-6">
      <div className="w-full flex justify-between">
        <div className="text-sm font-bold opacity-40">
          {product.category?.name || "Danh mục"}
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="black" stroke="black" />
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold flex-1">{product.name}</h2>
    </div>
  );
}
