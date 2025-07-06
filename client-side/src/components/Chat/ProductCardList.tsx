"use client";

import Image from "next/image";
import Link from "next/link";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category?: string;
  image?: string;
}

export default function ProductCardList({ items }: { items: ProductItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 mt-2">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/products/${item.id}`}
          className="flex items-center gap-3 border p-2 rounded-lg hover:shadow transition bg-white"
        >
          {item.image && (
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src={`/product/img/${item.image}`}
                // src={item.image}
                alt={item.name}
                fill
                className="rounded object-cover"
              />
            </div>
          )}
          <div className="text-sm">
            <p className="font-semibold">{item.name}</p>
            <p className="text-gray-500 text-xs">{item.category}</p>
            <p className="text-red-500 font-bold">
              {item.price.toLocaleString()}đ
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
