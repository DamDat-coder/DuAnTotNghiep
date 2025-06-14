// src/types/sale.ts

export interface Sale {
  id: number;
  code: string;
  discount: string;
  time: string;
  usage: string;
  active: boolean;
}

export const dummySales: Sale[] = [
  {
    id: 1,
    code: "TET50",
    discount: "Giảm 50.000đ (đơn từ 300K)",
    time: "01/01/2025 - 31/01/2025",
    usage: "12 / 100",
    active: true,
  },
  {
    id: 2,
    code: "FREESHIP30",
    discount: "Giảm 30.000đ (đơn từ 200K)",
    time: "01/06/2025 - 30/06/2025",
    usage: "45 / 300",
    active: true,
  },
  {
    id: 3,
    code: "SUMMER20",
    discount: "Giảm 20% (tối đa 100K)",
    time: "10/06/2025 - 20/07/2025",
    usage: "77 / 200",
    active: true,
  },
  {
    id: 4,
    code: "BLACKFRIDAY",
    discount: "Giảm 50% (cho đơn từ 300K tối đa 200K)",
    time: "25/11/2025 - 30/11/2025",
    usage: "77 / 100",
    active: true,
  },
];
