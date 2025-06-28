"use client";

import { useCheckout } from "@/hooks/useCheckout";
import Container from "@/components/Core/Container";
import OrderItems from "@/components/Checkout/OrderItems";
import DiscountCode from "@/components/Checkout/DiscountCode";
import OrderSummary from "@/components/Checkout/OrderSummary";
import ShippingForm from "@/components/Checkout/ShippingForm";
import ShippingMethod from "@/components/Checkout/ShippingMethod";
import PaymentMethod from "@/components/Checkout/PaymentMethod";
import AddressPopup from "@/components/Checkout/AddressPopup";
import { Toaster } from "react-hot-toast";

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
    addresses,
    defaultAddress,
    isAddressPopupOpen,
    setIsAddressPopupOpen,
    handleSelectAddress,
  } = useCheckout();

  return (
    <div className="py-8">
      <Container>
        <Toaster position="top-right" />
        {/* Mobile/Tablet */}
        <div className="laptop:hidden desktop:hidden mt-4 flex flex-col gap-6">
          {orderItems.length === 0 ? (
            <p className="text-center text-gray-500">
              Không có sản phẩm nào được chọn.
            </p>
          ) : (
            <>
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
              <form
                onSubmit={handleSubmit}
                className="grid desktop:grid-cols-2 gap-4"
              >
                <ShippingForm
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  handleSelectChange={handleSelectChange}
                  defaultAddress={defaultAddress}
                  setIsAddressPopupOpen={setIsAddressPopupOpen}
                  addresses={addresses}
                />
                <ShippingMethod
                  shippingMethod={shippingMethod}
                  handleShippingChange={handleShippingChange}
                />
                <PaymentMethod
                  paymentMethod={paymentMethod}
                  handlePaymentChange={(e) =>
                    handlePaymentChange(e.target.value)
                  }
                />
                <button
                  type="submit"
                  className="mt-8 w-full bg-black text-white font-medium py-[0.875rem] rounded-md hover:bg-gray-800"
                >
                  Xác Nhận Đơn Hàng
                </button>
              </form>
            </>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden desktop:flex desktop:gap-6 laptop:flex laptop:gap-6 mt-4">
          {orderItems.length === 0 ? (
            <p className="text-center text-gray-500 w-full">
              Không có sản phẩm nào được chọn.
            </p>
          ) : (
            <>
              {/* Container trái */}
              <div className="w-2/3 flex flex-col gap-6">
                <form
                  onSubmit={handleSubmit}
                  className="grid desktop:grid-cols-2 laptop:grid-cols-2 gap-4"
                >
                  <ShippingForm
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    defaultAddress={defaultAddress}
                    setIsAddressPopupOpen={setIsAddressPopupOpen}
                    addresses={addresses}
                  />
                  <ShippingMethod
                    shippingMethod={shippingMethod}
                    handleShippingChange={handleShippingChange}
                  />
                  <PaymentMethod
                    paymentMethod={paymentMethod}
                    handlePaymentChange={(e) =>
                      handlePaymentChange(e.target.value)
                    }
                  />
                </form>
              </div>

              {/* Container phải */}
              <div className="w-[31.875rem] sticky top-4 self-start">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-lg font-bold">
                    ĐƠN HÀNG ({orderItems.length} SẢN PHẨM)
                  </h1>
                  <span className="text-[1rem] font-bold">
                    {subtotal.toLocaleString("vi-VN")}₫
                  </span>
                </div>
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
            </>
          )}
          {isAddressPopupOpen && (
            <AddressPopup
              addresses={addresses}
              selectedAddress={defaultAddress}
              onSelect={handleSelectAddress}
              onClose={() => setIsAddressPopupOpen(false)}
            />
          )}
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
