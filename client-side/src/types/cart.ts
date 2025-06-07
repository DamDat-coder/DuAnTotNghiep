export interface ICartItem {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  liked: boolean;
  selected?: boolean;
}

