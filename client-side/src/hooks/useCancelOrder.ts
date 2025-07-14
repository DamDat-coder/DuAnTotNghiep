import { useState } from "react";
import { toast } from "react-hot-toast";
import { IOrder } from "@/types/order";
import { cancelOrder } from "@/services/orderApi";

export const useCancelOrder = (
  orders: IOrder[],
  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>
) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async (orderId: string) => {
    setIsCancelling(true);
    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
      toast.success("Đã hủy đơn hàng thành công!");
    } catch (error: any) {
      toast.error(error.message || "Không thể hủy đơn hàng!");
      console.error("Error cancelling order:", error);
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const openCancelModal = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  return {
    showCancelModal,
    orderToCancel,
    isCancelling,
    handleCancelOrder,
    openCancelModal,
    closeCancelModal,
  };
};
