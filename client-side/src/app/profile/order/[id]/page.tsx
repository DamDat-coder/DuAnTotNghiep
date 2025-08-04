import OrderDetail from "@/components/Profile/tabs/OrderDetail";



export default async function OrderDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  return <OrderDetail orderId={params.id} />;
}
