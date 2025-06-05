'use client';
import React from 'react';

const recentPosts = [
  {
    title: "Kinh nghiệm phục hồi Mộc Châu bằng xe máy",
    date: "10.03.2023",
    image: "/posts/thumb1.png",
  },
  {
    title: "Đi nhanh kẻo lỡ vườn hoa thanh thảo tím rực tựa trời Âu",
    date: "10.03.2023",
    image: "/posts/thumb2.png",
  },
  {
    title: "Sapa có homestay nào 'ngon - bổ - rẻ'?",
    date: "10.03.2023",
    image: "/posts/thumb3.png",
  },
  {
    title: "Top 11 món ăn ngon còn đậm bản nhất định phải thử",
    date: "10.03.2023",
    image: "/posts/thumb4.png",
  },
];

const newsList = Array.from({ length: 6 }).map((_, idx) => ({
  image: "/posts/image.png",
  title: "Tái Chế Quần Áo Cũ – Xu Hướng Thời Trang Bền Vững Được Ưa Chuộng",
  date: "21/05/2025",
  tag: "Chất liệu",
}));

const tags = [
  "Khuyến mãi", "Du lịch Huế", "Hội An", "Khách sạn giá rẻ",
  "Ẩm thực Hà Nội", "Voucher"
];

// LAYOUT CHO LAPTOP & DESKTOP
const DesktopNewsLayout = () => (
  <div className="
      hidden laptop:grid grid-cols-[320px_1fr] gap-8
      max-w-[1440px] mx-auto
      px-4
      laptop:px-[80px]
      py-10
    ">
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
      {/* Tags */}
      <div>
        <div className="mb-2 font-semibold text-base">Từ khóa tìm kiếm</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-black hover:text-white transition">
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
              <img src={item.image} alt={item.title} className="w-14 h-10 rounded object-cover flex-shrink-0" />
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
      {/* Featured Article */}
      <div className="flex gap-6 mb-10">
        <img 
          src="/posts/imagefeatured.png" 
          alt="featured" 
          className="
            w-[260px] h-[180px] laptop:w-[320px] laptop:h-[210px] 
            desktop:w-[360px] desktop:h-[240px] 
            object-cover rounded-lg" 
        />
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-xl laptop:text-2xl font-bold leading-tight mb-2">
            Cách Phối Đồ Cơ Bản Cho Người Mới Bắt Đầu: Đẹp - Đơn Giản - Hiệu Quả
          </h2>
          <p className="text-gray-700 text-base laptop:text-base desktop:text-lg">
            Năm 2025 mang đến làn sóng thời trang mới với sự bùng nổ của phong cách Y2K, Minimalism và "quiet luxury". Hãy cùng khám phá những xu hướng đang được săn đón nhất hiện nay!
          </p>
          <button className="bg-black text-white px-5 py-2 mt-2 rounded font-medium w-fit hover:bg-gray-800 transition">
            Đọc thêm
          </button>
        </div>
      </div>
      {/* News List: luôn 3 cột ở laptop/desktop, nhưng card nhỏ hơn ở laptop */}
      <div className="grid grid-cols-3 gap-6">
        {newsList.map((news, idx) => (
          <div key={idx} className="space-y-2">
            <img
              src={news.image}
              alt="news"
              className="
                w-full h-[180px] laptop:h-[220px] desktop:h-[335px] 
                object-cover rounded"
            />
            <h3 className="font-semibold leading-tight line-clamp-2 
              text-sm laptop:text-base desktop:text-lg">
              {news.title}
            </h3>
            <p className="text-xs laptop:text-sm desktop:text-base text-gray-500">
              {news.tag} | {news.date}
            </p>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center gap-2 pt-10 text-sm">
        {['‹', '01', '02', '03', '…', '12', '›'].map((pg, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 border rounded-full ${
              pg === '01' ? 'bg-black text-white' : 'text-gray-700'
            }`}
          >
            {pg}
          </button>
        ))}
      </div>
    </main>
  </div>
);

// Mobile layout giữ nguyên
const MobileNewsLayout = () => (
  <div className="w-full max-w-[390px] mx-auto px-4 pt-4 pb-8 space-y-6 laptop:hidden">
    {/* Search */}
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Nhập từ khóa..."
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded"
      />
      <button className="w-full bg-black text-white py-2 rounded text-sm">
        Tìm kiếm
      </button>
    </div>
    {/* Featured Article */}
    <div className="flex gap-2">
      <img
        src="/posts/imagefeatured.png"
        alt="featured"
        className="w-1/3 h-auto object-cover rounded"
      />
      <div className="w-2/3 space-y-1">
        <h2 className="text-sm font-semibold leading-snug">
          Cách Phối Đồ Cơ Bản Cho Người Mới Bắt Đầu: Đẹp – Đơn Giản – Hiệu Quả
        </h2>
      </div>
    </div>
    {/* News List */}
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="space-y-2">
        <img
          src="/posts/image.png"
          alt="news"
          className="w-full h-auto rounded object-cover"
        />
        <h3 className="text-base font-semibold leading-tight">
          Tái Chế Quần Áo Cũ – Xu Hướng Thời Trang Bền Vững Được Ưa Chuộng
        </h3>
        <p className="text-sm text-gray-500">Chất liệu | 21/05/2025</p>
      </div>
    ))}
    {/* Pagination */}
    <div className="flex justify-center gap-2 pt-4 flex-wrap text-sm">
      {['‹', '01', '02', '03', '…', '12', '›'].map((pg, idx) => (
        <button
          key={idx}
          className={`px-3 py-1 border rounded-full ${
            pg === '01' ? 'bg-black text-white' : 'text-gray-700'
          }`}
        >
          {pg}
        </button>
      ))}
    </div>
  </div>
);

// Trang Tin tức tổng (responsive, KHÔNG header/footer)
const NewsPage = () => (
  <>
    <MobileNewsLayout />
    <DesktopNewsLayout />
  </>
);

export default NewsPage;
