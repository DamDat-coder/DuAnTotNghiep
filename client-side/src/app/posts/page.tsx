'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllNews } from '@/services/newApi';
import { News } from '@/types/new';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 9;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lấy page hiện tại từ URL (mặc định 1)
  useEffect(() => {
    const pageParam = Number(searchParams.get('page') || 1);
    setCurrentPage(pageParam > 0 ? pageParam : 1);
  }, [searchParams]);

  // Lấy danh sách bài viết và tags, nếu có tag trên url thì filter luôn
  useEffect(() => {
    getAllNews().then((res) => {
      if (res.status === 'success') {
        setNewsList(res.data);

        const allTags = res.data.flatMap((news: News) => news.tags || []);
        setTags(Array.from(new Set(allTags)));

        const tagParam = searchParams.get('tag');
        if (tagParam) {
          setSearchTerm(tagParam);
          const filtered = res.data.filter(news =>
            (news.tags || []).some(t =>
              t.toLowerCase() === tagParam.toLowerCase()
            )
          );
          setSearchResults(filtered);
        } else {
          setSearchResults(res.data);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Tự động filter khi searchTerm thay đổi (chỉ khi không có tag trên url)
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) return;
    if (!searchTerm.trim()) {
      setSearchResults(newsList);
      return;
    }
    const keyword = searchTerm.toLowerCase();
    const filtered = newsList.filter(news => {
      const matchTitle = news.title?.toLowerCase().includes(keyword);
      const matchSlug = news.slug?.toLowerCase().includes(keyword);
      const matchTags = (news.tags || []).some(tag =>
        tag.toLowerCase().includes(keyword)
      );
      return matchTitle || matchSlug || matchTags;
    });
    setSearchResults(filtered);
  }, [searchTerm, newsList, searchParams]);

  // Hàm chọn tag
  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    // Reset về page 1 khi lọc tag
    router.push(`/posts?tag=${encodeURIComponent(tag)}&page=1`);
  };

  // Nút tìm kiếm giữ lại cho giao diện, có thể dùng hoặc bỏ
  const handleSearchClick = () => {
    // Đưa về page 1 khi tìm kiếm
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`/posts?${params.toString()}`);
    // (Auto-search nên nút này chỉ update URL)
  };

  // Pagination FE
  const totalPosts = searchResults.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

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
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              className="w-full bg-black text-white py-2 rounded text-sm"
              onClick={handleSearchClick}
            >
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
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main>
          {paginatedResults.length > 0 && (
            <div className="flex gap-6 mb-10">
              <Image
                src={paginatedResults[0].thumbnail || '/default.jpg'}
                alt={paginatedResults[0].title}
                width={320}
                height={210}
                className="w-[260px] h-[180px] laptop:w-[320px] laptop:h-[210px] desktop:w-[360px] desktop:h-[240px] object-cover rounded-lg"
              />
              <div className="flex flex-col justify-center gap-2">
                <h2 className="text-xl laptop:text-2xl font-bold leading-tight mb-2">
                  {paginatedResults[0].title}
                </h2>
                <p className="text-gray-700 text-base laptop:text-base desktop:text-lg line-clamp-3">
                  {paginatedResults[0].meta_description}
                </p>
                <Link href={`/posts/${paginatedResults[0]._id}`}>
                  <button className="bg-black text-white px-5 py-2 mt-2 rounded font-medium w-fit hover:bg-gray-800 transition">
                    Đọc thêm
                  </button>
                </Link>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-6">
            {paginatedResults.map((news) => (
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
            {paginatedResults.length === 0 && (
              <p className="col-span-3 text-center py-6 text-gray-500">Không tìm thấy bài viết nào.</p>
            )}
          </div>
          {/* Pagination */}
          <div className="flex gap-2 justify-center my-8">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', (idx + 1).toString());
                  router.push(`/posts?${params.toString()}`);
                }}
                className={`px-3 py-1 rounded border ${
                  currentPage === idx + 1
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
