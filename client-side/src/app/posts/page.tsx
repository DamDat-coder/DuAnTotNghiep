'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllNews } from '@/services/newApi'; 
import { News } from '@/types/new';

const recentPosts = [];

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getAllNews().then((res) => {
      if (res.status === 'success') {
        setNewsList(res.data);

        // 🔄 Lấy tất cả tags từ các bài viết và loại bỏ trùng
        const allTags = res.data.flatMap((news: News) => news.tags || []);
        const uniqueTags = Array.from(new Set(allTags));
        setTags(uniqueTags);
      }
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="hidden laptop:grid grid-cols-[320px_1fr] gap-8 max-w-[1440px] mx-auto px-4 laptop:px-[80px] py-10">
        {/* Sidebar */}
        <aside className="flex flex-col gap-8 border-r pr-8">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Nhập từ khóa..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded mb-2"
            />
            <button className="w-full bg-black text-white py-2 rounded text-sm">
              Tìm kiếm
            </button>
          </div>
          {/* Tags (dynamic) */}
          <div>
            <div className="mb-2 font-semibold text-base">Từ khóa tìm kiếm</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-black hover:text-white transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Recent Posts */}
          <div>
            <div className="mb-2 font-semibold text-base">Đã xem gần đây</div>
            <div className="flex flex-col gap-4">
              {recentPosts.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={56}
                    height={40}
                    className="w-14 h-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium leading-snug line-clamp-2">{item.title}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main>
          {newsList.length > 0 && (
            <div className="flex gap-6 mb-10">
              <Image
                src={newsList[0].thumbnail || '/default.jpg'}
                alt={newsList[0].title}
                width={320}
                height={210}
                className="w-[260px] h-[180px] laptop:w-[320px] laptop:h-[210px] desktop:w-[360px] desktop:h-[240px] object-cover rounded-lg"
              />
              <div className="flex flex-col justify-center gap-2">
                <h2 className="text-xl laptop:text-2xl font-bold leading-tight mb-2">
                  {newsList[0].title}
                </h2>
                <p className="text-gray-700 text-base laptop:text-base desktop:text-lg line-clamp-3">
                  {newsList[0].meta_description}
                </p>
                <Link href={`/posts/${newsList[0]._id}`}>
                  <button className="bg-black text-white px-5 py-2 mt-2 rounded font-medium w-fit hover:bg-gray-800 transition">
                    Đọc thêm
                  </button>
                </Link>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-6">
            {newsList.map((news) => (
              <Link key={news._id} href={`/posts/${news._id}`}>
                <div className="space-y-2 cursor-pointer group">
                  <Image
                    src={news.thumbnail || '/default.jpg'}
                    alt={news.title}
                    width={335}
                    height={220}
                    className="w-full h-[180px] laptop:h-[220px] object-cover rounded group-hover:scale-105 transition"
                  />
                  <h3 className="font-semibold leading-tight line-clamp-2 text-sm laptop:text-base desktop:text-lg group-hover:text-blue-700">
                    {news.title}
                  </h3>
                  <p className="text-xs laptop:text-sm desktop:text-base text-gray-500">
                    {new Date(news.published_at || news.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
