'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Dữ liệu bài viết mẫu, sau này bạn fetch bằng params.id
const demoArticle = {
  title: 'Đẹp ngỡ ngàng với cảnh đồng hoa tam giác mạch trái mùa ở Hà Giang',
  author: 'Admin',
  date: '23.03.2023',
  time: '09:00 AM',
  mainImage: '/posts/hinh1.png',
  content: [
    {
      type: 'text',
      value: `Mỗi độ tháng 11 mới diễn ra lễ hội hoa tam giác mạch, nhưng vào thời điểm này, trên những cung đường đồng bằng Đông Văn, những cánh đồng hoa tam giác mạch vẫn nở rộ bên suối nhỏ.`
    },
    {
      type: 'text',
      value: `Hà Giang là mảnh đất địa đầu Tổ quốc, cuốn hút khách không bởi những cao nguyên đá huyền thoại hay những cung đường đèo uốn lượn, những cánh rừng thơ mộng như tranh vẽ. Đến Hà Giang vào tháng 10, du khách còn mê mẩn với những cánh đồng hoa tam giác mạch trái mùa đẹp bất chợt, tinh khôi, mộng lành.`
    },
    {
      type: 'image',
      src: '/posts/hinh1.png',
      caption: 'Lorem ipsum dolor sit amet consectetur. Et leo neque nunc ullamcorper.'
    },
    {
      type: 'text',
      value: `Theo truyền thuyết, Tiên Nữ và Tiên Ông đã hiện phảng phất gian gian gió. Sau khi hoàn thành công việc, họ đổi mồi và mỳ trên cuốn thần xuống hạ giới. Năm nọ, bận bịu khiến đôi cánh ai chẳng trong trần đời.`
    },
    {
      type: 'text',
      value: `Trong cơn tuyệt vọng, họ nghĩ thấy mùi hương lạ phảng phất trước gió. Theo hướng mùi hương, họ tìm đến và phát hiện rằng hoa nhỏ bé kia là hạt tam giác mạch chín đỏm sắc. Họ cày kết hạt, đến mang về ăn thì thấy ngon không khác gì ngô, gạo. Vậy từ đó, đất Hà Giang coi hoa này là tam giác mạch.`
    },
    {
      type: 'heading',
      value: 'Hoa Tam Giác Mạch – “đặc sản” Hà Giang!'
    },
    {
      type: 'text',
      value: `Tam giác mạch, hay còn gọi là mạch ba góc, là một loài cây họ rau răm, thân thảo có chu kỳ 70-80 đến 17-17. Ngoài ra, loài cây chỉ còn được người dân địa phương gọi là mạch đen, sơn, bọ sóc hoặc mạch khum.`
    },
    {
      type: 'text',
      value: `Tam giác mạch, hay Hắc mạch, hoa mạch đen (tên tiếng anh là buckwheat), là loài hoa được trồng ở vùng núi cao phía Bắc Việt Nam. Loài cây này thuộc họ đậu, sinh hoa thành vệt màu thân thành hình chùm, có dạng lá hình trái, bọc bên ngoài lớp vỏ hạt mềm.`
    },
    {
      type: 'text',
      value: `Theo kinh nghiệm của dân bản địa trồng không được mở rộng nhiều, chỉ vào được diện vùng cao trồng trên địa bàn dự trữ, ít men núi rừng, làm thuốc, làm bánh.`
    },
    {
      type: 'image',
      src: '/posts/hinh2.png',
      caption: 'Lorem ipsum dolor sit amet consectetur. Et leo neque nunc ullamcorper.'
    },
    {
      type: 'text',
      value: `Vào những ngày tiết trời dịu nhẹ chuyển sang Đông, hoa Tam Giác Mạch lại kín cổng nở rộ tím đồi. Tam Giác Mạch mọc bạt ngàn trên những cánh đồng, lạc chợ, đôi khi nổi lên chen chấm vách nhà thành những mảng hoa tuyệt đẹp. Ai lỡ dịp lễ mà kịp về lại khoảnh cứng trên kề đồi sẽ cảm nhận được cảm giác như đang sống giữa rừng dài của đất trời Hà Giang!`
    },
    {
      type: 'text',
      value: `Tìm về cánh đồng dịu lắng không ở được hương thôn ngày ngạt nhưng tuyệt lạ! bạn cho em đoan giao trường - hồng yết phía tường trong con tình yêu và hạnh phúc!`
    }
  ],
  tags: ['Hà Giang', 'Tháng 10', 'Trải nghiệm']
};

const demoRecentPosts = [
  {
    title: "Kinh nghiệm phục hồi Mộc Châu bằng xe máy",
    date: "10.03.2023",
    image: "/posts/thumb1.png",
  },
  {
    title: "Đi nhanh kẻo lỡ vườn hoa thanh thảo tím rực tựa trời Âu",
    date: "10.03.2023",
    image: "/posts/thumb1.png",
  },
  {
    title: "Sapa có homestay nào 'ngon - bổ - rẻ'?",
    date: "10.03.2023",
    image: "/posts/thumb1.png",
  },
  {
    title: "Top 11 món ăn ngon còn đậm bản nhất định phải thử",
    date: "10.03.2023",
    image: "/posts/thumb1.png",
  },
];
const demoTags = [
  "Khuyến mãi", "Du lịch Huế", "Hội An", "Khách sạn giá rẻ",
  "Ẩm thực Hà Nội", "Voucher"
];

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  // Sau này dùng params.id để fetch thực tế
  const article = demoArticle;
  const recentPosts = demoRecentPosts;
  const tags = demoTags;

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1320px] mx-auto flex flex-row gap-10 pt-6 pb-10 px-4 laptop:px-8">
        {/* Sidebar trái */}
        <aside className="hidden laptop:flex flex-col w-[270px] shrink-0 gap-8 border-r pr-8">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Nhập từ khóa..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded mb-2"
            />
            <button className="w-full bg-black text-white py-2 rounded text-sm">Tìm kiếm</button>
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
            <span className="text-black">{article.title.slice(0, 40)}...</span>
          </div>
          {/* Title */}
          <h1 className="text-2xl laptop:text-3xl font-bold mb-3 leading-tight">
            {article.title}
          </h1>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
            <span>🕓 {article.time}</span>
            <span>📅 {article.date}</span>
            <span>👤 {article.author}</span>
          </div>
          {/* Article content */}
          <article className="prose max-w-none text-base">
            {article.content.map((block, idx) => {
              if (block.type === "text") return (
                <p key={idx} className="mb-5">{block.value}</p>
              );
              if (block.type === "heading") return (
                <h2 key={idx} className="text-lg laptop:text-xl font-bold my-4">{block.value}</h2>
              );
              if (block.type === "image") return (
                <figure key={idx} className="my-5 flex flex-col items-center">
                  <Image
                    src={block.src}
                    alt="Ảnh bài viết"
                    width={800}
                    height={420}
                    className="rounded-lg object-cover max-h-[380px] w-full"
                  />
                  {block.caption && <figcaption className="text-xs text-gray-500 mt-1">{block.caption}</figcaption>}
                </figure>
              );
              return null;
            })}
          </article>
          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-black hover:text-white transition">
                #{tag}
              </span>
            ))}
          </div>
          {/* Share post */}
          <div className="mt-8 flex gap-2 items-center">
            <span className="text-sm font-medium">Share this post</span>
            {/* Icon share ở đây nếu muốn */}
          </div>
        </main>
      </div>
      {/* Footer */}
      <footer className="w-full border-t mt-10 py-6 text-sm bg-white">
        <div className="max-w-[1320px] mx-auto flex flex-wrap gap-10 px-4 laptop:px-8">
          <div className="flex-1 min-w-[200px]">
            <div className="font-semibold mb-2">Chính sách & Quy định</div>
            <div className="flex flex-col gap-1">
              <a href="#" className="hover:underline">Điều khoản & Điều kiện</a>
              <a href="#" className="hover:underline">Chính sách thanh toán</a>
              <a href="#" className="hover:underline">Chính sách bảo mật</a>
              <a href="#" className="hover:underline">Chính sách đổi trả</a>
            </div>
            <div className="text-xs text-gray-400 mt-3">© 2025 Style For You. All Rights Reserved.</div>
          </div>
          <div className="min-w-[210px]">
            <div className="font-semibold mb-2">Liên hệ</div>
            <div>Địa chỉ: Tp. Thủ Đức, Tp. HCM</div>
            <div>Email: styleforyou@gmail.com</div>
            <div>Điện thoại: 0707 654 453</div>
          </div>
          <div className="min-w-[210px]">
            <div className="font-semibold mb-2">Về chúng tôi</div>
            <div>Với S4You, bạn sẽ cảm nhận sự tinh tế trong từng đường nét thiết kế và chất liệu.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
