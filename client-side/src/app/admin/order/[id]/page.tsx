import OrderDetailClientPage from "./client-page";

export default async function OrderDetailPage(
  props: {
    params: Promise<{ _id: string }>;
  }
) {
  const params = await props.params;
  return <OrderDetailClientPage id={params._id} />;
}
