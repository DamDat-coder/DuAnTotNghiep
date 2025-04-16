// src/contexts/CartContext.tsx
"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { ICartItem } from "@/types";

// Khai báo context
export const CartContext = createContext<ICartItem[] | null>(null);
export const CartDispatchContext = createContext<React.Dispatch<any> | null>(null);

// Định nghĩa type cho action
type CartAction =
  | { type: "add"; item: ICartItem }
  | { type: "update"; item: ICartItem }
  | { type: "delete"; id: string }
  | { type: "clear" };

// Reducer
export function cartReducer(cart: ICartItem[], action: CartAction): ICartItem[] {
  switch (action.type) {
    case "add": {
      const existingItem = cart.find((i) => i.id === action.item.id);
      if (existingItem) {
        return cart.map((i) =>
          i.id === action.item.id
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      }
      return [...cart, action.item];
    }

    case "update": {
      return cart.map((i) =>
        i.id === action.item.id ? { ...i, ...action.item } : i
      );
    }

    case "delete": {
      return cart.filter((i) => i.id !== action.id);
    }

    case "clear": {
      return [];
    }

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`);
  }
}

// Initial cart
export const initialCart: ICartItem[] = [];

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  return (
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
}

// Hooks tùy chỉnh
export function useCart() {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error("useCart phải được dùng trong CartProvider");
  }
  return context;
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (context === null) {
    throw new Error("useCartDispatch phải được dùng trong CartProvider");
  }
  return context;
}