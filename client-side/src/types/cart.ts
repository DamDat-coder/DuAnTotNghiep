export interface ICartItem {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  originPrice:number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  liked: boolean;
  selected?: boolean;
  categoryId: string;
  stock: number;
  fromBuyNow?: boolean;
}

export interface CartProps {
  cartItems: ICartItem[];
  totalPrice: number;
  onQuantityChange: (id: string, size: string, change: number) => void;
  onToggleLike: (id: string, size: string) => void;
  onRemove: (id: string, size: string, color: string) => void;
  productsActiveStatus: { [key: string]: boolean };
}