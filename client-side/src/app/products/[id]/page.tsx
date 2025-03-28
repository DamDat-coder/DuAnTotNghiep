// app/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { use } from "react"; // Thêm import use từ React

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number;
  image: string;
  banner: string;
  gender: string;
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  // Sử dụng use để lấy id từ params
  const { id } = use(params);

  // State cho sản phẩm chính và sản phẩm gợi ý
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho các chức năng khác
  const [selectedSize, setSelectedSize] = useState<string | null>("XL");
  const [isLiked, setIsLiked] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Giả lập sizes và stock (vì API không có thông tin này)
  const sizes = [
    { value: "S", inStock: true },
    { value: "M", inStock: true },
    { value: "L", inStock: true },
    { value: "XL", inStock: true },
    { value: "2XL", inStock: true },
    { value: "3XL", inStock: false },
  ];
  const stock = 1;

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy dữ liệu sản phẩm chính
        const productResponse = await fetch(
          `https://67e3b0622ae442db76d1204c.mockapi.io/products/${id}`,
          { cache: "no-store" }
        );
        if (!productResponse.ok) throw new Error("Không thể tải thông tin sản phẩm.");
        const productData = await productResponse.json();
        setProduct(productData);

        // Lấy dữ liệu sản phẩm gợi ý
        const suggestedResponse = await fetch(
          `https://67e3b0622ae442db76d1204c.mockapi.io/products`,
          { cache: "no-store" }
        );
        if (!suggestedResponse.ok) throw new Error("Không thể tải danh sách sản phẩm gợi ý.");
        const suggestedData = await suggestedResponse.json();
        // Loại bỏ sản phẩm hiện tại khỏi danh sách gợi ý và lấy tối đa 5 sản phẩm
        const filteredSuggested = suggestedData
          .filter((p: Product) => p.id !== id)
          .slice(0, 5);
        setSuggestedProducts(filteredSuggested);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Hàm tính giá sau giảm giá
  const discountedPrice = product ? product.price * (1 - product.discountPercent / 100) : 0;

  // Hàm chọn size
  const handleSizeChange = (size: string) => {
    if (sizes.find((s) => s.value === size)?.inStock) {
      setSelectedSize(size);
    }
  };

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn size trước!");
      return;
    }
    if (product) {
      console.log({
        id: product.id,
        name: product.name,
        size: selectedSize,
        price: discountedPrice,
      });
      alert("Đã thêm vào giỏ hàng!");
    }
  };

  // Hàm thích sản phẩm
  const toggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  // Hàm mở/đóng section
  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Hàm render sản phẩm gợi ý
  const renderProductCard = (product: Product) => {
    const discountPrice = product.price * (1 - product.discountPercent / 100);

    return (
      <div className="product w-[22.5rem] h-auto flex flex-col bg-white relative">
        <Image
          src={`/featured/${product.image}`}
          alt={product.name || "Sản phẩm"}
          width={363}
          height={363}
          className="w-[22.6875rem] h-[22.6875rem] object-cover"
          draggable={false}
        />
        <div className="absolute top-[0.5rem] left-[0.5rem] bg-red-500 text-white text-[0.75rem] font-bold px-2 py-1 rounded">
          -{product.discountPercent}%
        </div>
        <button className="absolute top-[0.5rem] right-[0.5rem]">
          <img src="/product/product_addToCart.svg" alt="" />
        </button>
        <div className="content flex flex-col p-4">
          <div className="name text-lg font-bold text-[#374151] pb-2 truncate">
            {product.name || "Sản phẩm"}
          </div>
          <div className="category desc-text text-[#374151] truncate">
            {product.category || "Danh mục"}
          </div>
          <div className="price-container flex items-center gap-3 pt-2">
            <div className="discountPrice text-[1rem] font-bold text-red-500">
              {discountPrice.toLocaleString("vi-VN")}₫
            </div>
            <div className="price text-[0.875rem] text-[#374151] line-through">
              {product.price.toLocaleString("vi-VN")}₫
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Xử lý trạng thái loading và error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg text-red-500">{error || "Không tìm thấy sản phẩm."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto tablet:max-w-2xl desktop:max-w-full desktop:w-full">
        <Breadcrumb />
        <div className="mt-4 flex flex-col desktop:flex-row desktop:gap-6">
          {/* Mobile/Tablet: Toàn bộ layout gốc */}
          <div className="max-w-sm mx-auto flex flex-col gap-9 desktop:hidden">
            {/* Section 1 */}
            <div>
              <div className="mt-4 flex flex-col items-start gap-4">
                <h2 className="text-2xl font-bold flex-1">{product.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-red-500 font-bold text-lg">
                    {discountedPrice.toLocaleString()}đ
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {product.price.toLocaleString()}đ
                  </div>
                </div>
              </div>
              <div className="relative mt-4">
                <Swiper
                  spaceBetween={10}
                  slidesPerView={1}
                  loop={true}
                  className="w-full"
                >
                  {/* Sử dụng banner làm ảnh chính, lặp lại để giống dữ liệu cũ */}
                  {[product.banner, product.banner, product.banner, product.banner, product.banner].map((image, index) => (
                    <SwiperSlide key={index}>
                      <Image
                        src={`/featured/${image}`}
                        alt={`${product.name} - Ảnh ${index + 1}`}
                        width={0}
                        height={400}
                        style={{ width: "auto", height: "400px" }}
                        className="mx-auto"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <div className="mt-4">
                <div className="flex w-full justify-between items-center">
                  <h3 className="font-semibold">Sizes</h3>
                  <div className="flex justify-center items-center gap-2 ml-4">
                    <Image
                      src="/product/product_size.svg"
                      alt="Bảng size"
                      width={20}
                      height={20}
                    />
                    <p>Bảng size</p>
                  </div>
                </div>
                <div className="pt-3 flex flex-wrap gap-2 mt-2">
                  {sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => handleSizeChange(size.value)}
                      className={`px-4 py-2 border rounded-sm text-sm font-medium ${
                        selectedSize === size.value && size.inStock
                          ? "bg-black text-white"
                          : !size.inStock
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }`}
                      disabled={!size.inStock}
                    >
                      Size {size.value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-3 text-red-500 text-sm font-medium">
                Còn {stock} sản phẩm
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <div className="flex items-center justify-between">
                <div className="relative w-full">
                  <button
                    onClick={handleAddToCart}
                    className="relative z-10 bg-black text-white w-full px-6 py-2 text-sm font-medium flex items-center justify-between"
                  >
                    <span>THÊM VÀO GIỎ HÀNG</span>
                    <Image
                      src="/product/product_addToCart_angle.svg"
                      alt="Thêm vào giỏ hàng"
                      width={20}
                      height={20}
                    />
                  </button>
                  <div className="absolute bottom-[-0.3rem] right-[-0.3rem] bg-white border-2 border-black w-full px-6 py-2 text-sm font-medium flex items-center justify-between z-0">
                    <span>THÊM VÀO GIỎ HÀNG</span>
                    <Image
                      src="/product/product_addToCart_angle.svg"
                      alt="Thêm vào giỏ hàng"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
                <button onClick={toggleLike} className="mt-1 ml-4">
                  <Image
                    src={
                      isLiked
                        ? "/product/product_like_active.svg"
                        : "/product/product_like_square.svg"
                    }
                    alt={isLiked ? "Đã thích" : "Thích"}
                    width={45}
                    height={45}
                  />
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/product/product_section3_delivery.svg"
                    alt="Free shipping"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">
                    Free ship khi đơn hàng trên 1 triệu
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src="/product/product_section3_swap.svg"
                    alt="Easy return"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">Đổi trả hàng dễ dàng</span>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="border-t-2 pt-4 border-[#B0B0B0]">
              {[
                {
                  id: "product_details",
                  title: "Chi tiết sản phẩm",
                  content: [
                    "Được làm từ chất liệu da cao cấp, chiếc áo Basic Collar không chỉ mang đến vẻ ngoài sành điệu mà còn đảm bảo độ bền bỉ và thoải mái khi mặc. Thiết kế cổ điển cùng đường may tinh tế giúp tôn lên vẻ cá tính, sành điệu nhưng vẫn phù hợp với nhiều phong cách khác nhau. Dễ dàng phối cùng áo thun, quần jeans hay giày sneakers, đây chắc chắn là item không thể thiếu trong tủ đồ của những tín đồ thời trang yêu thích sự năng động và thời thượng.",
                  ],
                },
                {
                  id: "size_chart",
                  title: "Kích thước",
                  content: [
                    <Image
                      key="size_chart_img"
                      src="/product/product_size_table.png"
                      alt="Bảng kích thước"
                      width={300}
                      height={200}
                    />,
                  ],
                },
                {
                  id: "reviews",
                  title: (
                    <div className="flex justify-between items-center w-full text-base font-semibold">
                      <span>Đánh giá</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill="black"
                              stroke="black"
                            />
                          ))}
                        </div>
                        <motion.img
                          src="/nav/footer_down.svg"
                          alt="Dropdown"
                          className="h-4 w-auto"
                          animate={{
                            rotate: activeSection === "reviews" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ),
                  content: [
                    <div key="review_summary" className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill="black"
                              stroke="black"
                            />
                          ))}
                          <Star size={16} stroke="black" />
                        </div>
                        <span>4.0 (10 đánh giá)</span>
                      </div>
                      <div className="text-sm text-[#B0B0B0]">
                        <div className="flex items-center justify-between">
                          <div className="flex">
                            {[...Array(3)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill="black"
                                stroke="black"
                              />
                            ))}
                            {[...Array(2)].map((_, i) => (
                              <Star key={i} size={16} stroke="black" />
                            ))}
                          </div>
                          <span>TanNhutHa - Oct 29, 2024</span>
                        </div>
                        <p className="line-clamp-3">
                          They are very narrow and somewhat stiff. I've only
                          worn them for 1 day, so maybe I need to break them in
                          more. So far, I like the regular DN's much better.
                        </p>
                        <a
                          href="#"
                          className="text-[1rem] text-black hover:underline"
                        >
                          Xem thêm
                        </a>
                      </div>
                    </div>,
                  ],
                },
              ].map(({ id, title, content }) => (
                <div key={id}>
                  <a
                    href="#"
                    className="w-full flex items-center justify-between no-underline hover:underline focus:no-underline pb-4 border-b-2 border-[#B0B0B0]"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSectionClick(id);
                    }}
                  >
                    {id === "reviews" ? (
                      title
                    ) : (
                      <>
                        <p className="text-base font-semibold">{title}</p>
                        <motion.img
                          src="/nav/footer_down.svg"
                          alt="Dropdown"
                          className="h-4 w-auto"
                          animate={{ rotate: activeSection === id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </>
                    )}
                  </a>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: activeSection === id ? "auto" : 0,
                      opacity: activeSection === id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0] space-y-1"
                  >
                    {content.map((item, index) =>
                      typeof item === "string" ? (
                        <p key={index}>{item}</p>
                      ) : (
                        <div key={index}>{item}</div>
                      )
                    )}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Section 5 */}
            <div className="mb-4">
              <div className="max-w-md mx-auto tablet:max-w-2xl">
                <h1 className="text-[1.5rem] pb-6 font-bold">
                  Có thể bạn thích
                </h1>
                {/* Mobile: Swiper 1.5 */}
                <div className="block tablet:hidden overflow-x-hidden">
                  <div className="max-w-md">
                    <Swiper
                      spaceBetween={10}
                      slidesPerView={1.5}
                      loop={false}
                      grabCursor={true}
                      className="select-none"
                    >
                      {suggestedProducts.map((product) => (
                        <SwiperSlide
                          key={product.id}
                          className="!w-[22.6875rem]"
                        >
                          {renderProductCard(product)}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
                {/* Tablet: Grid 2 cột */}
                <div className="hidden tablet:block">
                  <div className="grid grid-cols-2 gap-6">
                    {suggestedProducts.map((product) => (
                      <div key={product.id}>{renderProductCard(product)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Container 1 (Ảnh, Section 4, Section 5) */}
          <div className="hidden desktop:flex desktop:flex-col desktop:w-3/4 overflow-x-hidden">
            <div className="relative">
              <div className="grid grid-cols-2 gap-0">
                {/* Sử dụng banner làm ảnh chính, lặp lại để giống dữ liệu cũ */}
                {[product.banner, product.banner, product.banner, product.banner].map((image, index) => (
                  <Image
                    key={index}
                    src={`/featured/${image}`}
                    alt={`${product.name} - Ảnh ${index + 1}`}
                    width={380}
                    height={285}
                    className="w-full h-auto object-cover"
                  />
                ))}
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-2 py-2 px-4 border-2 border-black w-[15%] bg-white">
                <button className="text-base font-bold">XEM THÊM</button>
                <Image
                  src="/nav/footer_down.svg"
                  alt="Xem thêm"
                  width={16}
                  height={16}
                />
              </div>
            </div>
            {/* Desktop */}
            <div className="border-b-2 pt-4 border-[#B0B0B0] mt-8 w-[60%] mx-auto">
              {[
                {
                  id: "product_details",
                  title: "Chi tiết sản phẩm",
                  content: [
                    "Được làm từ chất liệu da cao cấp, chiếc áo Basic Collar không chỉ mang đến vẻ ngoài sành điệu mà còn đảm bảo độ bền bỉ và thoải mái khi mặc. Thiết kế cổ điển cùng đường may tinh tế giúp tôn lên vẻ cá tính, sành điệu nhưng vẫn phù hợp với nhiều phong cách khác nhau. Dễ dàng phối cùng áo thun, quần jeans hay giày sneakers, đây chắc chắn là item không thể thiếu trong tủ đồ của những tín đồ thời trang yêu thích sự năng động và thời thượng.",
                  ],
                },
                {
                  id: "size_chart",
                  title: "Kích thước",
                  content: [
                    <Image
                      key="size_chart_img"
                      src="/product/product_size_table.png"
                      alt="Bảng kích thước"
                      width={300}
                      height={200}
                    />,
                  ],
                },
                {
                  id: "reviews",
                  title: (
                    <div className="flex justify-between items-center w-full text-base font-semibold">
                      <span>Đánh giá</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill="black"
                              stroke="black"
                            />
                          ))}
                        </div>
                        <motion.img
                          src="/nav/footer_down.svg"
                          alt="Dropdown"
                          className="h-4 w-auto"
                          animate={{
                            rotate: activeSection === "reviews" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ),
                  content: [
                    <div key="review_summary" className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill="black"
                              stroke="black"
                            />
                          ))}
                          <Star size={16} stroke="black" />
                        </div>
                        <span>4.0 (10 đánh giá)</span>
                      </div>
                      <div className="text-sm text-[#B0B0B0]">
                        <div className="flex items-center justify-between">
                          <div className="flex">
                            {[...Array(3)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill="black"
                                stroke="black"
                              />
                            ))}
                            {[...Array(2)].map((_, i) => (
                              <Star key={i} size={16} stroke="black" />
                            ))}
                          </div>
                          <span>TanNhutHa - Oct 29, 2024</span>
                        </div>
                        <p className="line-clamp-3">
                          They are very narrow and somewhat stiff. I've only
                          worn them for 1 day, so maybe I need to break them in
                          more. So far, I like the regular DN's much better.
                        </p>
                        <a
                          href="#"
                          className="text-[1rem] text-black hover:underline"
                        >
                          Xem thêm
                        </a>
                      </div>
                    </div>,
                  ],
                },
              ].map(({ id, title, content }) => (
                <div key={id}>
                  <a
                    href="#"
                    className={`w-full flex items-center justify-between no-underline hover:underline focus:no-underline border-t-2 border-[#B0B0B0] pt-4 pb-4 ${
                      activeSection === id ? "pb-4" : "pb-4"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSectionClick(id);
                    }}
                  >
                    {id === "reviews" ? (
                      title
                    ) : (
                      <>
                        <p className="text-base font-semibold">{title}</p>
                        <motion.img
                          src="/nav/footer_down.svg"
                          alt="Dropdown"
                          className="h-4 w-auto"
                          animate={{ rotate: activeSection === id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </>
                    )}
                  </a>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: activeSection === id ? "auto" : 0,
                      opacity: activeSection === id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0] space-y-1"
                  >
                    {content.map((item, index) =>
                      typeof item === "string" ? (
                        <p className="pb-4" key={index}>{item}</p>
                      ) : (
                        <div className="pb-4" key={index}>{item}</div>
                      )
                    )}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Section 5 */}
            <div className="mb-4 mt-9">
              <h1 className="text-[1.5rem] pb-6 font-bold">Có thể bạn thích</h1>
              <div className="w-full">
                <Swiper
                  spaceBetween={100}
                  slidesPerView={3}
                  loop={false}
                  grabCursor={true}
                  className="select-none w-full"
                >
                  {suggestedProducts.map((product) => (
                    <SwiperSlide key={product.id} className="">
                      {renderProductCard(product)}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>

          {/* Desktop: Container 2 (Thông tin Sticky) */}
          <div className="hidden desktop:block desktop:sticky desktop:top-4 desktop:self-start desktop:w-1/4 gap-16">
            <div className="mt-4 flex flex-col items-start gap-6">
              <div className="w-full flex justify-between">
                <div className="text-sm font-bold opacity-40">
                  {product.category}
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="black" stroke="black" />
                  ))}
                </div>
              </div>
              <h2 className="text-2xl font-bold flex-1">{product.name}</h2>
              <div className="flex items-center gap-4">
                <div className="text-red-500 font-bold text-lg">
                  {discountedPrice.toLocaleString()}đ
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString()}đ
                </div>
              </div>
            </div>

            <div className="mt-16">
              <div className="flex w-full justify-between items-center">
                <h3 className="font-semibold">Sizes</h3>
                <div className="flex justify-center items-center gap-2 ml-4">
                  <Image
                    src="/product/product_size.svg"
                    alt="Bảng size"
                    width={20}
                    height={20}
                  />
                  <p>Bảng size</p>
                </div>
              </div>
              <div className="pt-3 flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleSizeChange(size.value)}
                    className={`px-4 py-2 border rounded-sm text-sm font-medium ${
                      selectedSize === size.value && size.inStock
                        ? "bg-black text-white"
                        : !size.inStock
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                    disabled={!size.inStock}
                  >
                    Size {size.value}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-3 text-red-500 text-sm font-medium">
              Còn {stock} sản phẩm
            </div>

            <div className="flex items-center justify-between mt-16">
              <div className="relative w-full">
                <button
                  onClick={handleAddToCart}
                  className="relative z-10 bg-black text-white w-full px-6 py-2 text-sm font-medium flex items-center justify-between"
                >
                  <span>THÊM VÀO GIỎ HÀNG</span>
                  <Image
                    src="/product/product_addToCart_angle.svg"
                    alt="Thêm vào giỏ hàng"
                    width={20}
                    height={20}
                  />
                </button>
                <div className="absolute bottom-[-0.3rem] right-[-0.3rem] bg-white border-2 border-black w-full px-6 py-2 text-sm font-medium flex items-center justify-between z-0">
                  <span>THÊM VÀO GIỎ HÀNG</span>
                  <Image
                    src="/product/product_addToCart_angle.svg"
                    alt="Thêm vào giỏ hàng"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <button onClick={toggleLike} className="mt-1 ml-4">
                <Image
                  src={
                    isLiked
                      ? "/product/product_like_active.svg"
                      : "/product/product_like_square.svg"
                  }
                  alt={isLiked ? "Đã thích" : "Thích"}
                  width={45}
                  height={45}
                />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/product/product_section3_delivery.svg"
                  alt="Free shipping"
                  width={20}
                  height={20}
                />
                <span className="text-sm">
                  Free ship khi đơn hàng trên 1 triệu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/product/product_section3_swap.svg"
                  alt="Easy return"
                  width={20}
                  height={20}
                />
                <span className="text-sm">Đổi trả hàng dễ dàng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}