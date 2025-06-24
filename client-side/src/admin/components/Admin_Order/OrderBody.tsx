import { Order } from "@/types/order";

function formatDate(dateString?: string) {
  if (!dateString) return "Không xác định";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

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
        // Tên sản phẩm tối đa 2 tên, mỗi tên 1 dòng, thừa in "và N sản phẩm khác"
        const productList = (order.products || []).map((p) => p.productId?.name).filter(Boolean);
        // Hiển thị sản phẩm: thuần HTML, không div ngoài tbody!
        const productsRender = (
          <>
            {productList.slice(0, 2).map((name, idx) => (
              <div key={order.id + "-prod-" + idx} className="truncate leading-5">
                {name}
              </div>
            ))}
            {productList.length > 2 && (
              <div className="text-gray-400 text-sm">
                ...và {productList.length - 2} sản phẩm khác
              </div>
            )}
          </>
        );

        // Thông tin người dùng
        const user = order.user || { name: "Không xác định", email: "" };
        const userInfo = (
          <>
            <div className="truncate font-medium">{user.name}</div>
            <div className="truncate text-gray-400 text-xs">{user.email}</div>
          </>
        );

        // Ngày tạo
        const createdDate = formatDate(order.date || order.createdAt);

        // Trạng thái
        const status = getStatusInfo(order.status);

        return (
          <tr
            key={order.id || order._id}
            className="border-b hover:bg-[#F9FAFB] transition-colors duration-150"
          >
            <td className="px-4 py-4 font-semibold text-[#202020] w-[130px] max-w-[130px] truncate">
              {order.id || order._id}
            </td>
            <td className="px-4 py-4 w-[380px] max-w-[380px]">
              {productsRender}
            </td>
            <td className="px-4 py-4 w-[200px] max-w-[200px]">{userInfo}</td>
            <td className="px-4 py-4 w-[156px] font-semibold text-[#212121] max-w-[156px] truncate">
              {createdDate}
            </td>
            <td className="px-4 py-4 w-[156px] align-middle max-w-[156px]">
              <span
                className={`inline-block px-4 py-1 rounded-[8px] font-medium text-sm ${status?.color ?? ""} min-w-[118px]`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "36px",
                  background: status?.color ? undefined : "#F5F5F5",
                  color: status?.color ? undefined : "#7c7c7c",
                }}
              >
                {status?.label ?? order.status}
              </span>
            </td>
            <td className="px-4 py-4 w-[56px] text-right max-w-[56px]">
              <span className="text-xl font-semibold text-gray-500 cursor-pointer">...</span>
            </td>
          </tr>
        );
      })}
    </>
  );
}
