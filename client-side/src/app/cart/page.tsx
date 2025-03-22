"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "MLB - Áo khoác phối mũ unisex Gopcore Basic",
      price: 5589000,
      discountPercent: 68,
      image: "/featured/featured_1.jpg",
      size: "XL",
      color: "Đen",
      quantity: 1,
      liked: false,
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
      liked: true,
    },
  ]);

  const suggestedProducts = [
    {
      id: 2,
      name: "Áo thun unisex",
      price: 500000,
      discountPercent: 20,
      image: "featured_1.jpg",
      category: "Áo thun",
    },
    {
      id: 3,
      name: "Quần jeans slim",
      price: 800000,
      discountPercent: 15,
      image: "featured_2.jpg",
      category: "Quần jeans",
    },
    {
      id: 4,
      name: "Giày sneakers trắng",
      price: 1200000,
      discountPercent: 10,
      image: "featured_3.jpg",
      category: "Giày",
    },
    {
      id: 5,
      name: "Mũ lưỡi trai đen",
      price: 300000,
      discountPercent: 25,
      image: "featured_4.jpg",
      category: "Phụ kiện",
    },
    {
      id: 6,
      name: "Áo khoác bomber",
      price: 1500000,
      discountPercent: 30,
      image: "featured_5.jpg",
      category: "Áo khoác",
    },
  ];

  const handleQuantityChange = (id: number, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const toggleLike = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  const renderCartItem = (item: (typeof cartItems)[0]) => {
    const discountPrice = item.price * (1 - item.discountPercent / 100);

    return (
      <div key={item.id} className="flex items-center gap-4 p-4">
        <Image
          src={item.image}
          alt={item.name}
          width={110}
          height={110}
          className="w-[6.9rem] h-[6.9rem] object-cover rounded"
        />
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-[#374151] line-clamp-2">
            {item.name}
          </h3>
          <div className="text-sm text-[#374151]">
            Size: {item.size} ({item.color})
          </div>
          <div className="text-[1rem] font-bold text-red-500">
            {discountPrice.toLocaleString("vi-VN")}₫
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-gray-300 rounded-full w-fit">
              <button
                onClick={() => handleQuantityChange(item.id, -1)}
                className="w-8 h-8 flex items-center justify-center text-black"
              >
                -
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-black">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, 1)}
                className="w-8 h-8 flex items-center justify-center text-black"
              >
                +
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleLike(item.id)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Heart
                  size={20}
                  fill={item.liked ? "red" : "none"}
                  stroke={item.liked ? "red" : "black"}
                />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Trash2 size={20} stroke="black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductCard = (product: (typeof suggestedProducts)[0]) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className="product w-[16.8125rem] h-[23.875rem] desktop:w-[23.75rem] desktop:h-auto flex flex-col bg-white shadow-xl relative">
        <Image
          src={`/featured/${product.image}`}
          alt={product.name || "Sản phẩm"}
          width={269}
          height={269}
          className="w-[16.8125rem] h-[16.8125rem] desktop:w-[23.75rem] desktop:h-[35.625rem] object-cover"
          draggable={false}
        />
        <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] desktop:text-[0.875rem] font-bold px-2 py-1 rounded">
          -{product.discountPercent}%
        </div>
        <button className="absolute top-[0.5rem] right-[0.5rem]">
          <img src="/product/product_addToCart.svg" alt="Thêm vào giỏ hàng" />
        </button>
        <div className="content flex flex-col p-4">
          <div className="name text-lg desktop:text-xl font-bold text-[#374151] pb-2 truncate">
            {product.name || "Sản phẩm"}
          </div>
          <div className="category desc-text text-[#374151] truncate">
            {product.category || "Danh mục"}
          </div>
          <div className="price-container flex items-center gap-3 pt-2">
            <div className="discountPrice text-[1rem] desktop:text-[1.125rem] font-bold text-red-500">
              {discountPrice.toLocaleString("vi-VN")}₫
            </div>
            <div className="price text-[0.875rem] desktop:text-[1rem] text-[#374151] line-through">
              {product.price.toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8">
      <div className="max-w-md mx-auto tablet:max-w-2xl desktop:max-w-[95%]">
        <h1 className="text-2xl font-medium text-left">Giỏ hàng của bạn</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Giỏ hàng trống.</p>
        ) : (
          <>
            {/* Mobile/Tablet: Layout gốc */}
            <div className="desktop:hidden">
              <div className="grid grid-cols-1 gap-6 border-b-2 border-black mt-4">
                {cartItems.map((item) => renderCartItem(item))}
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[1rem] font-bold">Tổng tiền</span>
                  <span className="text-[1rem] font-bold text-[#FF0000]">
                    {totalPrice.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <button className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800">
                  Thanh toán
                </button>
              </div>
            </div>

            {/* Desktop: 2 Container */}
            <div className="hidden desktop:flex desktop:gap-6 mt-4">
              {/* Container trái (80%) - Giỏ hàng */}
              <div className="w-[80%]">
                <div className="grid grid-cols-1 gap-6 border-b-2 border-black">
                  {cartItems.map((item) => renderCartItem(item))}
                </div>
              </div>

              {/* Container phải (20%) - Tóm tắt */}
              <div className="w-[20%]">
                <h2 className="text-xl font-semibold mb-4">Tóm tắt</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[1rem] font-bold text-[#374151]">
                      3 sản phẩm
                    </span>
                    <span className="text-[1rem] text-[#374151] font-bold">
                      5,370,000₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[1rem] text-[#374151] font-bold">
                      Giá trước khi giảm
                    </span>
                    <span className="text-[1rem] text-[#374151] font-bold">
                      5,370,000₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[1rem]  font-bold text-[#999999]">
                      Đã giảm giá
                    </span>
                    <span className="text-[1rem]  text-[#999999]">
                      5,370,000₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t-2 border-black pt-3 mt-3">
                    <span className="text-[1rem] font-bold">Tổng tiền</span>
                    <span className="text-[1rem] font-bold text-[#FF0000]">
                      {totalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
                <button className="w-full py-3 bg-black text-white text-[1rem] font-medium rounded-lg hover:bg-gray-800 mt-4">
                  Thanh toán
                </button>
              </div>
            </div>

            {/* Section 5: Copy từ ProductDetail */}
            <div className="mb-4 mt-9">
              <h1 className="text-[1.5rem] pb-6 font-bold">Có thể bạn thích</h1>
              <div className="block tablet:hidden">
                <Swiper
                  spaceBetween={10}
                  slidesPerView={1.5}
                  loop={false}
                  grabCursor={true}
                  className="select-none"
                >
                  {suggestedProducts.map((product) => (
                    <SwiperSlide key={product.id} className="!w-[16.8125rem]">
                      {renderProductCard(product)}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="hidden tablet:block desktop:hidden">
                <div className="grid grid-cols-2 gap-6">
                  {suggestedProducts.map((product) => (
                    <div key={product.id}>{renderProductCard(product)}</div>
                  ))}
                </div>
              </div>
              <div className="hidden desktop:block">
                <Swiper
                  spaceBetween={16}
                  slidesPerView={3}
                  loop={false}
                  grabCursor={true}
                  className="select-none w-full"
                >
                  {suggestedProducts.map((product) => (
                    <SwiperSlide key={product.id} className="!w-[23.75rem]">
                      {renderProductCard(product)}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
