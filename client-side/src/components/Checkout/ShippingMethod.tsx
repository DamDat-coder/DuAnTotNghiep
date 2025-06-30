interface ShippingMethodProps {
  shippingMethod: string;
  handleShippingChange: (method: string) => void;
}

export default function ShippingMethod({
  shippingMethod,
  handleShippingChange,
}: ShippingMethodProps) {
  return (
    <div className="mt-8 col-span-full">
      <h2 className="text-[1.5rem] font-bold text-left uppercase mb-4">
        PHƯƠNG THỨC VẬN CHUYỂN
      </h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="shippingMethod"
              value="standard"
              checked={shippingMethod === "standard"}
              onChange={(e) => {
                handleShippingChange(e.target.value);
              }}
              className="h-5 w-5 accent-black focus:ring-black"
            />
            <span className="text-[1rem]">Giao hàng tiêu chuẩn (3-5 ngày)</span>
          </div>
          <span className="text-[1rem] font-medium">25,000₫</span>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="shippingMethod"
              value="express"
              checked={shippingMethod === "express"}
              onChange={(e) => {
                handleShippingChange(e.target.value);
              }}
              className="h-5 w-5 accent-black focus:ring-black"
            />
            <span className="text-[1rem]">Giao hàng nhanh (1-2 ngày)</span>
          </div>
          <span className="text-[1rem] font-medium">35,000₫</span>
        </label>
      </div>
    </div>
  );
}