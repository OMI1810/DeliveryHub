import type { Metadata } from "next";
import { OrderDetail } from "./OrderDetail";

export const metadata: Metadata = {
  title: "Заказ | DeliveryHub",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <OrderDetail params={params} />;
}
