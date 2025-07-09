"use client";

import { createContext, useContext, useReducer } from "react";
import { ICartItem } from "@/types/cart";

interface CartState {
  items: ICartItem[];
}

interface CartAction {
  type:
    | "add"
    | "update"
    | "remove"
    | "updateQuantity"
    | "toggleSelect"
    | "toggleSelectAll"
    | "clear"
    | "resetSelected";
  item?: ICartItem;
  id?: string;
  size?: string;
  color?: string;
  quantity?: number;
  selectAll?: boolean;
}

interface CartContextType {
  items: ICartItem[];
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "add":
      if (!action.item) return state;
      const existingItem = state.items.find(
        (item) =>
          item.id === action.item!.id &&
          item.size === action.item!.size &&
          item.color === action.item!.color
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.item!.id &&
            item.size === action.item!.size &&
            item.color === action.item!.color
              ? { ...item, quantity: item.quantity + action.item!.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };

    case "update":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.item!.id && item.size === action.item!.size
            ? { ...item, ...action.item }
            : item
        ),
      };
    case "remove":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.id === action.id &&
              item.size === action.size &&
              item.color === action.color
            )
        ),
      };

    case "updateQuantity":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id &&
          item.size === action.size &&
          item.color === action.color
            ? { ...item, quantity: action.quantity || 1 }
            : item
        ),
      };

    case "toggleSelect":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id &&
          item.size === action.size &&
          item.color === action.color
            ? { ...item, selected: !item.selected }
            : item
        ),
      };

    case "toggleSelectAll":
      return {
        ...state,
        items: state.items.map((item) => ({
          ...item,
          selected: action.selectAll ?? false,
        })),
      };

    case "clear":
      return { ...state, items: [] };

    case "resetSelected":
      return {
        ...state,
        items: state.items.map((item) => ({ ...item, selected: false })),
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  return (
    <CartContext.Provider value={{ items: state.items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const useCartDispatch = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartDispatch must be used within a CartProvider");
  }
  return context.dispatch;
};
