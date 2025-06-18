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
      { text: "Điều khoản & Điều kiện", href: "/policies/terms" },
      { text: "Chính sách thanh toán", href: "/policies/payment" },
      { text: "Chính sách xác minh thông tin", href: "/policies/verification" },
      { text: "Câu hỏi thường gặp", href: "/faq" },
      { text: "Chính sách hủy và hoàn tiền", href: "/policies/refund" },
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
      { icon: <Mail size={16} />, text: "style.for.you@gmail.com" },
      { icon: <Phone size={16} />, text: "0707 654 435" },
    ],
  },
  {
    id: "about_us",
    title: "Về chúng tôi",
    content: [
      "Với Shop4Real – nơi bạn tìm thấy phong cách riêng trong từng thiết kế thời trang. Chúng tôi không chỉ bán quần áo, mà còn đồng hành cùng bạn thể hiện cá tính – từ năng động đường phố, thanh lịch công sở đến độc đáo, cá tính. Bộ sưu tập luôn được chọn lọc kỹ lưỡng theo xu hướng mới nhất.",
    ],
  },
];
