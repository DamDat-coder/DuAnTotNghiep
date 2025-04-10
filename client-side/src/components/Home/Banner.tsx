// src/components/Banner.tsx
import Image from "next/image";

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
    <div className="banner w-full">
      {/* Tiêu đề (nếu có) */}
      {title && (
        <h1 className="text-[1.5rem] font-bold desktop:text-[1.5rem] desktop:font-bold">
          {title}
        </h1>
      )}

      {/* Mobile/Tablet: 1 hình */}
      <div className="desktop:hidden">
        <Image
          src={image1}
          alt={altText}
          width={672} // max-w-2xl trên tablet
          height={672}
          className="w-full h-auto object-cover"
        />
        <div className="banner_content flex flex-col items-start justify-evenly gap-3 mt-5">
          <div className="banner_status text-base">{status}</div>
          <div className="banner_name text-[1.5rem] font-bold text-gray-700 tablet:text-2xl leading-[1.8125rem] line-clamp-1">
            {name}
          </div>
          <div className="banner_description desc-text text-gray-700 tablet:text-lg">
            {description}
          </div>
        </div>
        <button className="banner_action text-[1rem] px-6 py-2 bg-black text-white font-bold rounded-full hover:opacity-70 transition-colors mt-5">
          Shop
        </button>
      </div>

      {/* Desktop: 2 hình với overlay */}
      <div className="hidden desktop:flex w-full">
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
  );
}