"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useReducer,
} from "react";
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
    | "resetSelected"
    | "restoreSelection"
    | "updateSelected";
  item?: ICartItem;
  id?: string;
  size?: string;
  color?: string;
  quantity?: number;
  selectAll?: boolean;
  selectedIds?: string[];
  selected?: boolean;
}

interface CartContextType {
  items: ICartItem[];
  dispatch: React.Dispatch<CartAction>;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log("Cart reducer called with action:", action);
  switch (action.type) {
    case "updateSelected":
      const targetItem = state.items.find(
        (item) =>
          item.id === action.id &&
          item.size === action.size &&
          item.color === action.color
      );
      if (targetItem && targetItem.selected === action.selected) {
        return state;
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id &&
          item.size === action.size &&
          item.color === action.color
            ? { ...item, selected: action.selected }
            : item
        ),
      };

    case "add":
      if (!action.item) return state;
      const existingItem = state.items.find(
        (item) =>
          item.id === action.item!.id &&
          item.size === action.item!.size &&
          item.color === action.item!.color
      );
      if (
        existingItem &&
        existingItem.quantity === existingItem.quantity + action.item.quantity
      ) {
        return state;
      }
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
      if (!action.item) return state;
      const itemToUpdate = state.items.find(
        (item) => item.id === action.item!.id && item.size === action.item!.size
      );
      if (
        itemToUpdate &&
        itemToUpdate.quantity === action.item.quantity &&
        itemToUpdate.selected === action.item.selected
      ) {
        return state;
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.item!.id && item.size === action.item!.size
            ? { ...item, ...action.item }
            : item
        ),
      };

    case "remove":
      if (!action.id || !action.size || !action.color) return state;
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
      if (
        !action.id ||
        !action.size ||
        !action.color ||
        action.quantity === undefined
      )
        return state;
      const itemToChange = state.items.find(
        (item) =>
          item.id === action.id &&
          item.size === action.size &&
          item.color === action.color
      );
      if (itemToChange && itemToChange.quantity === action.quantity) {
        return state;
      }
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
      if (!action.id || !action.size || !action.color) return state;
      const itemToToggle = state.items.find(
        (item) =>
          item.id === action.id &&
          item.size === action.size &&
          item.color === action.color
      );
      if (itemToToggle) {
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
      }
      return state;

    case "toggleSelectAll":
      if (
        state.items.every(
          (item) => item.selected === (action.selectAll ?? false)
        )
      ) {
        return state;
      }
      return {
        ...state,
        items: state.items.map((item) => ({
          ...item,
          selected: action.selectAll ?? false,
        })),
      };

    case "clear":
      if (state.items.length === 0) return state;
      return { ...state, items: [] };

    case "resetSelected":
      if (state.items.every((item) => !item.selected)) return state;
      return {
        ...state,
        items: state.items.map((item) => ({ ...item, selected: false })),
      };

    case "restoreSelection":
      if (!action.selectedIds) return state;
      if (
        state.items.every(
          (item) => action.selectedIds?.includes(item.id) === item.selected
        )
      ) {
        return state;
      }
      return {
        ...state,
        items: state.items.map((item) => ({
          ...item,
          selected: action.selectedIds?.includes(item.id) ?? false,
        })),
      };

    default:
      console.log("Unknown action:", action);
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cartItems");
        return savedCart ? { items: JSON.parse(savedCart) } : { items: [] };
      } catch (error) {
        console.error("Lỗi khi đọc cartItems từ localStorage:", error);
        return { items: [] };
      }
    }
    return { items: [] };
  });

  const prevItemsRef = useRef<ICartItem[]>(state.items);

  useEffect(() => {
    if (JSON.stringify(state.items) !== JSON.stringify(prevItemsRef.current)) {
      try {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
        prevItemsRef.current = state.items;
      } catch (error) {
        console.error("Lỗi khi lưu cartItems vào localStorage:", error);
      }
    }
  }, [state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      dispatch,
      cartItemCount: state.items.length,
    }),
    [state.items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng trong CartProvider");
  }
  return context;
};

export const useCartDispatch = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartDispatch phải được dùng trong CartProvider");
  }
  return context.dispatch;
};
