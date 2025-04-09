// app/checkout/page.tsx
"use client";

import { useCheckout } from "@/hooks/useCheckout";
import Container from "@/components/Core/Container";
import OrderItems from "@/components/Checkout/OrderItems";
import DiscountCode from "@/components/Checkout/DiscountCode";
import OrderSummary from "@/components/Checkout/OrderSummary";
import ShippingForm from "@/components/Checkout/ShippingForm";
import ShippingMethod from "@/components/Checkout/ShippingMethod";
import PaymentMethod from "@/components/Checkout/PaymentMethod";
import { OrderItem } from "@/types";

const initialOrderItems: OrderItem[] = [
  {
    id: 1,
    name: "MLB - Áo khoác phối mũ unisex Gopcore Basic",
    price: 5589000,
    discountPercent: 68,
    image: "/featured/featured_1.jpg",
    size: "XL",
    color: "Đen",
    quantity: 1,
  },
  {
    id: 2,
    name: "Áo thun unisex phong cách đường phố",
    price: 500000,
    discountPercent: 20,
    image: "/featured/featured_1.jpg",
    size: "M",
    color: "Trắng",
    quantity: 2,
  },
];

export default function Checkout() {
  const {
    orderItems,
    subtotal,
    discountCode,
    setDiscountCode,
    discount,
    shippingFee,
    shippingMethod,
    paymentMethod,
    total,
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleShippingChange,
    handlePaymentChange,
    handleSubmit,
    handleApplyDiscount,
  } = useCheckout(initialOrderItems);

  return (
    <div className="py-8">
      <Container>
        {/* Mobile/Tablet */}
        <div className="desktop:hidden mt-4 flex flex-col gap-6">
          <OrderItems orderItems={orderItems} />
          <DiscountCode
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            handleApplyDiscount={handleApplyDiscount}
          />
          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            shippingFee={shippingFee}
            total={total}
          />
          <form onSubmit={handleSubmit} className="grid desktop:grid-cols-2 gap-4">
            <ShippingForm
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
            <ShippingMethod
              shippingMethod={shippingMethod}
              handleShippingChange={handleShippingChange}
            />
            <PaymentMethod
              paymentMethod={paymentMethod}
              handlePaymentChange={handlePaymentChange}
            />
            <button
              type="submit"
              className="mt-8 w-full bg-black text-white font-medium py-[0.875rem] rounded-md hover:bg-gray-800"
            >
              Xác Nhận Đơn Hàng
            </button>
          </form>
        </div>

        {/* Desktop */}
        <div className="hidden desktop:flex desktop:gap-6 mt-4">
          {/* Container trái */}
          <div className="w-2/3 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="grid desktop:grid-cols-2 gap-4">
              <ShippingForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
              />
              <ShippingMethod
                shippingMethod={shippingMethod}
                handleShippingChange={handleShippingChange}
              />
              <PaymentMethod
                paymentMethod={paymentMethod}
                handlePaymentChange={handlePaymentChange}
              />
            </form>
          </div>

          {/* Container phải */}
          <div className="w-1/3 sticky top-0">
            <OrderItems orderItems={orderItems} />
            <DiscountCode
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              handleApplyDiscount={handleApplyDiscount}
            />
            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              shippingFee={shippingFee}
              total={total}
            />
            <button
              onClick={handleSubmit}
              className="mt-8 w-full bg-black text-white font-medium py-[0.875rem] rounded-md hover:bg-gray-800"
            >
              Xác Nhận Đơn Hàng
            </button>
          </div>
        </div>
      </Container>
      <style jsx global>{`
        .react-select__control {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0;
          min-height: 3rem;
        }
        .react-select__control--is-focused {
          border-color: #d1d5db;
          box-shadow: none;
        }
        .react-select__menu {
          width: 100%;
          z-index: 10;
        }
        .react-select__option {
          padding: 0.75rem 1rem;
        }
        .react-select__option--is-focused {
          background-color: #f3f4f6;
        }
        .react-select__option--is-selected {
          background-color: #000;
          color: #fff;
        }
        .react-select__placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}