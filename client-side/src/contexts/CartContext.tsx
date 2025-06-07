"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { ICartItem } from "@/types/cart";

interface CartState {
  items: ICartItem[];
}

interface CartAction {
  type: "add" | "update" | "delete" | "clear";
  item?: ICartItem;
}

export const CartContext = createContext<CartState | null>(null);
export const CartDispatchContext = createContext<React.Dispatch<CartAction> | null>(null);

const initialCart: CartState = {
  items: [],
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      if (!action.item) return state;
      const existingItem = state.items.find(
        (item) => item.id === action.item!.id && item.size === action.item!.size
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.item!.id && item.size === action.item!.size
              ? { ...item, quantity: item.quantity + action.item!.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.item],
      };
    case "update":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.item!.id && item.size === action.item!.size
            ? { ...item, ...action.item }
            : item
        ),
      };
    case "delete":
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.id === action.item!.id && item.size === action.item!.size)
        ),
      };
    case "clear":
      return { items: [] };
    default:
      throw new Error("Unknown action type");
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      parsedCart.items.forEach((item: ICartItem) => {
        dispatch({ type: "add", item });
      });
    }
  }, []);

  // Save cart to localStorage on update
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (!context) {
    throw new Error("useCartDispatch must be used within a CartProvider");
  }
  return context;
}