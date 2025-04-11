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
      { icon: <Mail size={16} />, text: "dsun.agency@gmail.com" },
      { icon: <Phone size={16} />, text: "0705 768 791" },
    ],
  },
  {
    id: "about_us",
    title: "Về chúng tôi",
    content: [
      "GBOX cung cấp dịch vụ thuê nơi chụp với không gian căn hộ sang trọng và view đẹp. Chúng tôi cam kết mang đến cho bạn không gian hoàn hảo để tạo nên những bức ảnh ấn tượng với mức giá hợp lý.",
    ],
  },
];
