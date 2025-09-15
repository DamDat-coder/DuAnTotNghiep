"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllNews } from "@/services/newsApi"; // Đổi lại đúng path nếu cần
import { News } from "@/types/new";

// Helper để định dạng ngày an toàn
function formatDateSafe(date?: string | Date) {
  if (!date) return "Không rõ ngày";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Không rõ ngày";
    return d.toLocaleDateString();
  } catch {
    return "Không rõ ngày";
  }
}

export default function NewsContent() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  const postsPerPage = 6;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Breadcrumb
  const breadcrumb = (
    <div className="mb-4 mt-2 flex justify-center laptop:justify-start">
      <span className="text-xs text-gray-400">
        <Link href="/" className="hover:underline">
          Trang chủ
        </Link>
        <span className="mx-1">›</span>
        <span className="text-black">Tin tức</span>
      </span>
    </div>
  );

  // Lấy page hiện tại từ URL
  useEffect(() => {
    const pageParam = Number(searchParams.get("page") || 1);
    setCurrentPage(pageParam > 0 ? pageParam : 1);
  }, [searchParams]);

  // Lấy danh sách bài viết & tags (unique)
  useEffect(() => {
    getAllNews().then((res) => {
      if (res.status === "success" && Array.isArray(res.data)) {
        setNewsList(res.data);

        // Tag: unique, random tối đa 10 tag
        const allTags = res.data.flatMap((news: News) => news.tags || []);
        const uniqueTags = Array.from(new Set(allTags));
        const shuffled = uniqueTags.sort(() => 0.5 - Math.random());
        setTags(shuffled.slice(0, 10));

        // Lọc luôn nếu url có tag
        const tagParam = searchParams.get("tag");
        if (tagParam) {
          setSearchTerm(tagParam);
          const filtered = res.data.filter((news) =>
            (news.tags || []).some(
              (t) => t.toLowerCase() === tagParam.toLowerCase()
            )
          );
          setSearchResults(filtered);
        } else {
          setSearchResults(res.data);
        }
      } else {
        setNewsList([]);
        setTags([]);
        setSearchResults([]);
      }
    });
    // eslint-disable-next-line
  }, [searchParams]);

  // Tự động filter khi searchTerm thay đổi (nếu không có tag trên url)
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (tagParam) return;
    if (!searchTerm.trim()) {
      setSearchResults(newsList);
      return;
    }
    const keyword = searchTerm.toLowerCase();
    const filtered = newsList.filter((news) => {
      const matchTitle = news.title?.toLowerCase().includes(keyword);
      const matchSlug = news.slug?.toLowerCase().includes(keyword);
      const matchTags = (news.tags || []).some((tag) =>
        tag.toLowerCase().includes(keyword)
      );
      return matchTitle || matchSlug || matchTags;
    });
    setSearchResults(filtered);
  }, [searchTerm, newsList, searchParams]);

  // Xem gần đây
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const recent = JSON.parse(localStorage.getItem("recentPosts") || "[]");
        setRecentPosts(Array.isArray(recent) ? recent.slice(0, 5) : []);
      } catch {
        setRecentPosts([]);
      }
    }
  }, []);

  // Hàm chọn tag
  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    router.push(`/posts?tag=${encodeURIComponent(tag)}&page=1`);
  };

  // Nút tìm kiếm
  const handleSearchClick = () => {
    const value = searchTerm.trim();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (!value) {
      router.push("/posts");
    } else {
      params.set("search", value);
      router.push(`/posts?${params.toString()}`);
    }
  };

  // Featured post
  const featuredPost = searchResults[0];
  // Nếu có featured post, các bài còn lại
  const otherPosts = featuredPost ? searchResults.slice(1) : [];

  // Pagination
  const totalPages = Math.max(1, Math.ceil(otherPosts.length / postsPerPage));
  const paginatedResults = otherPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1320px] mx-auto px-2 laptop:px-6">
        <div className="max-w-[350px] mx-auto laptop:max-w-none">
          {breadcrumb}
        </div>

        {/* Search input mobile only */}
        <div className="laptop:hidden mt-2 mb-4 max-w-[350px] mx-auto">
          <input
            type="text"
            placeholder="Nhập từ khóa..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="w-full bg-black text-white py-2 rounded text-sm flex items-center justify-center"
            onClick={handleSearchClick}
          >
            <span className="flex items-center">
              Tìm kiếm
              <span className="ml-1 flex items-center">
                <Image
                  src="https://res.cloudinary.com/testupload1/image/upload/v1756300632/icon_buees1.svg"
                  alt="Search"
                  width={16}
                  height={16}
                />
              </span>
            </span>
          </button>
        </div>
        <div className="laptop:grid laptop:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden laptop:flex flex-col gap-8 border-r pr-8">
            {/* Search input laptop+ only */}
            <div>
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="w-full bg-black text-white py-2 rounded text-sm flex items-center justify-center"
                onClick={handleSearchClick}
              >
                <span className="flex items-center">
                  Tìm kiếm
                  <span className="ml-1 flex items-center">
                    <Image
                      src="https://res.cloudinary.com/testupload1/image/upload/v1756300632/icon_buees1.svg"
                      alt="Search"
                      width={16}
                      height={16}
                    />
                  </span>
                </span>
              </button>
            </div>

            {/* Tag */}
            <div>
              <div className="mb-2 font-semibold text-base flex items-center justify-between">
                Từ khóa tìm kiếm
                <span className="text-xl text-gray-400 ml-2">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M3 17v2h6v-2zm0-6v2h12v-2zm0-6v2h18V5z"
                    ></path>
                  </svg>
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
              <div className="mb-2 font-semibold text-base">Đã xem gần đây</div>
              <div className="flex flex-col gap-4">
                {recentPosts.length === 0 && (
                  <span className="text-gray-400 text-xs">Chưa có bài nào</span>
                )}
                {recentPosts.map((item: any, idx) => (
                  <Link key={item._id || idx} href={`/posts/${item._id}`}>
                    <div className="flex gap-2 items-start cursor-pointer group">
                      <Image
                        src={item.thumbnail || "/default.jpg"}
                        alt={item.title}
                        width={56}
                        height={40}
                        className="w-14 h-10 rounded object-cover flex-shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-blue-700">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateSafe(item.published_at || item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main>
            {/* Featured post */}
            {featuredPost && (
              <div className="hidden laptop:flex flex-col laptop:flex-row gap-6 mb-8">
                <Image
                  src={featuredPost.thumbnail || "/default.jpg"}
                  alt={featuredPost.title}
                  width={350}
                  height={220}
                  className="w-full laptop:w-[330px] h-[200px] laptop:h-[220px] object-cover rounded-xl shadow"
                  priority
                />
                <div className="flex flex-col justify-center gap-2">
                  <h2 className="text-xl laptop:text-2xl font-bold leading-tight mb-2">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-700 text-base laptop:text-base line-clamp-3 mb-2">
                    {featuredPost.meta_description}
                  </p>
                  <Link href={`/posts/${featuredPost._id}`}>
                    <button className="bg-black text-white px-6 py-2 rounded font-medium w-fit hover:bg-gray-800 transition">
                      Đọc thêm
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Grid posts */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6 justify-items-center laptop:justify-items-stretch">
              {/* Featured post on mobile */}
              {featuredPost && (
                <Link
                  href={`/posts/${featuredPost._id}`}
                  className="block laptop:hidden"
                >
                  <div className="space-y-2 cursor-pointer group max-w-[350px] mx-auto">
                    <Image
                      src={featuredPost.thumbnail || "/default.jpg"}
                      alt={featuredPost.title}
                      width={350}
                      height={310}
                      className="mx-auto w-[350px] h-[310px] object-cover rounded laptop:w-full laptop:h-[220px] laptop:mx-0"
                      priority
                    />
                    <h3 className="font-semibold leading-tight line-clamp-2 text-base group-hover:text-blue-700 text-center">
                      {featuredPost.title}
                    </h3>
                    <p className="text-xs text-gray-500 text-center">
                      {formatDateSafe(
                        featuredPost.published_at || featuredPost.createdAt
                      )}
                    </p>
                  </div>
                </Link>
              )}

              {/* Other posts */}
              {paginatedResults.map((news) => (
                <Link key={news._id} href={`/posts/${news._id}`}>
                  <div className="space-y-2 cursor-pointer group max-w-[350px] mx-auto">
                    <Image
                      src={news.thumbnail || "/default.jpg"}
                      alt={news.title}
                      width={350}
                      height={310}
                      className="mx-auto w-[350px] h-[310px] object-cover rounded laptop:w-full laptop:h-[220px] laptop:mx-0"
                    />
                    <h3 className="font-semibold leading-tight line-clamp-2 text-base group-hover:text-blue-700 text-center">
                      {news.title}
                    </h3>
                    <p className="text-xs text-gray-500 text-center">
                      {formatDateSafe(news.published_at || news.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}

              {paginatedResults.length === 0 && (
                <p className="col-span-1 laptop:col-span-3 text-center py-6 text-gray-500">
                  Không tìm thấy bài viết nào.
                </p>
              )}
            </div>

            {/* Pagination */}
            <div className="flex gap-2 justify-center my-10 max-w-[350px] mx-auto">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", (idx + 1).toString());
                    router.push(`/posts?${params.toString()}`);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border text-base font-medium
                    ${
                      currentPage === idx + 1
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                >
                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
