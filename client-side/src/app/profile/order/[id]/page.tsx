import OrderDetail from "@/components/Profile/tabs/OrderDetail";



export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderDetail orderId={params.id} />;
}
