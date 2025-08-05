// src/components/DiscountCode.tsx
interface DiscountCodeProps {
  discountCode: string;
  setDiscountCode: (code: string) => void;
  handleApplyDiscount: () => void;
}

export default function DiscountCode({
  discountCode,
  setDiscountCode,
  handleApplyDiscount,
}: DiscountCodeProps) {
  return (
    <div className="mt-8">
      <label className="text-[1rem] font-medium">Mã giảm giá</label>
      <div className="flex mt-2">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Nhập mã giảm giá"
          className="w-full py-[0.875rem] pl-3 border border-gray-300 rounded-l-md"
        />
        <button
          onClick={handleApplyDiscount}
          className="w-6/12 bg-black text-white font-medium rounded-r-md hover:bg-gray-800 text-[0.875rem]"
        >
          Áp Dụng
        </button>
      </div>
    </div>
  );
}
