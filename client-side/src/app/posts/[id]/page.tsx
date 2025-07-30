'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getNewsDetail, getAllNews } from '@/services/newsApi';
import { News } from '@/types/new';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<News | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Breadcrumb
  const breadcrumb = (
    <div className="mb-4 pt-3">
      <span className="text-xs text-[#C2C2C2]">
        <Link href="/" className="hover:underline text-[#C2C2C2]">Trang chủ</Link>
        <span className="mx-1">{'>'}</span>
        <Link href="/posts" className="hover:underline text-[#C2C2C2]">Tin tức</Link>
        <span className="mx-1">{'>'}</span>
        <span className="text-[#C2C2C2]">{article?.title?.slice(0, 60) || '...'}</span>
      </span>
    </div>
  );

  // Lưu vào recentPosts (localStorage)
  useEffect(() => {
    if (article && article._id) {
      const localKey = 'recentPosts';
      let recent = [];
      try {
        recent = JSON.parse(localStorage.getItem(localKey) || '[]');
      } catch { recent = []; }
      const filtered = recent.filter((item: any) => item._id !== article._id);
      const newRecent = [
        {
          _id: article._id,
          title: article.title,
          thumbnail: article.thumbnail,
          published_at: article.published_at,
          createdAt: article.createdAt
        },
        ...filtered
      ].slice(0, 5);
      localStorage.setItem(localKey, JSON.stringify(newRecent));
      setRecentPosts(newRecent);
    }
  }, [article]);

  // Lấy recentPosts từ localStorage lần đầu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const recent = JSON.parse(localStorage.getItem('recentPosts') || '[]');
        setRecentPosts(recent);
      } catch {
        setRecentPosts([]);
      }
    }
  }, []);

  // Lấy tag hệ thống random 20 tag
  useEffect(() => {
    getAllNews().then((res) => {
      if (res.status === 'success') {
        const allTags = res.data.flatMap((news: News) => news.tags || []);
        const uniqueTags = Array.from(new Set(allTags));
        const shuffled = uniqueTags.sort(() => 0.5 - Math.random());
        setTags(shuffled.slice(0, 20));
      }
    });
  }, []);

  // Lấy bài viết chi tiết
  useEffect(() => {
    if (id) {
      getNewsDetail(id as string)
        .then((data) => {
          setArticle(data);
        })
        .catch(console.error);
    }
  }, [id]);

  // Chuyển tag
  const handleTagClick = (tag: string) => {
    router.push(`/posts?tag=${encodeURIComponent(tag)}`);
  };

  // Nút tìm kiếm
  const handleSearchClick = () => {
    const value = searchTerm.trim();
    if (!value) {
      router.push('/posts');
    } else {
      router.push(`/posts?search=${encodeURIComponent(value)}`);
    }
  };

  if (!article) return <p className="text-center py-10">Đang tải bài viết...</p>;

  const authorName =
    typeof article.user_id === 'object' && article.user_id !== null
      ? article.user_id.name
      : 'Ẩn danh';

  const publishDate = article.published_at || article.createdAt;

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1320px] mx-auto px-4 laptop:px-6">
        {breadcrumb}
        <div className="flex flex-col laptop:flex-row gap-10 pb-10">
          {/* Sidebar */}
          <aside className="flex flex-col w-full laptop:w-[270px] shrink-0 gap-8 border-r pr-0 laptop:pr-8 max-w-[320px]">
            {/* Tìm kiếm */}
            <div>
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button
                className="w-full bg-black text-white py-2 rounded text-sm"
                onClick={handleSearchClick}
              >
                Tìm kiếm <span className="ml-1">🔍</span>
              </button>
            </div>
            {/* Tag hệ thống */}
            <div>
              <div className="mb-2 font-semibold text-base flex items-center justify-between">
                Từ khóa tìm kiếm
                <span className="text-xl text-gray-400 ml-2">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17v2h6v-2zm0-6v2h12v-2zm0-6v2h18V5z"></path></svg>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
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
            {/* Đã xem gần đây */}
            <div>
              <div className="mb-2 font-semibold text-base flex items-center gap-2">
                Đã xem gần đây
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#C2C2C2" strokeWidth="2" d="M1 12S5.636 4 12 4s11 8 11 8-4.636 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#C2C2C2" strokeWidth="2"/></svg>
              </div>
              <div className="flex flex-col gap-4">
                {recentPosts.length === 0 && (
                  <span className="text-gray-400 text-xs">Chưa có bài nào</span>
                )}
                {recentPosts.map((item, idx) => (
                  <Link key={item._id} href={`/posts/${item._id}`}>
                    <div className="flex gap-2 items-start cursor-pointer group">
                      <Image
                        src={item.thumbnail || '/default.jpg'}
                        alt={item.title}
                        width={56}
                        height={40}
                        className="w-14 h-10 rounded object-cover flex-shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-blue-700">{item.title}</span>
                        <span className="text-xs text-gray-400">{new Date(item.published_at || item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <hr className="my-6 border-[#E6E6E6]" />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
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
    </div>
  );
}
