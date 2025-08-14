// src/components/Core/Layout/Footer/data.ts
import { Mail, MapPin, Phone } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho content
interface FooterContentItem {
  text: string;
  href?: string;
  icon?: React.ReactNode; // icon là một React Node (có thể là component như MapPin)
}

// Định nghĩa kiểu dữ liệu cho section
interface FooterSection {
  id: string;
  title: string;
  content: Array<string | FooterContentItem>;
}

// Dữ liệu cho các section trong Footer
export const footerSections: FooterSection[] = [
  {
    id: "policies",
    title: "Chính sách & Quy định",
    content: [
      {
        text: "Điều khoản & Điều kiện",
        href: "/posts/6884e3e9cd10a3213c943610",
      },
      {
        text: "Chính sách thanh toán",
        href: "/posts/6884e3e9cd10a3213c943611",
      },
      {
        text: "Chính sách xác minh thông tin",
        href: "/posts/6884e3e9cd10a3213c943612",
      },
      { text: "Câu hỏi thường gặp", href: "/posts/6884e3e9cd10a3213c943613" },
      {
        text: "Chính sách hủy và hoàn tiền",
        href: "/posts/6884e3e9cd10a3213c943614",
      },
    ],
  },
  {
    id: "contact",
    title: "Liên hệ",
    content: [
      {
        icon: <MapPin size={16} />,
        text: "Đ. Tô Ký, Tân Hưng Thuận, Quận 12, HCM",
      },
      { icon: <Mail size={16} />, text: "shop.for.real@gmail.com" },
      { icon: <Phone size={16} />, text: "0707 654 435" },
    ],
  },
  {
    id: "about_us",
    title: "Về chúng tôi",
    content: [
      "Với Shop For Real – nơi bạn tìm thấy phong cách riêng trong từng thiết kế thời trang. Chúng tôi không chỉ bán quần áo, mà còn đồng hành cùng bạn thể hiện cá tính – từ năng động đường phố, thanh lịch công sở đến độc đáo, cá tính. Bộ sưu tập luôn được chọn lọc kỹ lưỡng theo xu hướng mới nhất.",
    ],
  },
];
