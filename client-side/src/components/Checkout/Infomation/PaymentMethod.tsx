// src/components/PaymentMethod.tsx
import Image from "next/image";

interface PaymentMethodProps {
  paymentMethod: string;
  handlePaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PaymentMethod({
  paymentMethod,
  handlePaymentChange,
}: PaymentMethodProps) {
  return (
    <div className="mt-8 col-span-full">
      <h2 className="text-[1.5rem] font-bold text-left uppercase mb-4">
        PHƯƠNG THỨC THANH TOÁN
      </h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="vnpay"
            checked={paymentMethod === "vnpay"}
            onChange={handlePaymentChange}
            className="h-5 w-5 accent-black focus:ring-black"
          />
          <div className="flex items-center gap-2">
            <Image
              src={"/checkout/checkout_vnpay.svg"}
              alt={"logo"}
              width={40}
              height={40}
              className="w-[2.5rem] h-[2.5rem] object-cover rounded"
            />
            <span className="text-[1rem]">Thanh toán qua cổng VNPay</span>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="zalopay"
            checked={paymentMethod === "zalopay"}
            onChange={handlePaymentChange}
            className="h-5 w-5 accent-black focus:ring-black"
          />
          <div className="flex items-center gap-2">
            <Image
              src={"/checkout/checkout_zalopay.svg"}
              alt={"logo"}
              width={40}
              height={40}
              className="w-[2.5rem] h-[2.5rem] object-cover rounded"
            />
            <span className="text-[1rem]">Thanh toán qua ví ZaloPay</span>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={handlePaymentChange}
            className="h-5 w-5 accent-black focus:ring-black"
          />
          <div className="flex items-center gap-2">
            <Image
              src={"/checkout/checkout_cod.svg"}
              alt={"logo"}
              width={40}
              height={40}
              className="w-[2.5rem] h-[2.5rem] object-cover rounded"
            />
            <span className="text-[1rem]">Thanh toán khi giao hàng (COD)</span>
          </div>
        </label>
      </div>
    </div>
  );
}