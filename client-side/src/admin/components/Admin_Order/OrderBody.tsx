// OrderBody.tsx
import { Order } from "@/types/order";

export default function OrderBody({
  orders,
  STATUS,
}: {
  orders: Order[];
  STATUS: any[];
}) {
  const getStatusInfo = (key: string) => STATUS.find((s) => s.key === key);

  if (!orders || orders.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="text-center py-10 text-[#BDBDBD]">
          Không tìm thấy đơn hàng phù hợp
        </td>
      </tr>
    );
  }

  return (
    <>
      {orders.map((order) => {
        const status = getStatusInfo(order.status);
        const productNames = order.products
          ?.map((p) => p.productId?.name)
          .filter(Boolean)
          .join(", ");
        const userInfo = `${order.user?.name || "Không xác định"} (${order.user?.email || ""})`;

        return (
          <tr key={order.id} className="border-b hover:bg-[#F9FAFB] transition-colors duration-150">
            <td className="px-4 py-4 font-semibold text-[#202020] w-[160px]">
              {order.id}
            </td>
            <td className="px-4 py-4 w-[380px] truncate">{productNames}</td>
            <td className="px-4 py-4 w-[200px] truncate">{userInfo}</td>
            <td className="px-4 py-4 w-[156px] font-semibold text-[#212121]">
              {/* {order.date || "Không xác định"} */}
            </td>
            <td className="px-4 py-4 w-[156px] align-middle">
              <span
                className={`inline-block px-4 py-1 rounded-[8px] font-medium text-sm ${status?.color ?? ""} min-w-[118px]`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "36px",
                  background: status?.color
                    ? undefined
                    : "#F5F5F5",
                  color: status?.color
                    ? undefined
                    : "#7c7c7c",
                }}
              >
                {status?.label ?? order.status}
              </span>
            </td>
            <td className="px-4 py-4 w-[56px] text-right">
              <span className="text-xl font-semibold text-gray-500 cursor-pointer">
                ...
              </span>
            </td>
          </tr>
        );
      })}
    </>
  );
}
