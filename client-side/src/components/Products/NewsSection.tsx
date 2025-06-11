// src/components/NewsSection.tsx
import Container from "../Core/Container";
import Image from "next/image";
import NewsSwiper from "./NewsSwiper";

interface News {
  id: string;
  img: string;
  newsCategory: string;
  name: string;
  benefit?: string;
}

interface NewsSectionProps {
  newsItems: News[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function NewsSection({
  newsItems,
  mobileSlidesPerView = 1.5,
  tabletSlidesPerView = 2.5,
}: NewsSectionProps) {
  if (!newsItems || newsItems.length === 0) {
    return (
      <Container className="py-4">
        <p className="text-center text-gray-500">
          Không có tin tức nào để hiển thị.
        </p>
      </Container>
    );
  }

  return (
    <div>
      <h1 className="text-[1.5rem] pb-6 font-bold">Tin Tức Mới Nhất</h1>

      {/* Mobile: Swiper */}
      <div className="block tablet:block laptop:hidden desktop:hidden">
        <NewsSwiper
          newsItems={newsItems}
          mobileSlidesPerView={mobileSlidesPerView}
          tabletSlidesPerView={tabletSlidesPerView}
        />
      </div>

      {/* Tablet/Desktop: Grid */}
      <div className="hidden desktop:grid laptop:grid desktop:grid-cols-3 gap-4 desktop:gap-8  laptop:grid-cols-3 laptop:gap-8">
        {newsItems.map((news) => (
          <div key={news.id} className="flex flex-col items-start gap-3">
            <Image
              src={`/memberBenefit/${news.img}`}
              alt={news.name || "Tin tức"}
              width={450}
              height={257}
              className="w-full h-[136px] tablet:h-[180px] desktop:h-[257px] laptop:h-[257px] object-cover rounded select-none"
              draggable={false}
            />
            <div className="flex flex-col gap-1">
              <div className="text-base text-gray-700">{news.newsCategory}</div>
              <div className="text-[1.25rem] font-bold text-gray-700 leading-[1.5rem] line-clamp-2">
                {news.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
