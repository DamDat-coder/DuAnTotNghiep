'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getNewsDetail } from '@/services/newApi';
import { News } from '@/types/new';

const demoRecentPosts = [
  {
    title: 'Kinh nghiệm phục hồi Mộc Châu bằng xe máy',
    date: '10.03.2023',
    image: '/posts/thumb1.png',
  },
  {
    title: 'Đi nhanh kẻo lỡ vườn hoa thanh thảo tím rực tựa trời Âu',
    date: '10.03.2023',
    image: '/posts/thumb1.png',
  },
  {
    title: "Sapa có homestay nào 'ngon - bổ - rẻ'?",
    date: '10.03.2023',
    image: '/posts/thumb1.png',
  },
  {
    title: 'Top 11 món ăn ngon còn đậm bản nhất định phải thử',
    date: '10.03.2023',
    image: '/posts/thumb1.png',
  },
];

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<News | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getNewsDetail(id as string)
        .then((data) => {
          setArticle(data);
        })
        .catch(console.error);
    }
  }, [id]);

  if (!article) return <p className="text-center py-10">Đang tải bài viết...</p>;

  const authorName =
    typeof article.user_id === 'object' && article.user_id !== null
      ? article.user_id.name
      : 'Ẩn danh';

  const publishDate = article.published_at || article.createdAt;

  // Hàm chuyển sang trang /posts?tag=xxx khi bấm hashtag
  const handleTagClick = (tag: string) => {
    router.push(`/posts?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1320px] mx-auto flex flex-row gap-10 pt-6 pb-10 px-4 laptop:px-8">
        {/* Sidebar */}
        <aside className="hidden laptop:flex flex-col w-[270px] shrink-0 gap-8 border-r pr-8">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Nhập từ khóa..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded mb-2"
              disabled
            />
            <button className="w-full bg-black text-white py-2 rounded text-sm" disabled>
              Tìm kiếm
            </button>
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2 font-semibold text-base">Từ khóa tìm kiếm</div>
            <div className="flex flex-wrap gap-2">
              {(article.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-black hover:text-white transition"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recent posts */}
          <div>
            <div className="mb-2 font-semibold text-base">Đã xem gần đây</div>
            <div className="flex flex-col gap-4">
              {demoRecentPosts.map((item, idx) => (
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

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span className="mx-1">›</span>
            <Link href="/posts" className="hover:underline">Tin tức</Link>
            <span className="mx-1">›</span>
            <span className="text-black">{article.title?.slice(0, 40) || '...'}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl laptop:text-3xl font-bold mb-3 leading-tight">
            {article.title || 'Không có tiêu đề'}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
            <span>📅 {publishDate ? new Date(publishDate).toLocaleDateString() : 'Không rõ ngày'}</span>
            <span>👤 {authorName}</span>
          </div>

          {/* Nội dung bài viết */}
          <article
            className="prose max-w-none text-base"
            dangerouslySetInnerHTML={{ __html: article.content || '<p>Không có nội dung.</p>' }}
          />

          {/* Tags ở cuối bài, click để search */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(article.tags || []).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-black hover:text-white transition"
                onClick={() => handleTagClick(tag)}
                style={{ userSelect: 'none' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
