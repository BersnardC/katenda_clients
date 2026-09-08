import { OrderDetailPage } from "@/components/account/OrderDetailPage";

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailPage orderUuid={id} />;
}
