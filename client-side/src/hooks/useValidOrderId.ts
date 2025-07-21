// hooks/useValidOrderId.ts
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { IOrder } from "@/types/order";
import { fetchOrdersUser } from "@/services/orderApi";

export function useValidOrderId(productId: string) {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getValidOrderId() {
      if (!user?.id || !productId) return;

      try {
        const res = await fetchOrdersUser(user.id);
        const orders: IOrder[] = res.data;

        const matchedOrder = orders.find(
          (order) =>
            order.status === "delivered" &&
            order.items.some((item) => item.productId === productId)
        );

        if (matchedOrder) {
          setOrderId(matchedOrder._id);
        } else {
          setOrderId(null);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrderId(null);
      } finally {
        setLoading(false);
      }
    }

    getValidOrderId();
  }, [productId, user?.id]);

  return { orderId, loading };
}
