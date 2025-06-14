export interface Comment {
  id: number;
  author: string;
  content: string;
  product: string;
  time: string;
  status: "published" | "spam" | "deleted";
}

export const dummyComments: Comment[] = [
  {
    id: 1,
    author: "Lê Văn Quang",
    content:
      "Sản phẩm đúng ổn nhưng giao hàng hơi lâu, mình sẽ tiếp tục ủng hộ nhé!",
    product: "Áo thun nam cổ tròn xanh đen",
    time: "19:23 06-06-2025",
    status: "published",
  },
  {
    id: 2,
    author: "Trần Thị Hà",
    content:
      "Quảng cáo rác, link vô nghĩa, mong admin xử lý nhanh nhé! http://spamlink",
    product: "Túi xách nữ thời trang",
    time: "19:23 05-06-2025",
    status: "spam",
  },
  {
    id: 3,
    author: "Nguyễn Minh Tâm",
    content:
      "Mình chưa hài lòng lắm vì sản phẩm không giống hình, màu nhạt hơn.",
    product: "Giày thể thao nam",
    time: "07:23 05-06-2025",
    status: "deleted",
  },
  {
    id: 4,
    author: "Phạm Thị Yến",
    content:
      "Hàng đẹp, chất lượng, mình rất thích! Giao hàng nhanh, đóng gói cẩn thận.",
    product: "Quần jean nam",
    time: "09:23 04-06-2025",
    status: "published",
  },
  {
    id: 5,
    author: "Nguyễn Thị Lan",
    content:
      "Shop phục vụ nhiệt tình, giao hàng nhanh, sản phẩm đúng mô tả. Cảm ơn shop.",
    product: "Top 10 mẫu váy maxi cho mùa hè",
    time: "08:13 04-06-2025",
    status: "published",
  },
  {
    id: 6,
    author: "Trần Văn Hải",
    content: "Bạn có thể tư vấn giúp mình không",
    product: "Top 10 mẫu váy maxi cho mùa hè",
    time: "15:34 03-06-2025",
    status: "published",
  },
  {
    id: 7,
    author: "Bùi Thị Mai",
    content: "Bạn có thể tư vấn giúp mình không",
    product: "Top 10 mẫu váy maxi cho mùa hè",
    time: "15:34 03-06-2025",
    status: "published",
  },
];
