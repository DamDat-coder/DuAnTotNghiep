import OrderDetail from "@/components/Profile/Tabs/OrderDetail";


export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderDetail orderId={params.id} />;
}
