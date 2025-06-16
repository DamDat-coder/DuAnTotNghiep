// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { IProduct } from "@/types/product";

// interface BannerProps {
//   product: IProduct;
//   status?: string;
//   description?: string;
//   className?: string;
// }

// export default function Banner({
//   product,
//   status = "Mới ra mắt",
//   description = "Khám phá sản phẩm thời trang mới nhất với phong cách độc đáo.",
//   className = "",
// }: BannerProps) {
//   const image1 = product.images[0]
//     ? `/product/img/${product.images[0]}`
//     : "/placeholder-image.jpg";
//   const image2 = product.images[1]
//     ? `/product/img/${product.images[1]}`
//     : "/placeholder-image.jpg";

//   // Hàm tìm variant giá thấp nhất (nếu cần hiển thị giá)
//   const getLowestPriceVariant = (
//     variants: IProduct["variants"]
//   ): { price: number; discountPercent: number } => {
//     if (!variants || variants.length === 0) {
//       return { price: 0, discountPercent: 0 };
//     }
//     return variants.reduce((lowest, variant) => {
//       return variant.price < lowest.price ? variant : lowest;
//     }, variants[0]);
//   };

//   const { price, discountPercent } = getLowestPriceVariant(product.variants);
//   const discountPrice = Math.round(price * (1 - discountPercent / 100));

//   return (
//     <section
//       className={`relative w-full h-[20rem] tablet:h-[30rem] flex flex-col tablet:flex-row gap-4 px-4 py-8 bg-gray-100 ${className}`}
//       aria-label={`Banner quảng cáo sản phẩm ${product.name}`}
//     >
//       {/* Hình ảnh */}
//       <div className="flex w-full tablet:w-1/2 gap-4">
//         <div className="relative w-1/2 h-[15rem] tablet:h-[25rem]">
//           <Image
//             src={image1}
//             alt={`Hình ảnh 1 của ${product.name}`}
//             fill
//             className="object-cover rounded"
//             priority
//           />
//         </div>
//         <div className="relative w-1/2 h-[15rem] tablet:h-[25rem]">
//           <Image
//             src={image2}
//             alt={`Hình ảnh 2 của ${product.name}`}
//             fill
//             className="object-cover rounded"
//           />
//         </div>
//       </div>

//       {/* Nội dung */}
//       <div className="w-full tablet:w-1/2 flex flex-col justify-center items-start px-4">
//         <span className="text-sm text-red-500 font-bold uppercase">
//           {status}
//         </span>
//         <h2 className="text-2xl tablet:text-4xl font-bold text-[#374151] mt-2">
//           {product.name}
//         </h2>
//         <p className="text-base text-gray-600 mt-4">{description}</p>
//         {discountPrice > 0 && (
//           <div className="mt-4 flex items-center gap-2">
//             <span className="text-lg font-bold text-red-500">
//               {discountPrice.toLocaleString("vi-VN")}₫
//             </span>
//             {discountPercent > 0 && (
//               <span className="text-sm text-gray-500 line-through">
//                 {price.toLocaleString("vi-VN")}₫
//               </span>
//             )}
//           </div>
//         )}
//         <Link
//           href={`/products/${product.id}`}
//           className="mt-6 px-6 py-3 bg-black text-white font-bold rounded hover:bg-gray-800"
//           aria-label={`Mua sản phẩm ${product.name}`}
//         >
//           Shop
//         </Link>
//       </div>
//     </section>
//   );
// }

// src/components/Banner.tsx
import Image from "next/image";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
interface BannerProps {
  title?: string; // Tiêu đề (ví dụ: "Đừng Bỏ Lỡ")
  status: string; // Trạng thái (ví dụ: "Vừa ra mắt", "Cảm giác thoải mái")
  name: string; // Tên sản phẩm
  description: string; // Mô tả
  image1: string; // Hình 1
  image2: string; // Hình 2 (dùng trên desktop)
  altText: string; // Alt text cho hình
}

export default function Banner({
  title,
  status,
  name,
  description,
  image1,
  image2,
  altText,
}: BannerProps) {
  return (
    <FadeInWhenVisible>
      <div className="banner w-full">
        {/* Tiêu đề (nếu có) */}
        {title && (
          <h1 className="text-[1.5rem] font-bold laptop:text-[1.5rem] desktop:text-[1.5rem] desktop:font-bold pb-6">
            {title}
          </h1>
        )}

        {/* Mobile/Tablet: 1 hình */}
        <div className="px-4 laptop:hidden desktop:hidden">
          <Image
            src={image1}
            alt={altText}
            width={672}
            height={672}
            className="w-full h-auto tablet:h-[37.5rem] object-cover"
          />
          <div className="banner_content flex flex-col items-start tablet:items-center justify-evenly gap-3 mt-5">
            <div className="banner_status text-base">{status}</div>
            <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl leading-[1.8125rem] line-clamp-1">
              {name}
            </div>
            <div className="banner_description desc-text text-gray-700 tablet:text-lg">
              {description}
            </div>
            <button className="banner_action text-[1rem] px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors">
              Shop
            </button>
          </div>
        </div>

        {/* Desktop: 2 hình với overlay */}
        <div className="hidden laptop:flex desktop:flex w-full">
          <div className="relative w-full flex">
            {/* Hình 1 */}
            <div className="w-[50%]">
              <Image
                src={image1}
                alt={altText}
                width={1280} // 50% của 2560px
                height={800}
                className="w-full h-[50rem] object-cover"
              />
            </div>
            {/* Hình 2 */}
            <div className="w-[50%]">
              <Image
                src={image2}
                alt={altText}
                width={1280}
                height={800}
                className="w-full h-[50rem] object-cover"
              />
            </div>
            {/* Overlay cho toàn bộ hình lớn */}
            <div className="absolute bottom-0 w-full h-[33.33%] bg-gradient-to-b from-transparent to-black flex justify-center items-center">
              <div className="text-white text-center">
                <div className="banner_status text-base">{status}</div>
                <div className="banner_name text-[1.5rem] font-bold desktop:text-3xl leading-[1.8125rem] line-clamp-1">
                  {name}
                </div>
                <div className="banner_description desc-text desktop:text-lg">
                  {description}
                </div>
                <button className="banner_action text-[1rem] px-6 py-2 bg-white text-black font-bold rounded-full hover:opacity-70 transition-colors mt-3">
                  Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeInWhenVisible>
  );
}