import { Tag } from "lucide-react";

const bestSellers = [
  { name: "MLB – Áo khoác phối mũ unisex Gopcore B...", category: "Áo khoác", stock: 100, sold: 1234, price: "1.399.000đ", id: 1 },
  { name: "MLB – Áo khoác phối mũ unisex Gopcore B...", category: "Áo khoác", stock: 2, sold: 500, price: "1.399.000đ", id: 2 },
  { name: "MLB – Áo khoác phối mũ unisex Gopcore B...", category: "Áo khoác", stock: 110, sold: 789, price: "1.399.000đ", id: 3 },
];

export default function BestSellerTable() {
  return (
    <div className="bg-white w-[743px] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-lg">Bán chạy nhất</div>
        <span className="text-xs text-gray-400">Dec 20 - Dec 31</span>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-xs border-b">
            <th className="py-2 font-semibold">Tên sản phẩm</th>
            <th className="py-2 font-semibold">Danh mục</th>
            <th className="py-2 font-semibold">Tồn kho</th>
            <th className="py-2 font-semibold">Lượt bán</th>
            <th className="py-2 font-semibold">Giá</th>
          </tr>
        </thead>
        <tbody>
          {bestSellers.map((item) => (
            <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50 text-base">
              <td className="py-2 flex items-center gap-2 font-medium">
                <div className="bg-gray-200 p-2 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-800" />
                </div>
                <span className="truncate max-w-[220px]">{item.name}</span>
              </td>
              <td className="py-2">{item.category}</td>
              <td className={`py-2 ${item.stock < 10 ? "text-red-500 font-bold" : ""}`}>{item.stock}</td>
              <td className="py-2">{item.sold.toLocaleString()}</td>
              <td className="py-2 font-semibold">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
