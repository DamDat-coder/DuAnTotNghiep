// src/components/NewsSection.tsx
"use client";

import { useEffect, useState } from "react";
import Container from "../../Core/Container";
import Image from "next/image";
import NewsSwiper from "./NewsSwiper";
import { News } from "@/types/new";
import { getAllNews } from "@/services/newsApi";
import Link from "next/link";

interface NewsSectionProps {
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function NewsSection({
  mobileSlidesPerView = 1.5,
  tabletSlidesPerView = 2.5,
}: NewsSectionProps) {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const resdata = await getAllNews();
        const result = resdata.data?.slice(0, 3) || [];
        setNewsItems(result);
      } catch (err: any) {
        console.error("Error fetching news:", err);
        setError("Không thể tải danh sách tin tức.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <p className="text-center text-gray-500">Đang tải tin tức...</p>
      </Container>
    );
  }

  if (error || newsItems.length === 0) {
    return (
      <Container className="py-4">
        <p className="text-center text-gray-500">
          {error || "Không có tin tức nào để hiển thị."}
        </p>
      </Container>
    );
  }

  return (
    <div>
      <h1 className="text-[1.5rem] pb-6 font-bold">Tin Tức Mới Nhất</h1>

      {/* Mobile - Tablet */}
      <div className="block tablet:block laptop:hidden desktop:hidden">
        <NewsSwiper
          newsItems={newsItems}
          mobileSlidesPerView={mobileSlidesPerView}
          tabletSlidesPerView={tabletSlidesPerView}
        />
      </div>

      {/* Desktop */}
      <div className="hidden desktop:grid laptop:grid desktop:grid-cols-3 gap-4 desktop:gap-8 laptop:grid-cols-3 laptop:gap-8">
        {newsItems.map((news) => (
          <Link
            href={`/posts/${news._id}`}
            key={news._id || news.id}
            className="flex flex-col items-start gap-3"
          >
            <Image
              src={news.thumbnail || "/placeholder-image.jpg"}
              alt={news.title}
              width={450}
              height={257}
              className="w-full h-[136px] tablet:h-[180px] desktop:h-[257px] laptop:h-[257px] object-cover rounded select-none"
              draggable={false}
            />
            <div className="flex flex-col gap-1">
              <div className="text-base text-gray-700">
                {news.category_id?.name || "Không rõ danh mục"}
              </div>
              <div className="text-[1.25rem] font-bold text-gray-700 leading-[1.5rem] line-clamp-2">
                {news.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
