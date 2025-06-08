// src/components/OrderSummary.tsx
interface OrderSummaryProps {
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
  }
  
  export default function OrderSummary({
    subtotal,
    discount,
    shippingFee,
    total,
  }: OrderSummaryProps) {
    return (
      <div className="mt-8">
        <div className="border-b-2 border-[#E7E7E7] border-solid pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[1rem]">Tạm tính</span>
            <span className="text-[1rem]">{subtotal.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[1rem]">Giảm giá</span>
            <span className="text-[1rem]">{discount.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[1rem]">Phí vận chuyển</span>
            <span className="text-[1rem]">{shippingFee.toLocaleString("vi-VN")}₫</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-[1rem] font-bold">THÀNH TIỀN:</span>
          <span className="text-[1rem] font-bold text-[#FF0000]">
            {total.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>
    );
  }