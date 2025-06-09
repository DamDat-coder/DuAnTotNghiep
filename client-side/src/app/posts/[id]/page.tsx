'use client';
import React from 'react';
import Image from 'next/image';

// --- Sample data, thay bằng fetch hoặc props ---
const post = {
  title: "Đẹp ngỡ ngàng với cánh đồng hoa tam giác mạch trái mùa ở Hà Giang",
  date: "02.03.2023",
  time: "09:00 AM",
  author: "Admin",
  intro: "Mặc dù tháng 11 mới diễn ra Lễ hội hoa tam giác mạch, nhưng vào thời điểm này, trên những cung đường đến Đồng Văn, những cánh đồng hoa tam giác mạch đã nở rộ bên sườn núi.",
  content: [
    {
      type: 'paragraph',
      text: `Hà Giang là mảnh đất địa đầu Tổ quốc, cuốn hút lòng người bởi những cao nguyên đá huyền thoại và những cung đường đèo uốn lượn, những ruộng bậc thang đẹp như tranh vẽ. Đến Hà Giang vào thời điểm này, du khách còn mê mẩn với những cánh đồng hoa tam giác mạch đã nở rộ bên sườn núi, thung lũng.`
    },
    {
      type: 'image',
      src: '/posts/news1.jpg',
      caption: 'Lorem ipsum dolor sit amet consectetur. Et leo neque nunc ullamcorper'
    },
    {
      type: 'paragraph',
      text: `Theo truyền thuyết, Tiên Ngô và Tiên Gạo đã khắp nhân gian gieo hạt. Sau khi hoàn thành công việc, họ đói mày ngô và mày trấu còn thừa xuống khe núi. Năm nọ, bản làng hết gạo ăn và chìm trong nạn đói.`
    },
    // ...các đoạn khác
    {
      type: 'heading',
      text: 'Hoa Tam Giác Mạch – “đặc sản” Hà Giang!'
    },
    {
      type: 'paragraph',
      text: `Tam giác mạch, hay còn gọi là mạch ba góc, là một loại cây họ rau răm, thân thảo có thể cao từ 0.4m đến 1,7m...`
    },
    {
      type: 'image',
      src: '/posts/news2.jpg',
      caption: 'Lorem ipsum dolor sit amet consectetur. Et leo neque nunc ullamcorper'
    },
    {
      type: 'paragraph',
      text: `Vào những ngày tiết trời dần chuyển sang Đông, hoa Tam Giác Mạch lại kiên cường nở rộ trên đá...`
    },
  ],
  tags: ['Hà Giang', 'Tháng 10', 'Trải nghiệm']
};

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

// ---- Component ----
const NewsDetailPage = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 laptop:px-[80px] py-8 flex gap-12">
      {/* Sidebar */}
      <aside className="hidden laptop:flex flex-col gap-8 border-r pr-8 w-[320px]">
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
            {['Khuyến mãi', 'Du lịch Huế', 'Hội An', 'Khách sạn giá rẻ', 'Ẩm thực Hà Nội', 'Voucher'].map((tag, idx) => (
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
                <Image src={item.image} alt={item.title} width={56} height={40} className="w-14 h-10 rounded object-cover flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium leading-snug line-clamp-2">{item.title}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Title + meta */}
        <h1 className="text-2xl laptop:text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-5">
          <span>🕒 {post.time}</span>
          <span>📅 {post.date}</span>
          <span>👤 {post.author}</span>
        </div>
        <hr className="mb-5"/>
        {/* Intro */}
        <p className="font-semibold mb-4">{post.intro}</p>
        {/* Nội dung bài viết */}
        <div className="prose prose-neutral max-w-none">
          {post.content.map((block, idx) => {
            if (block.type === 'paragraph')
              return <p key={idx}>{block.text}</p>;
            if (block.type === 'heading')
              return <h2 key={idx}>{block.text}</h2>;
            if (block.type === 'image')
              return (
                <figure key={idx} className="my-6">
                  <Image src={block.src} alt={block.caption} width={740} height={400} className="rounded-xl w-full h-auto object-cover" />
                  {block.caption && <figcaption className="text-center text-xs text-gray-400 mt-2">{block.caption}</figcaption>}
                </figure>
              );
            return null;
          })}
        </div>
        {/* Tags */}
        <div className="flex gap-2 mt-8 mb-2">
          {post.tags.map(tag => (
            <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">#{tag}</span>
          ))}
        </div>
        {/* Share */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-sm">Share this post</span>
          <div className="flex gap-2 text-gray-500">
            <a href="#" aria-label="Share Facebook"><i className="fab fa-facebook-f" /></a>
            <a href="#" aria-label="Share Twitter"><i className="fab fa-twitter" /></a>
            <a href="#" aria-label="Share Email"><i className="fas fa-envelope" /></a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsDetailPage;
