export interface News {
  id: number;
  author: string;
  title: string;
  category: string;
  date: string;
  status: "published" | "draft" | "upcoming";
}

export const dummyNews: News[] = [
  {
    id: 1,
    author: "Hà Nhựt Tân",
    title: "5 xu hướng thời trang hè 2025",
    category: "Thời trang",
    date: "30/05/2025",
    status: "published",
  },
  {
    id: 2,
    author: "Hà Nhựt Tân",
    title: "Cách phối đồ công sở thanh lịch",
    category: "Thời trang",
    date: "29/06/2025",
    status: "upcoming",
  },
  {
    id: 3,
    author: "Hà Nhựt Tân",
    title: "Top 10 mẫu váy maxi cho mùa hè",
    category: "Trang phục nữ",
    date: "28/05/2025",
    status: "draft",
  },
];
